import torch
import sys

print(f"Phiên bản Python: {sys.version}")
print(f"Phiên bản PyTorch: {torch.__version__}")
print(f"Hệ thống có nhận GPU (CUDA) không: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"Tên Card đồ họa: {torch.cuda.get_device_name(0)}")