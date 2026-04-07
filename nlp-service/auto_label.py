import json
import re
from underthesea import word_tokenize

NUMBER_RE = re.compile(r"^\d+$")

# ── Các mẫu câu để tự sinh dataset ────────────────────────────────────────────

TASK_TEMPLATES = [
    "Họp với {person}",
    "Gặp {person}",
    "Gửi báo cáo cho {person}",
    "Ăn trưa với {person}",
    "Gọi điện cho {person}",
    "Nộp bài tập",
    "Làm bài thuyết trình",
    "Đi mua sắm",
    "Tập thể dục",
    "Đọc sách",
    "Viết email",
    "Chuẩn bị tài liệu",
    "Kiểm tra code",
    "Review pull request",
    "Deploy ứng dụng",
]

PERSON_TEMPLATES = [
    "sếp", "đối tác", "khách hàng", "nhóm", "team",
    "bạn bè", "gia đình", "giáo viên", "sinh viên",
]

TIME_TEMPLATES = [
    "lúc {h} giờ sáng",
    "lúc {h} giờ chiều",
    "lúc {h} giờ tối",
    "lúc {h}h",
    "vào lúc {h} giờ",
    "{h} giờ sáng",
    "{h} giờ chiều",
    "{h}h sáng",
    "{h}h chiều",
]

DATE_TEMPLATES = [
    "ngày mai",
    "hôm nay",
    "tuần sau",
    "thứ hai",
    "thứ ba",
    "thứ tư",
    "thứ năm",
    "thứ sáu",
    "thứ bảy",
    "ngày {d} tháng {m}",
    "hôm kia",
    "tháng sau",
]

HOURS_AM = [7, 8, 9, 10, 11]
HOURS_PM = [1, 2, 3, 4, 5, 6, 7, 8]


# ── Auto-labeler ───────────────────────────────────────────────────────────────

# Thêm vào DATE_WORDS các token ghép của underthesea
DATE_WORDS = {
    'mai', 'hôm', 'nay', 'kia', 'tuần', 'sau', 'tháng',
    'ngày', 'thứ', 'hai', 'ba', 'tư', 'năm', 'sáu', 'bảy',
    'chủ', 'nhật', 'mốt',
    # token ghép của underthesea
    'ngày_mai', 'hôm_nay', 'hôm_kia', 'tuần_sau',
    'tháng_sau', 'thứ_hai', 'thứ_ba', 'thứ_tư',
    'thứ_năm', 'thứ_sáu', 'thứ_bảy', 'chủ_nhật',
}

# Tương tự cho TIME_WORDS
TIME_WORDS = {
    'giờ', 'h', 'sáng', 'chiều', 'tối', 'am', 'pm',
    # token ghép
    'buổi_sáng', 'buổi_chiều', 'buổi_tối',
}

SKIP_WORDS = {
    'với', 'cho', 'của', 'vào', 'tại', 'trên', 'cùng', 'đến',
    'khi', 'vì', 'nhưng', 'là', 'để', 'mà', 'và',
}

TASK_ENDERS = {'với', 'cho', 'cùng', 'và'}

# Từ connector thời gian — luôn là O, reset in_task
TIME_CONNECTORS = {'lúc', 'vào', 'vào_lúc', 'khoảng', 'từ'}


