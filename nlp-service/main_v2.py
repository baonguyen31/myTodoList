from fastapi import FastAPI
from pydantic import BaseModel
from underthesea import word_tokenize
from transformers import AutoTokenizer, AutoModelForTokenClassification
from datetime import datetime, timedelta
import torch
import re

# import toàn bộ hàm rule-based từ main cũ làm fallback
from main import (
    extract_date_to_datetime,
    clean_title,
    extract_priority,
    parse_vietnamese_relative_date,
    extract_hour_from_text,
)

app = FastAPI()

# ── Load PhoBERT ───────────────────────────────────────────────────────────────
MODEL_PATH = "./model"
LABELS     = ["O","B-TASK","I-TASK","B-TIME","I-TIME","B-DATE","I-DATE"]
id2label   = {i: l for i, l in enumerate(LABELS)}

print("Loading PhoBERT...")
ner_tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, use_fast=False)
ner_model     = AutoModelForTokenClassification.from_pretrained(MODEL_PATH)
ner_model.eval()
PHOBERT_READY = True
print("PhoBERT ready!")

# ── Schemas ───────────────────────────────────────────────────────────────────
class PromptRequest(BaseModel):
    prompt:   str
    maxTasks: int = 5

class TaskSuggestion(BaseModel):
    title:       str
    description: str
    priority:    str
    dueDate:     str


# ── PhoBERT NER ───────────────────────────────────────────────────────────────

def predict_ner(sentence: str) -> list[tuple[str, str]]:
    tokens       = word_tokenize(sentence, format="text").split()
    tokens_clean = [t.replace("_", " ") for t in tokens]

    subwords    = []
    word_starts = []
    for word in tokens_clean:
        sws = ner_tokenizer.tokenize(word) or [ner_tokenizer.unk_token]
        word_starts.append(len(subwords))
        subwords.extend(sws)

    input_ids = torch.tensor([[
        ner_tokenizer.cls_token_id,
        *ner_tokenizer.convert_tokens_to_ids(subwords[:126]),
        ner_tokenizer.sep_token_id,
    ]])

    with torch.no_grad():
        logits = ner_model(input_ids=input_ids).logits

    preds = logits.argmax(dim=-1).squeeze().tolist()

    result = []
    for i, tok in enumerate(tokens):
        pos   = word_starts[i] + 1
        label = id2label.get(preds[pos], "O") if pos < len(preds) else "O"
        result.append((tok, label))

    return result


def extract_entities(ner_result: list[tuple[str, str]]) -> dict:
    task_tokens = []
    time_tokens = []
    date_tokens = []

    for tok, lab in ner_result:
        clean = tok.replace("_", " ")
        if "TASK" in lab:   task_tokens.append(clean)
        elif "TIME" in lab: time_tokens.append(clean)
        elif "DATE" in lab: date_tokens.append(clean)

    return {
        "task": " ".join(task_tokens).strip(),
        "time": " ".join(time_tokens).strip(),
        "date": " ".join(date_tokens).strip(),
    }

def entities_to_datetime(time_str: str, date_str: str, original_text: str) -> str:
    # Luôn dùng original_text để giữ đầy đủ ngữ cảnh buổi (sáng/chiều/tối)
    # vì PhoBERT có thể không trích xuất được từ buổi trong TIME entity
    source_to_parse = original_text if original_text.strip() else f"{date_str} {time_str}".strip()
    
    dt = extract_date_to_datetime(source_to_parse, None)
    return dt.isoformat()


# ── Main endpoint ─────────────────────────────────────────────────────────────

@app.post("/extract", response_model=list[TaskSuggestion])
def extract_tasks(request: PromptRequest):
    parts = [p.strip() for p in request.prompt.split(",") if p.strip()]
    parts = parts[:request.maxTasks]
    tasks = []
    last_date = None

    for part in parts:
        title    = None
        due_date = None

        # ── Thử PhoBERT trước ────────────────────────────────────────────────
        if PHOBERT_READY:
            try:
                ner_result = predict_ner(part)
                entities   = extract_entities(ner_result)

                print(f"[PhoBERT] '{part}'")
                print(f"  task='{entities['task']}' time='{entities['time']}' date='{entities['date']}'")

                # Dùng title từ PhoBERT nếu tìm được
                if entities["task"]:
                    title = entities["task"]

                # Dùng rule-based để convert datetime
                if entities["time"] or entities["date"]:
                    due_date = entities_to_datetime(
                        entities["time"],
                        entities["date"],
                        part
                    )

            except Exception as e:
                print(f"[PhoBERT] Lỗi: {e} → fallback rule-based")

        # ── Fallback rule-based nếu PhoBERT không cho kết quả ────────────────
        if not title:
            title = clean_title(part)

        if not due_date:
            dt = extract_date_to_datetime(part, last_date)
            due_date = dt.isoformat()
            last_date = dt.date()

        tasks.append(TaskSuggestion(
            title       = title or part,
            description = part,
            priority    = extract_priority(part),
            dueDate     = due_date,
        ))

        print(f"[Result] title='{title}' dueDate='{due_date}'\n")

    return tasks