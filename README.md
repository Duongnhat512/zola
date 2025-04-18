# Zola – Backend Microservices

Zola là một hệ thống backend được xây dựng theo kiến trúc microservices, bao gồm các dịch vụ chính như:

- **api-gateway**: Cổng giao tiếp chính giữa client và các dịch vụ nội bộ.
- **auth-service**: Xử lý xác thực và phân quyền người dùng.
- **chat-service**: Quản lý các chức năng nhắn tin và trò chuyện.
- **friend-service**: Quản lý mối quan hệ bạn bè và kết nối người dùng.

## 🚀 Tính năng nổi bật

- Kiến trúc microservices giúp dễ dàng mở rộng và bảo trì.
- Sử dụng Docker và Docker Compose để triển khai nhanh chóng.
- Tích hợp các dịch vụ một cách linh hoạt và hiệu quả.

## 🛠️ Công nghệ sử dụng

- **Ngôn ngữ lập trình**: JavaScript (Node.js)
- **Cơ sở dữ liệu**: DynamoDB
- **Giao tiếp giữa các dịch vụ**: REST API
- **Quản lý phiên và xác thực**: JWT

## 📦 Cài đặt và chạy dự án

1. **Clone repository:**

   ```bash
   git clone https://github.com/Duongnhat512/zola.git
   cd zola
   ```

2. **Khởi động các dịch vụ bằng Docker Compose:**

   ```bash
   docker-compose up --build
   ```

   Lưu ý: Đảm bảo Docker và Docker Compose đã được cài đặt trên hệ thống của bạn.

## 📁 Cấu trúc thư mục

```
zola/
├── api-gateway/
├── auth-service/
├── chat-service/
├── friend-service/
├── docker-compose.yml
└── README.md
```

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp từ cộng đồng. Vui lòng tạo pull request hoặc mở issue để thảo luận về các cải tiến hoặc báo cáo lỗi.

## 📄 Giấy phép

Dự án này được phát hành dưới giấy phép MIT. Xem thêm trong [LICENSE](./LICENSE).
