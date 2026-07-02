import subprocess

subject = input("Enter subject: ")

scripts = [
    "extract_text.py",
    "que_extracter.py",
    "unit_wise_topic.py",
    "topics.py",
    "topic_wise.py",
]

for script in scripts:
    print(f"\nRunning {script}...")
    subprocess.run(
        ["python", script, subject],
        check=True
    )

print("\n Subject rebuilt successfully!")