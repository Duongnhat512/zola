# Hướng dẫn sử dụng tính năng thông báo Zalo PC

## Tổng quan
Ứng dụng Zalo PC đã được tích hợp hệ thống thông báo hoàn chỉnh để bạn không bỏ lỡ tin nhắn quan trọng nào.

## Các tính năng thông báo

### 1. Thông báo trình duyệt
- **Mô tả**: Hiển thị thông báo popup trên desktop ngay cả khi bạn không ở trong ứng dụng
- **Cách bật**: Vào Cài đặt > Thông báo > Bật "Thông báo trình duyệt"
- **Lưu ý**: Trình duyệt sẽ yêu cầu quyền thông báo lần đầu tiên

### 2. Âm thanh thông báo
- **Mô tả**: Phát âm thanh khi có tin nhắn mới
- **Các loại âm thanh**:
  - **Facebook**: Âm thanh "pop" đặc trưng giống Facebook
  - **Messenger**: Âm thanh mềm mại giống Messenger
  - **WhatsApp**: Âm thanh ba nốt giống WhatsApp
  - **Đơn giản**: Âm thanh cơ bản
- **Cách thay đổi**: Vào Cài đặt > Thông báo > Chọn loại âm thanh

### 3. Hiển thị nội dung tin nhắn
- **Bật**: Hiển thị đầy đủ nội dung tin nhắn trong thông báo
- **Tắt**: Chỉ hiển thị "Bạn có tin nhắn mới" để bảo mật

### 4. Thông báo khi đang sử dụng ứng dụng
- **Bật**: Hiển thị thông báo ngay cả khi đang ở trong ứng dụng
- **Tắt**: Chỉ hiển thị thông báo khi không ở trong ứng dụng

### 5. Hiển thị số tin nhắn chưa đọc trên title
- Tự động hiển thị số tin nhắn chưa đọc trên tiêu đề trang
- Ví dụ: "(3) Zalo PC" khi có 3 tin nhắn chưa đọc

## Cách truy cập cài đặt thông báo

### Cách 1: Từ menu chính
1. Click vào avatar ở góc trên bên trái
2. Chọn "Cài đặt"
3. Chọn tab "Thông báo"

### Cách 2: Từ sidebar
1. Click vào icon "Cài đặt" ở sidebar bên trái
2. Chọn tab "Thông báo"

## Xử lý sự cố

### Không nhận được thông báo trình duyệt
1. Kiểm tra quyền thông báo trong trình duyệt:
   - Chrome: Settings > Privacy and security > Site Settings > Notifications
   - Firefox: Preferences > Privacy & Security > Permissions > Notifications
2. Đảm bảo đã bật "Thông báo trình duyệt" trong cài đặt ứng dụng

### Không có âm thanh thông báo
1. Kiểm tra âm lượng hệ thống
2. Đảm bảo đã bật "Âm thanh thông báo" trong cài đặt
3. Thử các loại âm thanh khác nhau
4. Click "Thử" để kiểm tra âm thanh

### Thông báo spam quá nhiều
1. Tắt "Thông báo khi đang sử dụng ứng dụng"
2. Tắt "Hiển thị nội dung tin nhắn" nếu muốn bảo mật hơn

## Lưu ý kỹ thuật

### File âm thanh
- Ứng dụng sử dụng file âm thanh chung: `/public/facebook-notification.mp3`
- Fallback: Web Audio API tự tạo âm thanh theo loại được chọn nếu không có file
- Tất cả các loại âm thanh (Facebook, Messenger, WhatsApp, Đơn giản) đều sử dụng chung file này
- Định dạng hỗ trợ: MP3, WAV, OGG
- Có thể thay thế file `facebook-notification.mp3` để tùy chỉnh âm thanh cho toàn bộ ứng dụng

### Tương thích trình duyệt
- Chrome: Hỗ trợ đầy đủ
- Firefox: Hỗ trợ đầy đủ
- Safari: Hỗ trợ hạn chế (cần tương tác người dùng trước)
- Edge: Hỗ trợ đầy đủ

### Bảo mật
- Cài đặt thông báo được lưu trong localStorage
- Không gửi thông tin cá nhân ra ngoài
- Có thể tắt hiển thị nội dung tin nhắn để bảo mật

## Cách thay thế file âm thanh tùy chỉnh

### Bước 1: Chuẩn bị file âm thanh
- Tạo hoặc tải file âm thanh định dạng MP3, WAV hoặc OGG
- Đặt tên file là `facebook-notification.mp3`
- Thời lượng khuyến nghị: 0.5-2 giây
- Chất lượng: 44.1kHz, 16-bit

### Bước 2: Thay thế file
1. Mở thư mục `public/` trong dự án
2. Backup file cũ (nếu cần): đổi tên `facebook-notification.mp3` thành `facebook-notification-backup.mp3`
3. Copy file âm thanh mới vào và đặt tên `facebook-notification.mp3`
4. Refresh trang web để áp dụng thay đổi

### Bước 3: Kiểm tra
- Vào Cài đặt > Thông báo
- Click nút "Thử" để kiểm tra âm thanh mới
- Nếu không có âm thanh, kiểm tra console để xem lỗi

## Cập nhật và phát triển

Tính năng thông báo sẽ được cập nhật thêm:
- Thông báo push trên mobile
- Tùy chỉnh âm thanh riêng cho từng cuộc trò chuyện
- Lịch trình thông báo (Do Not Disturb)
- Thông báo email cho tin nhắn quan trọng 