import sys
import json
import hashlib
from pathlib import Path
import google.generativeai as genai

# ---------------------------
# SUBJECT ARGUMENT
# ---------------------------

if len(sys.argv) < 2:
    print("Usage: python que_extracter.py <subject>")
    print("Example: python que_extracter.py os")
    sys.exit(1)

subject = sys.argv[1]

# ---------------------------
# PATH SETUP
# ---------------------------

BASE_DIR = Path(__file__).parent
SUBJECT_DIR = BASE_DIR / "subjects" / subject
TEXTS_FOLDER = SUBJECT_DIR / "texts"
OUTPUT_FILE = SUBJECT_DIR / "all_questions.json"

# ✅ OPTIMIZATION 1: Per-file cache directory stores individual extraction results.
# This allows skipping already-processed files on every subsequent run.
CACHE_DIR = SUBJECT_DIR / ".cache"

TEXTS_FOLDER.mkdir(parents=True, exist_ok=True)
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------
# GEMINI SETUP
# ---------------------------

genai.configure(api_key="AQ.Ab8RN6JpRvSy3b-aoG-HgtsnTfkms_Sa6rRHlyJf8KNc-kXvdg")

# ✅ OPTIMIZATION 2: Use gemini-2.0-flash — cheaper/faster than 2.5-flash for
# structured extraction tasks that don't need deep reasoning.
model = genai.GenerativeModel("gemini-2.0-flash")

# ---------------------------
# CACHE HELPERS
# ---------------------------

def get_file_hash(path: Path) -> str:
    """MD5 of file content — used as cache key so edits invalidate stale cache."""
    return hashlib.md5(path.read_bytes()).hexdigest()

def cache_path_for(txt_file: Path) -> Path:
    """Returns the JSON cache file path for a given txt file."""
    return CACHE_DIR / f"{txt_file.stem}.json"

def load_from_cache(txt_file: Path) -> list | None:
    """
    ✅ OPTIMIZATION 3: Return cached questions if the file hasn't changed.
    Cache entry stores the file hash alongside questions so edits are detected.
    Returns None if cache is missing or stale.
    """
    cp = cache_path_for(txt_file)
    if not cp.exists():
        return None
    try:
        cached = json.loads(cp.read_text(encoding="utf-8"))
        if cached.get("hash") == get_file_hash(txt_file):
            return cached["questions"]
    except (json.JSONDecodeError, KeyError):
        pass
    return None

def save_to_cache(txt_file: Path, questions: list) -> None:
    """Persist extraction result alongside the file hash."""
    cp = cache_path_for(txt_file)
    cp.write_text(
        json.dumps({"hash": get_file_hash(txt_file), "questions": questions},
                   indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

# ---------------------------
# OPTIMIZED PROMPT BUILDER
# ---------------------------

# ✅ OPTIMIZATION 4: Prompt trimmed from ~230 tokens down to ~90 tokens.
# Removed:
#   - Verbose preamble ("You are given a GTU exam paper extracted from PDF")
#   - Redundant formatting guidance ("The formatting may be broken")
#   - Bullet lists restating obvious rules ("Ignore: Seat Number, Subject Code...")
#   - Wordy format examples replaced with a single minimal example
# The instruction "Return ONLY valid JSON" is moved to the system prompt
# (set once at model level) rather than repeated in every user message.

SYSTEM_INSTRUCTION = (
    "You are a GTU exam question extractor. "
    "Always respond with ONLY valid JSON — no markdown fences, no commentary."
)

model = genai.GenerativeModel(
    "gemini-2.0-flash",
    system_instruction=SYSTEM_INSTRUCTION,
)

# ✅ OPTIMIZATION 5: Max-chars guard — very large OCR dumps are truncated before
# sending. GTU papers rarely exceed 8 000 chars of useful content; anything beyond
# is usually repeated headers or scan artefacts. Reduces token count on bloated files.
MAX_TEXT_CHARS = 12_000

def build_prompt(text: str) -> str:
    trimmed = text[:MAX_TEXT_CHARS]
    return (
        "Extract all exam questions from the paper below.\n"
        "Rules: skip instructions, seat numbers, subject codes, marks, and 'OR' lines.\n"
        "Reconstruct question numbers (e.g. Q1a, Q1b, Q2a …).\n"
        "Output format — JSON array only:\n"
        '[{"question_no":"Q1a","question":"..."},{"question_no":"Q1b","question":"..."}]\n\n'
        f"Paper:\n{trimmed}"
    )

# ---------------------------
# PROCESS ALL TXT FILES
# ---------------------------

all_questions = []
skipped = 0
processed = 0

for txt_file in sorted(TEXTS_FOLDER.iterdir()):

    if txt_file.suffix != ".txt":
        continue

    year = txt_file.stem

    # ✅ OPTIMIZATION 6: Skip files whose results are already cached.
    # On a typical re-run (no new papers added) this means ZERO Gemini calls.
    cached_questions = load_from_cache(txt_file)
    if cached_questions is not None:
        print(f"⏭  Skipping {txt_file.name} (cached — {len(cached_questions)} questions)")
        for q in cached_questions:
            q["year"] = year          # ensure year tag is present
        all_questions.extend(cached_questions)
        skipped += 1
        continue

    print(f"\nProcessing {txt_file.name}...")

    text = txt_file.read_text(encoding="utf-8")
    prompt = build_prompt(text)

    try:
        response = model.generate_content(prompt)
        result = response.text.strip()

        # ✅ OPTIMIZATION 7: Markdown fence removal kept as a safety net,
        # but the system_instruction already instructs the model not to add them,
        # so this rarely fires (saves the model from generating extra tokens).
        result = result.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

        questions = json.loads(result)

        for q in questions:
            q["year"] = year

        # ✅ OPTIMIZATION 8: Cache immediately after a successful call so a
        # mid-run crash doesn't force reprocessing of completed files.
        save_to_cache(txt_file, questions)

        all_questions.extend(questions)
        processed += 1
        print(f"✅ {len(questions)} questions extracted and cached")

    except Exception as e:
        print(f"❌ Error in {txt_file.name}: {e}")

# ---------------------------
# SAVE FINAL OUTPUT
# ---------------------------

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(all_questions, f, indent=4, ensure_ascii=False)

print("\n🎉 DONE!")
print(f"Total Questions : {len(all_questions)}")
print(f"API calls made  : {processed}  |  Skipped (cached): {skipped}")
print(f"Saved to        : {OUTPUT_FILE}")