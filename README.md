# HNTStock

Ứng dụng tra cứu và quản lý danh mục chứng khoán Việt Nam.

## Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Backend | Python 3.13 · FastAPI · uvicorn · vnstock |
| Frontend | React 19 · TypeScript · Vite 8 · Tailwind CSS 3 |
| Routing | React Router DOM v7 |
| State / Data fetching | TanStack Query v5 |
| Biểu đồ | Recharts v3 |
| Auth / Database | Supabase (Auth + PostgreSQL + RLS) |
| Icons | Lucide React |
| Dữ liệu thị trường | vnstock (nguồn KBS) |

## Cấu trúc thư mục

```
crypto-ai/
├── stock-backend/    # FastAPI REST API
└── stock-frontend/   # React SPA
    └── src/
        ├── components/
        │   └── portfolio/   # Portfolio CRUD components
        ├── contexts/        # I18nContext (localization)
        ├── hooks/           # useStock, usePortfolio
        └── lib/             # api, portfolio logic, supabase, i18n
```

## Yêu cầu

- Python 3.11+
- Node.js 18+
- npm 9+
- Tài khoản [Supabase](https://supabase.com) (free tier đủ dùng)

---

## Cài đặt & Chạy

### 1. Backend

```bash
cd stock-backend

# Tạo virtual environment
python3 -m venv .venv
source .venv/bin/activate          # macOS / Linux
.venv\Scripts\activate             # Windows

pip install -r requirements.txt

cp .env.example .env
# Chỉnh sửa .env: thêm VNSTOCK_API_KEY và API_KEY

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend chạy tại: `http://localhost:8000`  
API docs (Swagger): `http://localhost:8000/docs`

### 2. Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com)
2. Vào **SQL Editor** và chạy:

```sql
create table transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  symbol      text not null,
  type        text check (type in ('buy', 'sell')) not null,
  quantity    numeric not null,
  price       numeric not null,
  fee         numeric not null default 0,
  date        date not null,
  note        text,
  created_at  timestamptz default now()
);

alter table transactions enable row level security;

create policy "Users manage own transactions"
  on transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

3. Lấy **Project URL** và **anon key** tại *Project Settings → API*

### 3. Frontend

```bash
cd stock-frontend

npm install

cp .env.example .env
# Điền đủ 3 biến môi trường (xem bảng bên dưới)

npm run dev
```

Frontend chạy tại: `http://localhost:5173`

---

## Biến môi trường

### Backend (`stock-backend/.env`)

| Biến | Mô tả |
|---|---|
| `VNSTOCK_API_KEY` | API key từ [vnstocks.com](https://vnstocks.com/login) (miễn phí) |
| `API_KEY` | Key xác thực request từ frontend (tự đặt, ví dụ `secret123`) |

### Frontend (`stock-frontend/.env`)

| Biến | Mô tả |
|---|---|
| `VITE_BACKEND_API_KEY` | Phải khớp với `API_KEY` của backend |
| `VITE_SUPABASE_URL` | Project URL lấy từ Supabase Dashboard |
| `VITE_SUPABASE_ANON_KEY` | Anon/public key lấy từ Supabase Dashboard |

---

## Tính năng

### Thị trường (`/`)
- Danh sách ~1537 mã niêm yết, tìm kiếm theo mã hoặc tên công ty, phân trang
- Bảng giá: Giá khớp · Biến động (click header để chuyển giữa % và ₫) · Khối lượng
- Màu giá: xanh (tăng) · đỏ (giảm) · vàng (không đổi)
- Auto-refresh mỗi 2 phút, nút làm mới thủ công
- Click mã → modal chi tiết: biểu đồ đóng cửa 90 ngày + thông tin công ty (tab Thông tin / Kinh doanh / Lịch sử)

### Danh mục (`/portfolio`) — yêu cầu đăng nhập
- Đăng ký / đăng nhập bằng email + password (Supabase Auth)
- CRUD giao dịch mua/bán: mã, số lượng, giá, phí, ngày, ghi chú
- Giá mặc định khi thêm = giá thị trường hiện tại
- Tính theo phương pháp giá vốn bình quân:
  - Giá vốn TB · Giá hiện tại · Lãi/lỗ chưa thực hiện (%)
  - Lãi/lỗ đã thực hiện từ các lệnh bán
- Biểu đồ biến động giá trị danh mục 90 ngày
- Dữ liệu cô lập theo từng user (Row Level Security)

### Hệ thống
- Giao diện tiếng Việt, hệ thống i18n sẵn sàng mở rộng thêm ngôn ngữ
- Dark mode toàn bộ

---

## API Endpoints

Tất cả endpoints yêu cầu header: `X-API-Key: <API_KEY>`

Frontend proxy `/api/*` → `http://localhost:8000` (cấu hình trong `vite.config.ts`).

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/v1/stocks/list?source=KBS` | Danh sách mã niêm yết |
| GET | `/v1/stocks/quotes?symbols=ACB,VNM&source=KBS` | Giá OHLCV + biến động (tối đa 50 mã) |
| GET | `/v1/stocks/history?symbol=ACB&start=...&end=...&interval=1D&source=KBS` | Lịch sử giá OHLCV |
| GET | `/v1/stocks/company/{symbol}?source=KBS` | Thông tin công ty |
| GET | `/health` | Health check |

### Ví dụ

```bash
# Danh sách cổ phiếu
curl "http://localhost:8000/v1/stocks/list?source=KBS" \
  -H "X-API-Key: secret123"

# Giá nhiều mã
curl "http://localhost:8000/v1/stocks/quotes?symbols=ACB,VNM,HPG&source=KBS" \
  -H "X-API-Key: secret123"

# Lịch sử giá 90 ngày
curl "http://localhost:8000/v1/stocks/history?symbol=ACB&start=2025-02-01&end=2025-05-01&interval=1D&source=KBS" \
  -H "X-API-Key: secret123"
```

---

## Lưu ý

- vnstock Community Edition giới hạn **60 requests/phút**. Quotes được cache 1 phút và auto-refresh 2 phút.
- Đơn vị hiển thị giá: **nghìn VND** (74.200 = 74,200 VND/CP). API history trả về sẵn đơn vị này; API quotes trả về VND nguyên, frontend chia 1000 khi hiển thị.
- Khi đổi `API_KEY` backend, cập nhật `VITE_BACKEND_API_KEY` frontend tương ứng.
