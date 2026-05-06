# stock-frontend

React frontend hiển thị danh sách chứng khoán Việt Nam, kết nối với stock-backend.

## Yêu cầu

- Node.js 18+
- npm 9+
- `stock-backend` đang chạy tại `http://localhost:8000`

## Cài đặt

```bash
npm install
```

## Cấu hình

Tạo file `.env` tại thư mục gốc:

```env
VITE_BACKEND_API_KEY=secret123   # phải khớp với API_KEY trong backend
```

## Chạy

```bash
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

## Build production

```bash
npm run build
npm run preview
```

## Tính năng

- Danh sách ~1537 mã chứng khoán với tìm kiếm và phân trang
- Bảng giá theo thời gian thực: Giá khớp · Cao · Thấp · Biến động % · Khối lượng
- Biểu đồ giá 90 ngày khi click vào mã (Recharts)
- Thông tin công ty: sàn, ngày niêm yết, CEO, vốn điều lệ, website
- Tự động refresh giá mỗi 2 phút

## Dependencies chính

```
react 19 · typescript · vite 8
@tanstack/react-query · recharts · tailwindcss · lucide-react
```
