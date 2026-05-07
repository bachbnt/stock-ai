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
- Nút điều hướng: đầu · trước · sau · cuối trang
- FPT ghim cố định đầu bảng mọi trang (icon pin, không đánh số)
- Bảng giá: Giá khớp · Biến động (click header chuyển giữa `%` và `₫`) · Khối lượng
- Màu giá: xanh (tăng) · đỏ (giảm) · vàng (không đổi) · xám (không có dữ liệu)
- Auto-refresh mỗi 2 phút, nút làm mới thủ công
- Click mã → modal chi tiết (`max-w-4xl`) với 4 tab:
  - **Biểu đồ**: toggle đường thẳng / nến; candle chart có MA5/10/20/50, Volume, MACD (12/26/9), RSI (14), legend hover realtime
  - **Thông tin công ty**: thông tin cơ bản, địa chỉ, chi nhánh
  - **Mô hình Kinh doanh**: mô tả hoạt động (nếu có)
  - **Lịch sử**: lịch sử thành lập (nếu có)

**Danh mục (`/portfolio`)**
- Đăng ký / đăng nhập email + password (Supabase Auth)
- CRUD giao dịch mua/bán với giá mặc định = giá thị trường hiện tại
- Tính P&L theo giá vốn bình quân: lãi/lỗ chưa thực hiện + đã thực hiện
- Biểu đồ biến động giá trị danh mục 90 ngày
- Dữ liệu cô lập theo user (Row Level Security)

**Hệ thống**
- Đa ngôn ngữ: Tiếng Việt · Tiếng Nhật · English — chọn trên Navbar
- Số tiền hiển thị compact theo locale (`Intl.NumberFormat`)
- Dark mode toàn bộ

## Cấu trúc `src/`

```
src/
├── App.tsx                      # Router (createBrowserRouter), ProtectedRoute
├── components/
│   ├── AuthModal.tsx            # Đăng nhập / đăng ký
│   ├── CandleChart.tsx          # Biểu đồ nến + MA + MACD + RSI + Volume
│   ├── Navbar.tsx               # Navigation + chọn ngôn ngữ
│   ├── StockDetail.tsx          # Modal chi tiết: 4 tab phẳng
│   ├── StockTable.tsx           # Bảng danh sách + quotes + phân trang
│   └── portfolio/
│       ├── Portfolio.tsx        # Trang danh mục (layout + summary cards)
│       ├── HoldingsTable.tsx    # Bảng holdings
│       ├── PortfolioChart.tsx   # Biểu đồ giá trị 90 ngày
│       ├── TransactionList.tsx  # Lịch sử giao dịch
│       └── TransactionModal.tsx # Form thêm/sửa giao dịch
├── contexts/
│   └── I18nContext.tsx          # Language context + useT() hook
├── hooks/
│   ├── useStock.ts              # useStockList, useStockQuotes, useStockHistory, useCompanyInfo
│   └── usePortfolio.ts          # useAuth, useTransactions, mutations, usePortfolioHistory
└── lib/
    ├── api.ts                   # stockRequest() + response types
    ├── colors.ts                # quoteColor() — logic màu giá/biến động
    ├── i18n.ts                  # Translations: vi · ja · en
    ├── portfolio.ts             # computeHoldings, enrichHoldings, computeSummary, fmtMoney, fmtPrice
    ├── queryClient.ts           # TanStack Query client
    └── supabase.ts              # Supabase client + Transaction types
```

## Dependencies chính

```
react 19 · react-dom 19 · typescript
react-router-dom 7
@tanstack/react-query 5
@supabase/supabase-js 2
recharts 3
lightweight-charts 5
technicalindicators 3
tailwindcss 3 · lucide-react
```
