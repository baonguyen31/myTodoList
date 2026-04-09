from dataclasses import dataclass
from typing import Optional

@dataclass
class ChatResponse:
    message: str
    action:  str          # ask | confirm | save | cancel | error
    task:    Optional[dict] = None

    def to_dict(self) -> dict:
        result = {
            "message": self.message,
            "action":  self.action,
        }
        if self.task:
            result["task"] = self.task
        return result


def build_confirm_context(draft) -> str:
    """Tạo chuỗi mô tả task để Gemini hiểu context."""
    # Bước kiểm tra an toàn (Guard Clause)
    if draft is None:
        return "chưa có thông tin"
        
    parts = []
    # Sử dụng getattr hoặc check attribute để tránh crash nếu draft là object rỗng
    if hasattr(draft, 'title') and draft.title:    
        parts.append(f"title='{draft.title}'")
    if hasattr(draft, 'due_date') and draft.due_date: 
        parts.append(f"dueDate='{draft.due_date}'")
    if hasattr(draft, 'priority') and draft.priority: 
        parts.append(f"priority='{draft.priority}'")
        
    return ", ".join(parts) if parts else "chưa có thông tin"