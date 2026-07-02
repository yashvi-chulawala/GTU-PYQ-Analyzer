import json
from collections import defaultdict

# Load topic analysis
with open("topic_analysis.json", "r", encoding="utf-8") as f:
    data = json.load(f)

grouped = defaultdict(lambda: {
    "unit_no": "",
    "unit_name": "",
    "frequency": 0,
    "questions": []
})

for item in data:
    topic = item["topic"]

    grouped[topic]["unit_no"] = item["unit_no"]
    grouped[topic]["unit_name"] = item["unit_name"]

    grouped[topic]["frequency"] += 1

    grouped[topic]["questions"].append({
        "question_no": item["question_no"],
        "question": item["question"]
    })

# Add importance level
for topic in grouped:

    count = grouped[topic]["frequency"]

    if count >= 5:
        grouped[topic]["importance"] = "Most Important"

    elif count >= 3:
        grouped[topic]["importance"] = "Important"

    elif count >= 2:
        grouped[topic]["importance"] = "Moderate"

    else:
        grouped[topic]["importance"] = "Less Important"

# Save output
with open("grouped_topics.json", "w", encoding="utf-8") as f:
    json.dump(grouped, f, indent=4)

print("grouped_topics.json created")