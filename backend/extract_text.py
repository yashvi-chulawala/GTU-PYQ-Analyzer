import os
from pdf2image import convert_from_path
import pytesseract
import sys
from pathlib import Path

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

POPPLER_PATH = r"C:\Users\Yashvi Chulawala\Downloads\Release-26.02.0-0\poppler-26.02.0\Library\bin"

subject = sys.argv[1]

BASE_DIR = Path(__file__).parent
SUBJECT_DIR = BASE_DIR / "subjects" / subject

pdf_folder = SUBJECT_DIR / "papers"
texts_folder = SUBJECT_DIR / "texts"

texts_folder.mkdir(parents=True, exist_ok=True)

for pdf_file in os.listdir(pdf_folder):

    if pdf_file.endswith(".pdf"):

        pdf_path = os.path.join(pdf_folder, pdf_file)

        txt_path = texts_folder / pdf_file.replace(".pdf", ".txt")

        if txt_path.exists():
            print(f"⏭ Skipping {pdf_file} (already processed)")
            continue

        print(f"Processing: {pdf_file}")

        images = convert_from_path(
            pdf_path,
            poppler_path=POPPLER_PATH
        )

        text = ""

        for img in images:
            text += pytesseract.image_to_string(img)

        txt_path = texts_folder / pdf_file.replace(".pdf", ".txt")

        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text)

