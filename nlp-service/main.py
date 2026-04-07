from fastapi import FastAPI
from pydantic import BaseModel
from underthesea import ner        # finds named entities (time, person, place)
from datetime import datetime, timedelta
import dateparser                  # converts "ngày mai 9h" → real datetime
import re

app = FastAPI()

# This is the shape of data Quarkus sends us
class PromptRequest(BaseModel):
    prompt: str
    maxTasks: int = 5

# This is the shape of data we send back to Quarkus
class TaskSuggestion(BaseModel):
    title: str
    description: str
    priority: str
    dueDate: str  # ISO 8601 format

@app.post("/extract", response_model=list[TaskSuggestion])
def extract_tasks(request: PromptRequest):
    prompt = request.prompt
    tasks = []
    parts = [p.strip() for p in prompt.split(",") if p.strip()]
    
    last_extracted_date = None # Lưu ngày của task trước đó

    for part in parts:
        # Truyền thêm last_extracted_date vào để kế thừa nếu câu sau thiếu ngày
        dt_obj = extract_date_to_datetime(part, last_extracted_date)
        last_extracted_date = dt_obj.date() # Cập nhật ngày cho task kế tiếp

        tasks.append(TaskSuggestion(
            title=clean_title(part),
            description=part,
            priority=extract_priority(part),
            dueDate=dt_obj.isoformat()
        ))
    return tasks

def extract_date_to_datetime(text: str, default_date=None) -> datetime:
    from datetime import datetime, timedelta, date
    now = datetime.now()
    text_lower = text.lower()
    
    # 1. XÁC ĐỊNH NGÀY CƠ SỞ
    target_date = None
    
    # ƯU TIÊN CAO NHẤT: Từ khóa thời gian trực tiếp trong câu
    if any(word in text_lower for word in ['nay', 'hôm nay']):
        target_date = now
    elif 'mai' in text_lower:
        target_date = now + timedelta(days=1)
    elif any(word in text_lower for word in ['kia', 'mốt']):
        target_date = now + timedelta(days=2)
    # ƯU TIÊN 2: Kiểm tra ngày cụ thể (17/4, thứ hai...)
    else:
        specific_date = parse_vietnamese_relative_date(text_lower, now)
        if specific_date:
            target_date = specific_date
        # ƯU TIÊN 3: Kế thừa từ task trước nếu không có từ khóa nào ở trên
        elif default_date:
            if isinstance(default_date, date) and not isinstance(default_date, datetime):
                target_date = datetime.combine(default_date, datetime.min.time())
            else:
                target_date = default_date
        else:
            target_date = now

    # 2. TRÍCH XUẤT GIỜ (Sử dụng logic quét buổi toàn cục)
    hour = extract_hour_from_text(text_lower)
    
    # 3. TẠO KẾT QUẢ
    # Đảm bảo target_date luôn là datetime trước khi replace
    if isinstance(target_date, date) and not isinstance(target_date, datetime):
        final_dt = datetime.combine(target_date, datetime.min.time())
    else:
        final_dt = target_date

    final_dt = final_dt.replace(minute=0, second=0, microsecond=0)
    
    if hour is not None:
        final_dt = final_dt.replace(hour=hour)
    else:
        # Mặc định theo buổi nếu không có số giờ cụ thể
        if 'sáng' in text_lower: final_dt = final_dt.replace(hour=7)
        elif 'chiều' in text_lower: final_dt = final_dt.replace(hour=14)
        elif 'tối' in text_lower: final_dt = final_dt.replace(hour=19)
        else: final_dt = final_dt.replace(hour=9)

    return final_dt


def extract_date(text: str) -> str:
    now = datetime.now()
    text_lower = text.lower()

    # ƯU TIÊN 1: Check các từ khóa ngày mạnh trước
    target_date = now
    if any(word in text_lower for word in ['mai', 'tomorrow']):
        target_date = now + timedelta(days=1)
    elif any(word in text_lower for word in ['kia', 'mốt']):
        target_date = now + timedelta(days=2)

    # ƯU TIÊN 2: Lấy giờ bằng Regex mới
    hour = extract_hour_from_text(text_lower)

    # Thử parse bằng thư viện để lấy các trường hợp phức tạp (thứ, ngày tháng cụ thể)
    settings = {'PREFER_DATES_FROM': 'future', 'RELATIVE_BASE': now, 'DATE_ORDER': 'DMY'}
    parsed = dateparser.parse(text_lower, languages=['vi'], settings=settings)
    
    if parsed is None:
        translated = translate_vietnamese_datetime(text_lower)
        parsed = dateparser.parse(translated, settings=settings)
        
    if parsed is None:
        parsed = parse_vietnamese_relative_date(text_lower, now)
        
    if parsed:
        # Nếu thư viện tìm thấy ngày, lấy ngày của thư viện
        final_datetime = parsed
    else:
        # Nếu thư viện tạch, dùng ngày ta đã xác định ở Bước 1
        final_datetime = target_date

    # ÉP GIỜ:
    if hour is not None:
        final_datetime = final_datetime.replace(hour=hour, minute=0, second=0, microsecond=0)
    else:
        # Nếu không có giờ, mặc định theo buổi hoặc 9h
        default_h = 7 if "sáng" in text_lower else 14 if "chiều" in text_lower else 9
        final_datetime = final_datetime.replace(hour=default_h, minute=0, second=0, microsecond=0)

    return final_datetime.isoformat()

