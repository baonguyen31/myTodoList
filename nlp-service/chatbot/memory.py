from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

@dataclass
class TaskDraft:
    """Task đang được tạo dở — chưa lưu vào DB."""
    title:       Optional[str]  = None
    due_date:    Optional[str]  = None   # ISO 8601
    priority:    Optional[str]  = None
    description: Optional[str]  = None

    def is_complete(self) -> bool:
        """Task đủ thông tin để lưu chưa."""
        return bool(self.title and self.due_date)

    def missing_fields(self) -> list[str]:
        missing = []
        if not self.title:    missing.append("tiêu đề")
        if not self.due_date: missing.append("thời gian")
        return missing

    def to_dict(self) -> dict:
        return {
            "title":       self.title,
            "dueDate":     self.due_date,
            "priority":    self.priority or "MEDIUM",
            "description": self.description or self.title,
            "ai_generated": True,
            "source":      "chatbot",
        }


@dataclass
class ConversationSession:
    session_id:   str
    messages:     list[dict]      = field(default_factory=list)
    draft:        Optional[TaskDraft] = None
    state:        str             = "idle"
    # state: idle | collecting | confirming
    created_at:   datetime        = field(default_factory=datetime.now)

    def add_message(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})
        # giữ tối đa 20 messages để tránh context quá dài
        if len(self.messages) > 20:
            self.messages = self.messages[-20:]

    def reset(self):
        self.draft = None
        self.state = "idle"


# ── In-memory store ───────────────────────────────────────────────────────────
# key: session_id (userEmail từ JWT)
_sessions: dict[str, ConversationSession] = {}

def get_session(session_id: str) -> ConversationSession:
    if session_id not in _sessions:
        _sessions[session_id] = ConversationSession(session_id=session_id)
    return _sessions[session_id]

def clear_session(session_id: str):
    if session_id in _sessions:
        _sessions[session_id].reset()