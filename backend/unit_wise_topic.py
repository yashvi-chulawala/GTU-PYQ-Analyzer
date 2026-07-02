import sys
import json
from pathlib import Path
from collections import defaultdict

# ---------------------------
# SUBJECT ARGUMENT
# ---------------------------

if len(sys.argv) < 2:
    print("Usage: python unit_wise_topic.py <subject>")
    print("Example: python unit_wise_topic.py os")
    sys.exit(1)

subject = sys.argv[1]

# ---------------------------
# PATH SETUP
# ---------------------------

BASE_DIR = Path(__file__).parent
SUBJECT_DIR = BASE_DIR / "subjects" / subject

# ✏️ CHANGED: hardcoded "all_topics.json" → scoped inside SUBJECT_DIR
INPUT_FILE = SUBJECT_DIR / "all_topics.json"

# ✏️ CHANGED: hardcoded "website_data.json" → scoped inside SUBJECT_DIR
OUTPUT_FILE = SUBJECT_DIR / "website_data.json"

# Auto-create subject folder if it doesn't exist
SUBJECT_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------
# PROCESS TOPICS
# ---------------------------

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

units = defaultdict(lambda: {
    "unit_name": "",
    "questions": []
})

for item in data:

    unit_no = item["unit_number"]

    units[unit_no]["unit_name"] = item["unit_name"]

    units[unit_no]["questions"].append({
        "year": item["year"],
        "question_no": item["question_no"],
        "question": item["question"]
    })

# ---------------------------
# SAVE OUTPUT
# ---------------------------

# ✏️ CHANGED: hardcoded "website_data.json" → OUTPUT_FILE inside SUBJECT_DIR
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(units, f, indent=4, ensure_ascii=False)

print(f"✅ website_data.json created at {OUTPUT_FILE}")