def translate_vietnamese_datetime(text: str) -> str:
    # Chuẩn hóa các cách nói gộp
    text = text.lower()
    
    # Xử lý các cụm từ ghép phổ biến
    text = re.sub(r'\b(sáng mai|mai sáng)\b', 'tomorrow morning', text)
    text = re.sub(r'\b(chiều mai|mai chiều)\b', 'tomorrow afternoon', text)
    text = re.sub(r'\b(tối mai|mai tối)\b', 'tomorrow evening', text)
    text = re.sub(r'\b(sáng nay|nay sáng)\b', 'today morning', text)
    text = re.sub(r'\b(chiều nay|nay chiều)\b', 'today afternoon', text)
    text = re.sub(r'\b(tối nay|nay tối)\b', 'today evening', text)

    replacements = {
        'ngày mai': 'tomorrow',
        'hôm nay': 'today',
        'hôm kia': 'day after tomorrow',
        'ngày kia': 'day after tomorrow',
        'mốt': 'day after tomorrow',
        'tuần sau': 'next week',
        'lúc': '',
        'giờ': ' ', # Thay giờ bằng khoảng trắng để tránh dính số
    }
    
    for vi, en in replacements.items():
        text = re.sub(r'\b' + re.escape(vi) + r'\b', en, text)
    
    return text


def parse_vietnamese_relative_date(text: str, now: datetime) -> datetime | None:
    if 'hôm nay' in text:
        return now
    if 'ngày mai' in text:
        return now + timedelta(days=1)
    if 'hôm kia' in text or 'ngày kia' in text:
        return now + timedelta(days=2)
    if 'tuần sau' in text:
        return now + timedelta(days=7)
    if 'tháng sau' in text:
        return (now.replace(day=1) + timedelta(days=32)).replace(day=1)

    weekday_map = {
        'hai': 0,
        'ba': 1,
        'tư': 2,
        'năm': 3,
        'sáu': 4,
        'bảy': 5,
        'chủ nhật': 6,
    }
    weekday_match = re.search(r'thứ\s*(hai|ba|tư|năm|sáu|bảy|chủ nhật)', text)
    if weekday_match:
        target_weekday = weekday_map[weekday_match.group(1)]
        return next_weekday(now, target_weekday)

    # Month name mapping for Vietnamese
    month_name_map = {
        'một': 1, 'hai': 2, 'ba': 3, 'tư': 4, 'năm': 5, 'sáu': 6,
        'bảy': 7, 'tám': 8, 'chín': 9, 'mười': 10, 'mười một': 11, 'mười hai': 12
    }

    # Check for dates with month names: "ngày 31 tháng năm" or "31 tháng năm"
    month_name_match = re.search(r'(?:ngày\s*)?(\d{1,2})\s*tháng\s*(một|hai|ba|tư|năm|sáu|bảy|tám|chín|mười|mười một|mười hai)(?:\s*năm\s*(\d{4}))?', text)
    if month_name_match:
        day = int(month_name_match.group(1))
        month_name = month_name_match.group(2)
        month = month_name_map.get(month_name)
        if month:
            year = int(month_name_match.group(3)) if month_name_match.group(3) else now.year
            parsed = datetime(year=year, month=month, day=day)
            if parsed < now and month_name_match.group(3) is None:
                parsed = parsed.replace(year=year + 1)
            return parsed

    explicit_date = re.search(r'ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})(?:\s*năm\s*(\d{4}))?', text)
    if explicit_date:
        day = int(explicit_date.group(1))
        month = int(explicit_date.group(2))
        year = int(explicit_date.group(3)) if explicit_date.group(3) else now.year
        parsed = datetime(year=year, month=month, day=day)
        if parsed < now and explicit_date.group(3) is None:
            parsed = parsed.replace(year=year + 1)
        return parsed

    slash_date = re.search(r'(\d{1,2})/(\d{1,2})(?:/(\d{2,4}))?', text)
    if slash_date:
        day = int(slash_date.group(1))
        month = int(slash_date.group(2))
        year = int(slash_date.group(3)) if slash_date.group(3) else now.year
        if year < 100:
            year += 2000
        parsed = datetime(year=year, month=month, day=day)
        if parsed < now and slash_date.group(3) is None:
            parsed = parsed.replace(year=year + 1)
        return parsed

    return None


