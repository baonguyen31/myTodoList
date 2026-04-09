import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

# --- CẤU HÌNH THEO CHUẨN MỚI ---
# Không dùng genai.configure() nữa mà khởi tạo client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """Bạn là trợ lý tạo task thông minh, trả lời bằng tiếng Việt ngắn gọn, thân thiện.
Nhiệm vụ: giúp user tạo todo task từ câu nhập tự nhiên.
Quy tắc:
- Nếu thiếu thông tin → hỏi lại đúng 1 câu ngắn
- Nếu đủ thông tin → xác nhận lại với user
- Không hỏi nhiều câu cùng lúc
- Không giải thích dài dòng
- Trả lời tối đa 2 câu"""

def generate_response(
    user_message: str,
    conversation_history: list[dict],
    context: str = "",
) -> str:
    """
    Gọi Gemini (SDK mới) để sinh response tự nhiên.
    """
    try:
        # Build prompt với history
        history_text = "\n".join([
            f"{'User' if m['role'] == 'user' else 'AI'}: {m['content']}"
            for m in conversation_history[-6:]
        ])

        prompt = f"""{SYSTEM_PROMPT}

Lịch sử hội thoại:
{history_text}

Thông tin đã extract được:
{context}

User vừa nói: {user_message}
AI:"""

        # Cú pháp mới: client.models.generate_content
        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=prompt
        )
        
        return response.text.strip()

    except Exception as e:
        print(f"[Gemini Error] {e}")
        return None 


def fallback_response(action: str, missing: list[str], draft_info: str = "") -> str:
    """Rule-based response khi Gemini lỗi hoặc không phản hồi."""
    if action == "ask":
            if not missing:
                return "Bạn có thể cho mình biết thêm chi tiết về công việc được không?"
                
            # Lấy trường đầu tiên bị thiếu
            field = missing[0]
            
            # Mapping câu hỏi theo trường (field)
            questions = {
                "title": "Bạn định làm việc gì thế?",
                "due_date": "Bạn muốn thực hiện việc này vào lúc nào?",
                "priority": "Việc này có quan trọng lắm không bạn?",
                "tiêu đề công việc": "Bạn định làm gì vào lúc đó vậy?", # Nếu bạn dùng tiếng Việt trong list missing
                "thời gian": "Bạn dự định làm việc này khi nào?"
            }
            
            return questions.get(field, f"Bạn cho mình xin thêm thông tin về {field} nhé.")
    if action == "confirm":
        return f"Tôi sẽ tạo task: {draft_info}. Xác nhận nhé?"
    if action == "save":
        return "Đã lưu task thành công!"
    if action == "cancel":
        return "Đã hủy. Bạn muốn tạo task mới không?"
    return "Tôi chưa hiểu. Bạn có thể nói rõ hơn không?"