def auto_label(sentence: str) -> dict | None:
    tokens = word_tokenize(sentence, format="text").split()
    if not tokens:
        return None

    labels = []
    i = 0
    in_task = False
    found_time = False
    found_date = False
    in_date = False  # theo dõi đang trong cụm ngày không

    while i < len(tokens):
        tok = tokens[i].lower()

        # ── Token ghép chứa ngày (ngày_mai, hôm_nay...) ──────────────────────
        if tok in DATE_WORDS and '_' in tok:
            label = "I-DATE" if found_date else "B-DATE"
            labels.append(label)
            found_date = True
            in_task = False
            in_date = True
            i += 1
            continue

        # ── Số + giờ/h → TIME ─────────────────────────────────────────────────
        if NUMBER_RE.match(tok):
            next_tok = tokens[i+1].lower() if i+1 < len(tokens) else ""
            two_ahead = tokens[i+2].lower() if i+2 < len(tokens) else ""

            # số giờ: "9 giờ", "9h"
            if next_tok in {'giờ', 'h'}:
                labels.append("B-TIME")
                i += 1
                labels.append("I-TIME")
                i += 1
                # sáng/chiều/tối sau giờ
                while i < len(tokens) and tokens[i].lower() in {'sáng', 'chiều', 'tối'}:
                    labels.append("I-TIME")
                    i += 1
                found_time = True
                in_task = False
                in_date = False
                continue

            # số ngày trong cụm ngày tháng: "ngày 24 tháng 5"
            if in_date or (i > 0 and tokens[i-1].lower() in {'ngày', 'tháng', 'năm'}):
                labels.append("I-DATE")
                i += 1
                continue

            # số đứng một mình sau time context → vẫn là TIME
            if found_time and not found_date:
                labels.append("I-TIME")
                i += 1
                continue

        # ── Từ thời gian đơn ──────────────────────────────────────────────────
        if tok in TIME_WORDS and not NUMBER_RE.match(tok) and '_' not in tok:
            label = "I-TIME" if found_time else "B-TIME"
            labels.append(label)
            found_time = True
            in_task = False
            in_date = False
            i += 1
            continue

        # ── Từ ngày tháng đơn ─────────────────────────────────────────────────
        if tok in DATE_WORDS and '_' not in tok:
            label = "I-DATE" if found_date else "B-DATE"
            labels.append(label)
            found_date = True
            in_task = False
            in_date = True
            i += 1
            continue

        # ── Từ bỏ qua ─────────────────────────────────────────────────────────
    # ── Time connectors → O + reset task ──────────────────────────────────────
        if tok in TIME_CONNECTORS:
            labels.append("O")
            in_task = False   # reset — những gì sau "lúc" không phải task
            i += 1
            continue

    # ── Từ bỏ qua nhưng giữ context task ─────────────────────────────────────
        if tok in SKIP_WORDS:
            labels.append("O")
            # nếu là TASK_ENDER → từ tiếp theo là đối tượng, không phải task
            if tok in TASK_ENDERS:
                # skip 1 token tiếp theo (người nhận) → gán O
                i += 1
                if i < len(tokens):
                    labels.append("O")
                    i += 1
            else:
                i += 1
            continue
        # ── Mặc định → TASK nếu chưa gặp time/date ───────────────────────────
        if not found_time and not found_date:
            label = "I-TASK" if in_task else "B-TASK"
            labels.append(label)
            in_task = True
        else:
            labels.append("O")

        i += 1

    if len(tokens) != len(labels):
        return None

    has_task = any(l in ("B-TASK", "I-TASK") for l in labels)
    has_time_or_date = any(l in ("B-TIME","I-TIME","B-DATE","I-DATE") for l in labels)

    if not has_task or not has_time_or_date:
        return None

    return {"tokens": tokens, "labels": labels}

# ── Generator ─────────────────────────────────────────────────────────────────

def generate_sentences() -> list[str]:
    sentences = []
    import random
    random.seed(42)

    for task_tmpl in TASK_TEMPLATES:
        for person in PERSON_TEMPLATES:
            task = task_tmpl.replace("{person}", person)
            for time_tmpl in TIME_TEMPLATES:
                for h in random.sample(HOURS_AM + HOURS_PM, 3):
                    time_str = time_tmpl.replace("{h}", str(h))
                    for date_str in DATE_TEMPLATES:
                        if "{d}" in date_str:
                            date_str = date_str.replace("{d}", str(random.randint(1, 28)))
                            date_str = date_str.replace("{m}", str(random.randint(1, 12)))
                        sentences.append(f"{task} {time_str} {date_str}")

    # thêm câu ngắn không có giờ cụ thể
    for task_tmpl in TASK_TEMPLATES:
        for date_str in DATE_TEMPLATES:
            if "{d}" not in date_str:
                task = task_tmpl.replace("{person}", random.choice(PERSON_TEMPLATES))
                sentences.append(f"{task} {date_str}")

    return list(set(sentences))  # bỏ trùng


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("Đang sinh câu mẫu...")
    sentences = generate_sentences()
    print(f"Tổng số câu sinh ra: {len(sentences)}")

    print("Đang auto-label...")
    labeled = []
    failed = []

    for sent in sentences:
        result = auto_label(sent)
        if result:
            labeled.append(result)
        else:
            failed.append(sent)

    print(f"Label thành công: {len(labeled)}")
    print(f"Label thất bại:   {len(failed)}")

    # Lưu dataset chính
    with open("dataset.json", "w", encoding="utf-8") as f:
        json.dump(labeled, f, ensure_ascii=False, indent=2)

    # Lưu file cần review thủ công
    with open("needs_review.txt", "w", encoding="utf-8") as f:
        for s in failed:
            f.write(s + "\n")

    # In 5 ví dụ để kiểm tra
    print("\n── 5 ví dụ đầu ─────────────────────────────────────────")
    for item in labeled[:5]:
        print("\nCâu:   ", " ".join(item["tokens"]))
        print("Label: ", " ".join(item["labels"]))

    print(f"\nĐã lưu dataset.json và needs_review.txt")


if __name__ == "__main__":
    main()