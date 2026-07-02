import json
import sys
from pathlib import Path

# ── Path setup ────────────────────────────────────────────────────────────────
subject = sys.argv[1]
BASE_DIR = Path(__file__).parent
SUBJECT_DIR = BASE_DIR / "subjects" / subject
SUBJECT_DIR.mkdir(parents=True, exist_ok=True)

# ── Input files ───────────────────────────────────────────────────────────────
ALL_TOPICS_FILE = SUBJECT_DIR / "all_topics.json"

# ── Output files ──────────────────────────────────────────────────────────────
TOPIC_CARDS_FILE = SUBJECT_DIR / "topic_cards.json"

with open(ALL_TOPICS_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

units = {}

for item in data:

    unit_no = str(item["unit_number"])
    unit_name = item["unit_name"]

    if unit_no not in units:
        units[unit_no] = {
            "unit_name": unit_name,
            "topics": {}
        }

    # Loop through ALL topics
    for topic in item["topics"]:

        if topic not in units[unit_no]["topics"]:

            units[unit_no]["topics"][topic] = {
                "frequency": 0,
                "questions": []
            }

        units[unit_no]["topics"][topic]["frequency"] += 1

        units[unit_no]["topics"][topic]["questions"].append({
            "year": item["year"],
            "question_no": item["question_no"],
            "question": item["question"]
        })

final_data = {}

for unit_no, unit_data in units.items():

    final_data[unit_no] = {
        "unit_name": unit_data["unit_name"],
        "Most Important": [],
        "Important": [],
        "Moderate": [],
        "Less Important": []
    }

    for topic, info in unit_data["topics"].items():

        freq = info["frequency"]

        card = {
            "topic": topic,
            "frequency": freq,
            "questions": info["questions"]
        }

        if freq >= 5:
            final_data[unit_no]["Most Important"].append(card)

        elif freq >= 3:
            final_data[unit_no]["Important"].append(card)

        elif freq >= 2:
            final_data[unit_no]["Moderate"].append(card)

        else:
            final_data[unit_no]["Less Important"].append(card)

with open(TOPIC_CARDS_FILE, "w", encoding="utf-8") as f:
    json.dump(final_data, f, indent=4, ensure_ascii=False)

print(f"topic_cards.json created for subject: {subject}")