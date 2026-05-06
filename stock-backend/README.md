# stock-backend

FastAPI backend cung cấp dữ liệu chứng khoán Việt Nam qua thư viện vnstock.

## Yêu cầu

- Python 3.11+

## Cài đặt

```bash
# Tạo virtual environment
python3 -m venv .venv

# Kích hoạt venv
source .venv/bin/activate          # macOS / Linux
.venv\Scripts\activate             # Windows

# Cài dependencies
pip install -r requirements.txt
```

## Cấu hình

```bash
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
VNSTOCK_API_KEY=vnstock_your_key_here   # đăng ký miễn phí tại vnstocks.com/login
API_KEY=secret123                        # key xác thực cho frontend
```

## Chạy

`uvicorn` nằm trong `.venv`, có 2 cách chạy:

**Cách 1 — Activate venv trước (khuyên dùng):**
```bash
source .venv/bin/activate          # macOS / Linux
.venv\Scripts\activate             # Windows

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Cách 2 — Dùng path trực tiếp (không cần activate):**
```bash
# macOS / Linux
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Windows
.venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- Server: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

## API Endpoints

Tất cả endpoints yêu cầu header `X-API-Key`.

| Endpoint | Params | Mô tả |
|---|---|---|
| `GET /api/v1/stocks/list` | `source=KBS` | Toàn bộ mã niêm yết |
| `GET /api/v1/stocks/quotes` | `symbols=ACB,VNM`, `source=KBS` | OHLCV + % biến động (tối đa 50 mã, fetch song song) |
| `GET /api/v1/stocks/history` | `symbol`, `start`, `end`, `interval=1D`, `source=KBS` | Lịch sử giá OHLCV |
| `GET /api/v1/stocks/company/{symbol}` | `source=KBS` | Thông tin công ty |
| `GET /health` | — | Health check |

## Dependencies chính

```
fastapi==0.115.12
uvicorn[standard]==0.34.2
vnstock==4.0.2
pydantic-settings==2.9.1
python-dotenv==1.1.0
```
