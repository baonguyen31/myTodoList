from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from chatbot.memory import get_session, clear_session, TaskDraft
from chatbot.service import (
    extract_from_text, is_cancel_intent,
    is_confirm_intent,
)
from chatbot.llm import generate_response, fallback_response
from chatbot.response import ChatResponse, build_confirm_context

router = APIRouter()

# Được inject từ main.py sau khi PhoBERT load xong
_phobert_model     = None
_phobert_tokenizer = None
_id2label          = None

def init_router(model, tokenizer, id2label):
    global _phobert_model, _phobert_tokenizer, _id2label
    _phobert_model     = model
    _phobert_tokenizer = tokenizer
    _id2label          = id2label


class ChatRequest(BaseModel):
    prompt: str

router = APIRouter(prefix="/extract")
@router.post("/chat")
@router.post("/chat")
def chat(
    request: ChatRequest,
    x_user_email: str = Header(...),
):
    session = get_session(x_user_email)
    user_input = request.prompt.strip()
    
    if session.draft is None:
        session.draft = TaskDraft()

    if not user_input:
        raise HTTPException(status_code=400, detail="prompt không được trống")

    session.add_message("user", user_input)

    # ── ƯU TIÊN 1: XỬ LÝ LỆNH HỦY (Bất kể đang ở trạng thái nào) ──────────────────
    if is_cancel_intent(user_input):
        clear_session(x_user_email)
        msg = "Đã hủy bỏ các thay đổi. Bạn cần mình giúp gì mới không?"
        session.add_message("assistant", msg)
        return ChatResponse(message=msg, action="cancel").to_dict()

    # ── ƯU TIÊN 2: XỬ LÝ KHI ĐANG CHỜ XÁC NHẬN (CONFIRMING) ────────────────────
    if session.state == "confirming":
        # Case A: Đồng ý lưu
        if is_confirm_intent(user_input):
            task = session.draft.to_dict()
            msg = _get_response(user_input, session.messages, build_confirm_context(session.draft), "save", []) or fallback_response("save", [])
            clear_session(x_user_email) # Lưu xong mới clear
            session.add_message("assistant", msg)
            return ChatResponse(message=msg, action="save", task=task).to_dict()

        # Case B: Không phải xác nhận -> Coi là lệnh SỬA thông tin task cũ
        result = extract_from_text(user_input, _phobert_model, _phobert_tokenizer, _id2label)
        has_change = False
        
        # Chỉ sửa Title nếu nó không phải từ chỉ thời gian (tránh lỗi "Ngày mai")
        forbidden = ["ngày mai", "sáng mai", "8h", "9h", "hôm nay", "thành", "đổi"]
        if result.title and result.title.lower() not in forbidden:
            session.draft.title = result.title
            has_change = True
        
        if result.due_date:
            session.draft.due_date = result.due_date
            has_change = True

        if has_change:
            context = build_confirm_context(session.draft)
            msg = f"Đã cập nhật lại thông tin. Task hiện tại là: {context}. Bạn xác nhận lưu chứ?"
            return ChatResponse(message=msg, action="confirm", task=session.draft.to_dict()).to_dict()

    # ── ƯU TIÊN 3: XỬ LÝ TRÍCH XUẤT THÔNG TIN MỚI (COLLECTING) ──────────────────
    result = extract_from_text(user_input, _phobert_model, _phobert_tokenizer, _id2label)

    # Cập nhật thông tin vào Draft (Chỉ cập nhật nếu result có giá trị khác None)
    if result.title:    session.draft.title = result.title
    if result.due_date: session.draft.due_date = result.due_date
    if result.priority and result.priority != "MEDIUM": 
        session.draft.priority = result.priority
    
    if not session.draft.description:
        session.draft.description = user_input

    # Kiểm tra thiếu thông tin
    missing = session.draft.missing_fields()
    
    if missing:
        session.state = "collecting"
        context = build_confirm_context(session.draft)
        msg = _get_response(user_input, session.messages, context, "ask", missing) or fallback_response("ask", missing)
        session.add_message("assistant", msg)
        return ChatResponse(message=msg, action="ask").to_dict()
    else:
        # Đã đủ thông tin -> Chuyển sang trạng thái chờ xác nhận
        session.state = "confirming"
        context = build_confirm_context(session.draft)
        msg = _get_response(user_input, session.messages, context, "confirm", []) or fallback_response("confirm", [], context)
        session.add_message("assistant", msg)
        return ChatResponse(message=msg, action="confirm", task=session.draft.to_dict()).to_dict()
