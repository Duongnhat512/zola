import { useEffect } from 'react';

// Hook để cập nhật title trang với số tin nhắn chưa đọc
export const useNotificationTitle = (unreadCount) => {
  useEffect(() => {
    const originalTitle = 'Zalo PC';
    
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${originalTitle}`;
      
      // Tạo hiệu ứng nhấp nháy cho favicon (nếu có)
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        const originalHref = favicon.href;
        
        // Tạo hiệu ứng nhấp nháy
        const blinkInterval = setInterval(() => {
          favicon.href = favicon.href === originalHref ? 'data:,' : originalHref;
        }, 1000);
        
        // Dọn dẹp khi component unmount hoặc không còn tin nhắn chưa đọc
        return () => {
          clearInterval(blinkInterval);
          favicon.href = originalHref;
        };
      }
    } else {
      document.title = originalTitle;
    }
    
    // Cleanup khi component unmount
    return () => {
      document.title = originalTitle;
    };
  }, [unreadCount]);
};

// Hook để tính tổng số tin nhắn chưa đọc từ danh sách chat
export const useTotalUnreadCount = (chats) => {
  return chats.reduce((total, chat) => total + (chat.unread_count || 0), 0);
}; 