def next_weekday(now: datetime, weekday: int) -> datetime:
    days_ahead = (weekday - now.weekday() + 7) % 7
    if days_ahead == 0:
        days_ahead = 7
    return (now + timedelta(days=days_ahead)).replace(hour=0, minute=0, second=0, microsecond=0)


def extract_hour_from_text(text: str) -> int | None:
    import re
    text_lower = text.lower()
    
    # 1. Xác định BUỔI trên toàn bộ vế câu (Cực kỳ quan trọng)
    is_pm = any(re.search(rf'\b{word}\b', text_lower) for word in ['chiều', 'tối', 'pm', 'đêm'])
    is_am = any(re.search(rf'\b{word}\b', text_lower) for word in ['sáng', 'am'])
    
    # 2. Tìm con số giờ bằng Regex
    hour = None
    patterns = [
        r'(?:lúc|trước|vào)\s+(\d{1,2})\b', 
        r'(\d{1,2})\s*(?:giờ|h|g)\b',
        r'\b(\d{1,2})\b' 
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            temp_hour = int(match.group(1))
            if 0 <= temp_hour <= 23:
                hour = temp_hour
                break
                
    if hour is None: return None

    # 3. Chuyển đổi sang hệ 24h
    if is_pm and hour < 12:
        hour += 12
    elif is_am and hour == 12:
        hour = 0
        
    return hour

def extract_date_to_datetime(text: str, default_date=None) -> datetime:
    from datetime import datetime, timedelta, date
    now = datetime.now()
    text_lower = text.lower()
    
    # --- BƯỚC 1: XÁC ĐỊNH NGÀY ---
    target_date = None
    
    # Ưu tiên 1: Từ khóa trực tiếp (Phải check "mai" trước khi dùng "default_date")
    if any(word in text_lower for word in ['nay', 'hôm nay']):
        target_date = now
    elif 'mai' in text_lower:
        target_date = now + timedelta(days=1)
    elif any(word in text_lower for word in ['kia', 'mốt']):
        target_date = now + timedelta(days=2)
    
    # Ưu tiên 2: Ngày cụ thể (17/4, thứ hai...)
    if target_date is None:
        specific_date = parse_vietnamese_relative_date(text_lower, now)
        if specific_date:
            target_date = specific_date
        # Ưu tiên 3: Kế thừa từ task trước (Trí nhớ tạm thời)
        elif default_date:
            if isinstance(default_date, (date, datetime)):
                target_date = datetime.combine(default_date, datetime.min.time()) if isinstance(default_date, date) else default_date
        else:
            target_date = now

    # --- BƯỚC 2: TRÍCH XUẤT GIỜ ---
    hour = extract_hour_from_text(text_lower)
    
    # --- BƯỚC 3: TỔNG HỢP ---
    # Đảm bảo target_date là kiểu datetime
    if not isinstance(target_date, datetime):
        target_date = datetime.combine(target_date, datetime.min.time())

    final_dt = target_date.replace(minute=0, second=0, microsecond=0)
    
    if hour is not None:
        final_dt = final_dt.replace(hour=hour)
    else:
        # Mặc định theo buổi nếu không có số
        if 'sáng' in text_lower: final_dt = final_dt.replace(hour=7)
        elif 'chiều' in text_lower: final_dt = final_dt.replace(hour=14)
        elif 'tối' in text_lower: final_dt = final_dt.replace(hour=19)
        else: final_dt = final_dt.replace(hour=9)

    return final_dt

def clean_title(text: str) -> str:
    # remove common Vietnamese time words to get a clean title
    time_patterns = [
        r'lúc \d+\s*(giờ|h|am|pm)(\s*(sáng|chiều|tối))?',
        r'vào\s*(lúc|ngày|buổi)',
        r'ngày mai', r'hôm nay', r'tuần sau',
        r'\d+\s*(giờ|h)\s*(sáng|chiều|tối)?',
    ]
    cleaned = text
    for pattern in time_patterns:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
    return cleaned.strip(' ,.')


def extract_priority(text: str) -> str:
    high_keywords = ['gấp', 'khẩn', 'quan trọng', 'urgent', 'ngay']
    low_keywords  = ['có thể', 'khi rảnh', 'không gấp']
    text_lower = text.lower()
    if any(k in text_lower for k in high_keywords):
        return 'HIGH'
    if any(k in text_lower for k in low_keywords):
        return 'LOW'
    return 'MEDIUM'