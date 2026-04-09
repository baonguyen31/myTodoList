from dataclasses import dataclass
from datetime import datetime, timedelta
from underthesea import word_tokenize
import torch
import re
from typing import Optional

# Import các hàm core từ main.py của bạn
from main import (
    clean_title, 
    extract_priority, 
    parse_vietnamese_relative_date, 
    extract_hour_from_text
)

@dataclass
class ExtractResult:
    title:      Optional[str] = None
    due_date:   Optional[str] = None
    priority:   Optional[str] = None
    confidence: float       = 0.0

# ─── SERVICE CHÍNH ────────────────────────────────────────────────────────────

def extract_from_text(
    text: str,
    phobert_model,
    phobert_tokenizer,
    id2label: dict,
) -> ExtractResult:
    """
    Quy trình chuẩn xác 100%:
    1. Kiểm tra "Pure Datetime": Nếu câu chỉ chứa ngày/giờ -> title = None ngay.
    2. Nếu có nội dung khác: Dùng PhoBERT trước -> Rule-based sau.
    3. Trích xuất Datetime: Xử lý triệt để "ngày kia", "mai", "8h".
    """
    
    # BƯỚC 1: LỌC "PURE DATETIME" (Chống ghi đè Title bằng "Ngày kia", "8h")
    if _is_pure_datetime(text):
        title = None
    else:
        # BƯỚC 2: TRÍCH XUẤT TITLE (Ưu tiên PhoBERT)
        title = _extract_title_hybrid(text, phobert_model, phobert_tokenizer, id2label)
    
    # BƯỚC 3: TRÍCH XUẤT DATETIME
    due_date = _extract_datetime_strict(text)
    
    # BƯỚC 4: TRÍCH XUẤT ĐỘ ƯU TIÊN
    priority = extract_priority(text)

    # Tính điểm tin cậy
    score = 0.0
    if title:    score += 0.5
    if due_date: score += 0.4
    if priority: score += 0.1

    return ExtractResult(title=title, due_date=due_date, priority=priority, confidence=score)

# ─── BỘ LỌC THÔNG MINH (CHỐNG LỖI TITLE) ──────────────────────────────────────

def _is_pure_datetime(text: str) -> bool:
    """Kiểm tra nếu câu nhập vào CHỈ chứa ngày giờ, không có task mới."""
    # Danh sách các từ khóa thời gian 'cứng'
    time_keywords = [
        r'mai', r'nay', r'kia', r'mốt', r'hôm', r'tối', r'sáng', r'chiều', r'trưa',
        r'lúc', r'giờ', r'h', r'ngày', r'tháng', r'thứ', r'\d+', r'/'
    ]
    
    # 1. Dùng clean_title của bạn xóa trước
    temp = clean_title(text).lower().strip()
    
    # 2. Xóa tiếp các keyword thời gian còn sót lại
    for kw in time_keywords:
        temp = re.sub(r'\b' + kw + r'\b', '', temp)
    
    # 3. Loại bỏ dấu câu rác
    temp = re.sub(r'[.,?!\-]', '', temp).strip()
    
    # Nếu sau khi xóa mà không còn gì -> Đây là câu chỉ có ngày giờ
    return len(temp) <= 1

def _extract_title_hybrid(text, model, tokenizer, id2label) -> Optional[str]:
    # 1. Thử lấy bằng PhoBERT trước
    phobert_raw = _get_title_from_phobert(text, model, tokenizer, id2label)
    
    # 2. Lấy Rule-based để đối chiếu
    rule_cleaned = clean_title(text).strip()

    if phobert_raw:
        # Gọt sạch ngày tháng lỡ dính vào Title của PhoBERT
        phobert_cleaned = clean_title(phobert_raw).strip()
        
        # Nếu PhoBERT bóc hụt (quá ngắn) so với Rule-based -> Lấy Rule-based
        if len(phobert_cleaned) < len(rule_cleaned) * 0.6:
            return rule_cleaned if len(rule_cleaned) > 1 else None
            
        return phobert_cleaned

    # Fallback về Rule-based hoàn toàn
    return rule_cleaned if len(rule_cleaned) > 1 else None