# def chat(
#     request: ChatRequest,
#     x_user_email: str = Header(...),   # Quarkus gửi email từ JWT
# ):
#     session = get_session(x_user_email)
#     user_input = request.prompt.strip()
    
#     if session.draft is None:
#         session.draft = TaskDraft()

#     if not user_input:
#         raise HTTPException(status_code=400, detail="prompt không được trống")

#     session.add_message("user", user_input)

#     # ── Xử lý theo state hiện tại ─────────────────────────────────────────────

#     # 1. User muốn hủy
#     if is_cancel_intent(user_input):
#         clear_session(x_user_email)
#         msg = _get_response(
#             user_input, session.messages, "", "cancel", []
#         ) or fallback_response("cancel", [])
#         session.add_message("assistant", msg)
#         return ChatResponse(message=msg, action="cancel").to_dict()

#     # 2. User đang xác nhận task
#     if session.state == "confirming" and is_confirm_intent(user_input):
#         task = session.draft.to_dict()
#         clear_session(x_user_email)
#         msg = _get_response(
#             user_input, session.messages,
#             build_confirm_context(session.draft), "save", []
#         ) or fallback_response("save", [])
#         session.add_message("assistant", msg)
#         return ChatResponse(message=msg, action="save", task=task).to_dict()

#     # 3. Extract thông tin từ input
#     result = extract_from_text(
#         user_input, _phobert_model, _phobert_tokenizer, _id2label
#     )

#     # Merge vào draft hiện tại
#     if result.title:    
#         session.draft.title = result.title
    
#     if result.due_date: 
#         session.draft.due_date = result.due_date
    
#     if result.priority and result.priority != "MEDIUM": # Chỉ đổi nếu user nhấn mạnh mức độ
#         session.draft.priority = result.priority
        
#     # Gán description nếu chưa có (lấy câu đầu tiên làm mô tả gốc)
#     if not session.draft.description:
#         session.draft.description = user_input

#     # 4. Còn thiếu thông tin → hỏi lại
#     missing = session.draft.missing_fields()
#     if missing:
#         session.state = "collecting"
#         context = build_confirm_context(session.draft)
#         msg = _get_response(
#             user_input, session.messages, context, "ask", missing
#         ) or fallback_response("ask", missing)
#         session.add_message("assistant", msg)
#         return ChatResponse(message=msg, action="ask").to_dict()

#     # 5. Đủ thông tin → xác nhận
# # 2. User đang trong trạng thái chờ xác nhận (Confirming)
#     if session.state == "confirming":
#         # Case A: Xác nhận lưu
#         if is_confirm_intent(user_input):
#             task = session.draft.to_dict()
#             clear_session(x_user_email)
#             msg = _get_response(user_input, session.messages, build_confirm_context(session.draft), "save", [])
#             return ChatResponse(message=msg, action="save", task=task).to_dict()

#         # Case B: Muốn hủy hoàn toàn
#         if is_cancel_intent(user_input):
#             clear_session(x_user_email)
#             return ChatResponse(message="Đã hủy task hiện tại. Bạn muốn tạo việc gì mới không?", action="cancel").to_dict()

#         # Case C: User nhập nội dung khác (Ví dụ: "Ngày mai", "8h", "Sửa tên thành...")
#         # Ở đây chúng ta coi là lệnh CHỈNH SỬA thay vì tạo task mới hoàn toàn
#         result = extract_from_text(user_input, _phobert_model, _phobert_tokenizer, _id2label)
        
#         # Chỉ cập nhật những gì user vừa nói thêm/sửa lại
#         has_change = False
#         if result.title and result.title not in ["ngày mai", "8h"]: # Tránh bóc nhầm title như đã nói ở trên
#             session.draft.title = result.title
#             has_change = True
#         if result.due_date:
#             session.draft.due_date = result.due_date
#             has_change = True
            
#         if has_change:
#             context = build_confirm_context(session.draft)
#             return ChatResponse(
#                 message=f"Đã cập nhật thông tin. Tôi sẽ tạo task: {context}. Bạn xác nhận lưu chưa?",
#                 action="confirm",
#                 task=session.draft.to_dict()
#             ).to_dict()


def _get_response(user_input, history, context, action, missing) -> str | None:
    """Gọi Gemini với context đầy đủ."""
    action_hint = {
        "ask":     f"Hỏi user về: {', '.join(missing)}",
        "confirm": f"Xác nhận task: {context}",
        "save":    "Thông báo đã lưu task thành công",
        "cancel":  "Thông báo đã hủy",
    }.get(action, "")

    return generate_response(
        user_message=user_input,
        conversation_history=history,
        context=f"{action_hint}\nThông tin task: {context}",
    )