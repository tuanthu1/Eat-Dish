# EatDish-Project

## Mô tả
- **Tên:** EatDish-Project
- **Mục tiêu:** Ứng dụng web chia sẻ công thức nấu ăn với frontend (Vite + React) trong `client/` và backend (Node.js + Express + MongoDB) trong `server/`.

## Yêu cầu trước
- Node.js >= 16
- npm hoặc yarn
- MongoDB (local hoặc Atlas)

## Cấu trúc chính
- **client:** mã nguồn frontend (Vite + React)
- **server:** API và logic backend (Express, models, controllers)

## Cài đặt và chạy (phát triển)
1. Cài đặt dependencies cho frontend:

```bash
cd client
npm install
npm run dev
```

2. Cài đặt dependencies cho backend và khởi chạy server:

```bash
cd server
npm install
# sửa file .env_example thành .env và thay các cấu trúc bên trong thành của bạn
npm run dev # hoặc npm start tùy cấu hình package.json
```

## Biến môi trường mẫu (`server/.env`)
- `PORT`=3000
- `MONGO_URI`=<kết nối MongoDB>
- `JWT_SECRET`=<khóa bí mật cho JWT>
- `CLIENT_URL`=<địa chỉ frontend, ví dụ http://localhost:5173>
- `STRIPE_SECRET_KEY`=<nếu dùng Stripe để thanh toán>
- `STRIPE_WEBHOOK_SECRET`=<nếu dùng Stripe webhook>
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` (nếu gửi email xác thực / reset)

Lưu ý: Chỉ thêm những biến bạn thực sự sử dụng trong repo.

## Migrations / Seed
- Nếu dự án có script migrate, chạy tương tự:

```bash
cd server
node migrate.js
```

## Build cho production
- Frontend:

```bash
cd client
npm run build
# deploy phần build theo hướng dẫn hosting
```

- Backend: cấu hình `NODE_ENV=production` và chạy process manager (pm2, docker, etc.)

## Kiểm tra và debug
- Kiểm tra logs backend để biết lỗi kết nối DB hoặc lỗi API.
- Sử dụng `Postman` / `curl` để test endpoint API.

## Đóng góp
- Tạo issue hoặc fork repo và gửi pull request.

## Liên hệ
- Thông tin liên hệ:
 - https://fb.com/tuanthu2911

---

> Tệp này là bản tóm tắt nhanh. Nếu bạn muốn mình mở rộng thành README chi tiết (mô tả environment cụ thể, scripts từ package.json, hướng dẫn deploy Docker, hoặc hướng dẫn test), nói mình biết yêu cầu cụ thể.