# ─── LOGIC DATETIME (FIX "NGÀY KIA" + "8H") ──────────────────────────────────

def _extract_datetime_strict(text: str) -> Optional[str]:
    now = datetime.now()
    text_lower = text.lower()
    
    # 1. Tìm Ngày (Dùng rule của bạn)
    target_date = parse_vietnamese_relative_date(text_lower, now)
    
    # FIX LỖI "NGÀY KIA": Ép cộng 2 ngày
    if "kia" in text_lower:
        # Nếu parser lỗi trả về hôm nay, ta cộng thêm 2
        if not target_date or target_date.date() == now.date():
            target_date = now + timedelta(days=2)

    # 2. Tìm Giờ
    hour = extract_hour_from_text(text_lower)
    
    # 3. KIỂM TRA ĐỘ ĐẦY ĐỦ
    # Nếu không có từ khóa thời gian nào -> Trả về None
    time_indicators = ['mai', 'nay', 'hôm', 'kia', 'mốt', 'thứ', '/', 'tháng', 'lúc', 'giờ', 'h', 'sáng', 'chiều', 'tối']
    if not any(k in text_lower for k in time_indicators) and hour is None:
        return None

    # Nếu thiếu giờ/buổi -> Trả về None để Bot hỏi "Mấy giờ?"
    if hour is None:
        if 'sáng' in text_lower: h = 8
        elif 'chiều' in text_lower: h = 14
        elif 'tối' in text_lower: h = 20
        else: return None # Ép hỏi lại
    else:
        h = hour

    final_dt = (target_date or now).replace(hour=h, minute=0, second=0, microsecond=0)
    
    # tz_vn = timezone(timedelta(hours=7))
    
    # # Tạo đối tượng datetime với múi giờ cụ thể
    # final_dt = (target_date or now).replace(
    #     hour=h, minute=0, second=0, microsecond=0, 
    #     tzinfo=tz_vn # Ép múi giờ vào đây
    # )
    
    # Trả về định dạng ISO có kèm thông tin múi giờ (+07:00)
    return final_dt.isoformat()    
    

# ─── PHOBERT ENGINE ───────────────────────────────────────────────────────────

def _get_title_from_phobert(text, model, tokenizer, id2label) -> Optional[str]:
    TIME_BLACKLIST = ["mai", "nay", "hôm nay", "sáng", "chiều", "tối", "giờ", "h", "ngày", 
                                    "kia", "mốt", "lúc", "vào", "khoảng", "tầm", "đến", "đi"]
    try:
        tokens = word_tokenize(text, format="text").split()
        tokens_clean = [t.replace("_", " ") for t in tokens]
        subwords, word_starts = [], []

        for word in tokens_clean:
            sws = tokenizer.tokenize(word) or [tokenizer.unk_token]
            word_starts.append(len(subwords))
            subwords.extend(sws)

        input_ids = torch.tensor([[
            tokenizer.cls_token_id,
            *tokenizer.convert_tokens_to_ids(subwords[:126]),
            tokenizer.sep_token_id,
        ]])

        with torch.no_grad():
            logits = model(input_ids=input_ids).logits
            preds = logits.argmax(dim=-1).squeeze().tolist()

        task_tokens = []
        for i, tok in enumerate(tokens):
            pos = word_starts[i] + 1
            label = id2label.get(preds[pos], "O") if pos < len(preds) else "O"
            if "TASK" in label:
                clean_tok = tok.replace("_", " ")
                if clean_tok.lower() not in TIME_BLACKLIST:
                    task_tokens.append(clean_tok)

        return " ".join(task_tokens).strip() if task_tokens else None
    except: return None

def is_cancel_intent(text: str) -> bool:
    keywords = ["hủy", "cancel", "thôi", "bỏ qua", "không cần", "dừng"]
    return any(k in text.lower() for k in keywords)

def is_confirm_intent(text: str) -> bool:
    keywords = ["ok", "oke", "được", "đồng ý", "xác nhận", "yes", "có", "lưu", "save"]
    return any(k in text.lower() for k in keywords)