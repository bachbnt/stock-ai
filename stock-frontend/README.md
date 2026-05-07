# stock-frontend

React SPA tra cứu và quản lý danh mục chứng khoán Việt Nam.

## Yêu cầu

- Node.js 18+
- npm 9+
- `stock-backend` đang chạy tại `http://localhost:8000`
- Tài khoản [Supabase](https://supabase.com) (free tier đủ dùng)

## Cài đặt

```bash
npm install
```

## Cấu hình

Tạo file `.env`:

```env
VITE_BACKEND_API_KEY=secret123        # phải khớp với API_KEY trong backend
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Chạy

```bash
npm run dev      # http://localhost:5173
npm run build    # production build
npm run preview  # preview build
```

## Routes

| Path | Mô tả |
|---|---|
| `/` | Danh sách thị trường (public) |
| `/portfolio` | Danh mục cá nhân (yêu cầu đăng nhập) |

## Tính năng

**Thị trường (`/`)**
- Danh sách ~1537 mã niêm yết, tìm kiếm theo mã / tên công ty, phân trang 10 mã/trang
- Bảng giá: Giá khớp · Biến động (click header chuyển giữa `%` và `₫`) · Khối lượng
- Màu giá theo chiều biến động: xanh / đỏ / vàng
- Auto-refresh mỗi 2 phút, nút làm mới thủ công
- Click mã → modal chi tiết: biểu đồ đóng cửa 90 ngày + thông tin công ty (tab Thông tin / Kinh doanh / Lịch sử)

**Danh mục (`/portfolio`)**
- Đăng ký / đăng nhập email + password (Supabase Auth)
- CRUD giao dịch mua/bán với giá mặc định = giá thị trường hiện tại
- Tính P&L theo giá vốn bình quân: lãi/lỗ chưa thực hiện + đã thực hiện
- Biểu đồ biến động giá trị danh mục 90 ngày
- Dữ liệu cô lập theo user (Row Level Security)

**Hệ thống**
- Hệ thống i18n tự xây (`src/contexts/I18nContext`, `src/lib/i18n.ts`) — hiện tại tiếng Việt
- Dark mode toàn bộ

## Cấu trúc `src/`

```
src/
├── App.tsx                  # Router (createBrowserRouter)
├── components/
│   ├── AuthModal.tsx        # Đăng nhập / đăng ký
│   ├── Navbar.tsx           # Navigation + language selector
│   ├── StockDetail.tsx      # Modal chi tiết cổ phiếu + biểu đồ
│   ├── StockTable.tsx       # Bảng danh sách + quotes
│   └── portfolio/
│       ├── Portfolio.tsx        # Trang danh mục (layout + summary cards)
│       ├── HoldingsTable.tsx    # Bảng holdings
│       ├── PortfolioChart.tsx   # Biểu đồ giá trị 90 ngày
│       ├── TransactionList.tsx  # Lịch sử giao dịch
│       └── TransactionModal.tsx # Form thêm/sửa giao dịch
├── contexts/
│   └── I18nContext.tsx      # Language context + useT() hook
├── hooks/
│   ├── useStock.ts          # useStockList, useStockQuotes, useStockHistory, useCompanyInfo
│   └── usePortfolio.ts      # useAuth, useTransactions, mutations, usePortfolioHistory
└── lib/
    ├── api.ts               # stockRequest() + response types
    ├── i18n.ts              # Translation keys (Vietnamese)
    ├── portfolio.ts         # computeHoldings, enrichHoldings, computeSummary, fmtMoney, fmtPrice
    ├── queryClient.ts       # TanStack Query client
    └── supabase.ts          # Supabase client + Transaction types
```

## Dependencies chính

```
react 19 · react-dom 19 · typescript 6
react-router-dom 7
@tanstack/react-query 5
@supabase/supabase-js 2
recharts 3
tailwindcss 3 · lucide-react
```
