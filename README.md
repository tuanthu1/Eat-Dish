# EatDish-Project

## Tổng quan
EatDish-Project là một ứng dụng web chia sẻ công thức nấu ăn. Frontend dùng Vite + React (thư mục `client/`), backend là Node.js + Express kết nối MongoDB (thư mục `server/`).

## Tính năng chính
- Đăng ký/đăng nhập người dùng (JWT)
- Tạo / chỉnh sửa / xoá công thức
- Đánh giá & bình luận công thức
- Tìm kiếm, phân loại và lọc công thức
- Thanh toán gói Premium (nếu cấu hình)

## Yêu cầu
- Node.js >= 16
- npm hoặc yarn
- MongoDB (local hoặc Atlas)

## Cấu trúc dự án (tóm tắt)
- `client/` — Frontend (Vite + React)
- `server/` — Backend (Express, controllers, models, routes)
- `server/models` — các mô hình Mongoose
- `server/controllers` — logic xử lý request
- `server/routes` — định nghĩa route API

## Thiết lập môi trường (phát triển)

1) Clone repo

```bash
git clone <repo-url> 
cd EatDish-Project
```

2) Frontend

```bash
cd client
npm install
npm run dev
```

Frontend mặc định chạy ở `http://localhost:5173` (theo cấu hình Vite).

3) Backend

```bash
cd server
npm install
# sao chép file mẫu .env_example thành .env và chỉnh các biến
cp .env_example .env   # trên PowerShell dùng: Copy-Item .env_example .env
npm run dev # hoặc npm start
```

Backend mặc định lắng nghe ở `http://localhost:5000` (hoặc port trong `.env`).

## Biến môi trường (mẫu)
Nội dung `server/.env_example` hiện tại:

```
PORT=5000
MONGO_URI=
MAIL_USER=
MAIL_PASS=
FRONTEND_URL=https://localhost
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5000
JWT_SECRET=
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
DOMAIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GROQ_API_KEY=
GROQ_MODEL=
WEATHER_API_KEY=
```

Giải thích nhanh các biến quan trọng:
- `MONGO_URI` — chuỗi kết nối MongoDB (bắt buộc)
- `JWT_SECRET` — khóa bí mật để ký token JWT
- `PORT` — port backend
- `CLIENT_URL` / `FRONTEND_URL` — URL frontend để cấu hình CORS
- Cloudinary / Mail / PAYOS / Stripe vars — chỉ cần cấu hình nếu bạn dùng các dịch vụ đó

## Scripts hay dùng
- Frontend: `client/npm run dev`, `client/npm run build`
- Backend: `server/npm run dev` (thường dùng nodemon), `server/npm start` (production)

Kiểm tra `package.json` trong hai thư mục để biết chi tiết scripts.

## Build & Deploy (tóm tắt)
- Frontend: `cd client && npm run build` → upload thư mục `dist` lên hosting (Netlify, Vercel, static server...)
- Backend: Thiết lập biến môi trường production, dùng PM2 / Docker / hệ thống hosting để chạy `npm start`.

Ví dụ nhanh với Docker (gợi ý):

1. Tạo `Dockerfile` cho server và `Dockerfile` cho client
2. Xây image và chạy container, cấu hình biến môi trường và mạng nối giữa client/server.

## Kiểm tra & Debug
- Kiểm tra console logs server để biết lỗi kết nối DB hoặc lỗi runtime.
- Dùng `Postman` hoặc `Insomnia` để gọi các endpoint API.
- Nếu lỗi CORS, kiểm tra `CLIENT_URL`/CORS middleware trên server.

## Contributing
- Mở issue mô tả lỗi/tính năng
- Tạo branch feature/fix, commit, và gửi Pull Request

## Liên hệ
- Tác giả/Người duy trì: https://fb.com/tuanthu2911

---
