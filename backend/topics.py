import json
import sys
from pathlib import Path
import google.generativeai as genai

genai.configure(api_key="AQ.Ab8RN6Ly82T-_XCVsiOQN-Gn4N8NNbnyCi-spV0raDwXy_5Ntg")

model = genai.GenerativeModel("gemini-2.5-flash")

# ── Path setup ────────────────────────────────────────────────────────────────
subject = sys.argv[1]
BASE_DIR = Path(__file__).parent
SUBJECT_DIR = BASE_DIR / "subjects" / subject
SUBJECT_DIR.mkdir(parents=True, exist_ok=True)

# ── Input files ───────────────────────────────────────────────────────────────
WEBSITE_DATA_FILE = SUBJECT_DIR / "website_data.json"
SYLLABUS_FILE     = SUBJECT_DIR / f"{subject}_syllabus.json"

# ── Output files ──────────────────────────────────────────────────────────────
ALL_TOPICS_FILE = SUBJECT_DIR / "all_topics.json"

# Load questions grouped by unit
with open(WEBSITE_DATA_FILE, "r", encoding="utf-8") as f:
    website_data = json.load(f)

# Load syllabus
with open(SYLLABUS_FILE, "r", encoding="utf-8") as f:
    syllabus = json.load(f)

all_results = []

for unit in syllabus["units"]:

    unit_no = str(unit["unit"])

    if unit_no not in website_data:
        continue

    unit_name = unit["title"]

    questions = website_data[unit_no]["questions"]

    topic_names = [
        topic["name"]
        for topic in unit["topics"]
    ]

    prompt = f"""
You are an expert Operating System professor.

UNIT NUMBER:
{unit_no}

UNIT NAME:
{unit_name}

AVAILABLE TOPICS:

{json.dumps(topic_names, indent=2)}

QUESTIONS:

{json.dumps(questions, indent=2)}

TASK:

For each question:

1. Unit number = {unit_no}
2. Unit name = "{unit_name}"
3.Identify ONE Primary Topic.
4.Identify ALL relevant topics.
5. Difficulty:
   - Easy
   - Medium
   - Hard

IMPORTANT:

- Topic MUST be selected from AVAILABLE TOPICS.
- NEVER create a new topic.
- NEVER modify topic names.
- NEVER shorten topic names.
- NEVER combine topics.
- Return topic EXACTLY as written.

PRIMARY TOPIC RULE:

Choose the single MOST IMPORTANT topic for the question.
This will be used as the main category in the website.
Every question MUST have exactly ONE primary topic.

MULTI-TOPIC RULE:

Include ALL syllabus topics covered by the question.
A question may belong to multiple topics.
If a question discusses 3 syllabus topics, include all 3.
The primary topic MUST also be included inside topics[].

Return ONLY valid JSON.

FORMAT:

[
{{
"question_no": "Q1a",
"question": "Explain FCFS scheduling.",
"year": "S2025",
"unit_number": 2,
"unit_name": "Process and Threads Management",
"primary_topic": "FCFS",
"topics": [
"FCFS"
],
"difficulty": "Easy"
}}
]
"""

    print(f"Processing Unit {unit_no}")
    try:

        response = model.generate_content(prompt)

        text = response.text

        text = text.replace("```json", "")
        text = text.replace("```", "")
        text = text.strip()

        result = json.loads(text)

        all_results.extend(result)

        print(f"Unit {unit_no} done")

    except Exception as e:
        print(f"Unit {unit_no} failed")
        print(e)

with open(ALL_TOPICS_FILE, "w", encoding="utf-8") as f:
    json.dump(all_results, f, indent=4, ensure_ascii=False)

print(f"Done. Total Records: {len(all_results)}")