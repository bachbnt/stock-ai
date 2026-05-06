# HNTStock

Ứng dụng tra cứu chứng khoán Việt Nam sử dụng dữ liệu từ vnstock.

## Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Backend | Python 3.13 · FastAPI · uvicorn · vnstock |
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS · Recharts |
| Dữ liệu | vnstock (nguồn KBS) |

## Cấu trúc thư mục

```
stock-ai/
├── stock-backend/   # FastAPI REST API
└── stock-frontend/       # React frontend
```

## Yêu cầu

- Python 3.11+
- Node.js 18+
- npm 9+

---

## Cài đặt & Chạy

### 1. Backend

```bash
cd stock-backend

# Tạo virtual environment
python3 -m venv .venv

# Kích hoạt venv
source .venv/bin/activate          # macOS / Linux
.venv\Scripts\activate             # Windows

# Cài dependencies
pip install -r requirements.txt

# Tạo file .env
cp .env.example .env
# Chỉnh sửa .env: thêm VNSTOCK_API_KEY và API_KEY

# Chạy server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend chạy tại: `http://localhost:8000`  
API docs (Swagger): `http://localhost:8000/docs`

### 2. Frontend

Mở terminal mới:

```bash
cd stock-frontend

# Cài dependencies
npm install

# Tạo file .env
echo "VITE_BACKEND_API_KEY=secret123" > .env

# Chạy dev server
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

---

## Biến môi trường

### Backend (`stock-backend/.env`)

| Biến | Mô tả | Mặc định |
|---|---|---|
| `VNSTOCK_API_KEY` | API key từ vnstocks.com (miễn phí) | `""` |
| `API_KEY` | Key để xác thực request từ frontend | `secret123` |

Đăng ký `VNSTOCK_API_KEY` miễn phí tại: https://vnstocks.com/login

### Frontend (`stock-frontend/.env`)

| Biến | Mô tả | Mặc định |
|---|---|---|
| `VITE_BACKEND_API_KEY` | Phải khớp với `API_KEY` của backend | `secret123` |

---

## API Endpoints

Tất cả endpoints yêu cầu header: `X-API-Key: <API_KEY>`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/v1/stocks/list` | Danh sách ~1537 mã niêm yết |
| GET | `/api/v1/stocks/quotes?symbols=ACB,VNM` | Giá OHLCV + % biến động (tối đa 50 mã) |
| GET | `/api/v1/stocks/history?symbol=ACB&start=...&end=...` | Lịch sử giá OHLCV |
| GET | `/api/v1/stocks/company/{symbol}` | Thông tin công ty |
| GET | `/health` | Health check |

### Ví dụ

```bash
# Lấy danh sách cổ phiếu
curl http://localhost:8000/api/v1/stocks/list?source=KBS \
  -H "X-API-Key: secret123"

# Lấy giá nhiều mã cùng lúc
curl "http://localhost:8000/api/v1/stocks/quotes?symbols=ACB,VNM,HPG" \
  -H "X-API-Key: secret123"

# Lịch sử giá ACB 90 ngày
curl "http://localhost:8000/api/v1/stocks/history?symbol=ACB&start=2025-02-01&end=2025-05-01" \
  -H "X-API-Key: secret123"
```

---

## Lưu ý

- vnstock Community Edition giới hạn **60 requests/phút**. Trang giá trong bảng tự cache 1 phút và auto-refresh 2 phút để tránh vượt giới hạn.
- Khi đổi `API_KEY` trong backend, cập nhật `VITE_BACKEND_API_KEY` trong frontend tương ứng.
