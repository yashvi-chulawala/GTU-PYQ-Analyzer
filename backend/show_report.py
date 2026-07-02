import json

with open("grouped_topics.json", "r", encoding="utf-8") as f:
    data = json.load(f)

topics = sorted(
    data.items(),
    key=lambda x: x[1]["frequency"],
    reverse=True
)

for topic, info in topics:

    print("\n" + "=" * 50)

    print(f"TOPIC: {topic}")
    print(f"UNIT : {info['unit_name']}")
    print(f"ASKED: {info['frequency']} times")
    print(f"LEVEL: {info['importance']}")

    print("\nQuestions:")

    for q in info["questions"][:3]:
        print(f"- {q['question']}")