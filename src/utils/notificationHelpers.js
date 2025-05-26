// Utility functions for handling browser notifications

// Yêu cầu quyền thông báo từ người dùng
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("Trình duyệt này không hỗ trợ thông báo");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

// Hiển thị thông báo trình duyệt
export const showBrowserNotification = (title, options = {}) => {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: "/favicon.ico", // Có thể thay đổi icon
      badge: "/favicon.ico",
      tag: "zalo-message", // Để tránh spam nhiều thông báo
      renotify: true,
      requireInteraction: false,
      ...options,
    });

    // Tự động đóng thông báo sau 5 giây
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Xử lý khi click vào thông báo
    notification.onclick = () => {
      window.focus(); // Focus vào cửa sổ ứng dụng
      notification.close();
    };

    return notification;
  }
  return null;
};

// Lấy cài đặt thông báo từ localStorage
const getNotificationSettings = () => {
  try {
    const settings = localStorage.getItem('notificationSettings');
    return settings ? JSON.parse(settings) : {
      browserNotifications: false,
      soundNotifications: true,
      showPreview: true,
      notifyWhenActive: false,
      soundType: 'facebook', // facebook, messenger, whatsapp, simple
    };
  } catch (error) {
    console.error('Lỗi khi đọc cài đặt thông báo:', error);
    return {
      browserNotifications: false,
      soundNotifications: true,
      showPreview: true,
      notifyWhenActive: false,
      soundType: 'facebook',
    };
  }
};

// Hiển thị thông báo cho tin nhắn mới
export const showNewMessageNotification = (message, senderName, isGroup = false, groupName = null) => {
  const settings = getNotificationSettings();
  
  // Kiểm tra xem có bật thông báo trình duyệt không
  if (!settings.browserNotifications) {
    return null;
  }

  // Kiểm tra xem trang có đang được focus không
  const isPageVisible = !document.hidden && document.hasFocus();
  
  // Chỉ hiển thị thông báo khi trang không được focus hoặc khi bật thông báo khi đang sử dụng
  if (isPageVisible && !settings.notifyWhenActive) {
    return null;
  }

  let title, body;
  
  if (isGroup) {
    title = groupName || "Nhóm chat";
    if (settings.showPreview) {
      body = `${senderName}: ${message}`;
    } else {
      body = `${senderName} đã gửi tin nhắn`;
    }
  } else {
    title = senderName || "Tin nhắn mới";
    if (settings.showPreview) {
      body = message;
    } else {
      body = "Bạn có tin nhắn mới";
    }
  }

  // Giới hạn độ dài tin nhắn hiển thị
  if (body.length > 100) {
    body = body.substring(0, 100) + "...";
  }

  return showBrowserNotification(title, {
    body: body,
    silent: !settings.soundNotifications, // Âm thanh dựa trên cài đặt
  });
};

// Tạo âm thanh thông báo giống Facebook bằng Web Audio API
const createFacebookLikeSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Tạo âm thanh "pop" giống Facebook với 2 nốt nhạc
    const createTone = (frequency, startTime, duration) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      
      // Envelope cho âm thanh mượt mà
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    // Tạo 2 nốt nhạc giống Facebook: C6 và E6
    createTone(1047, audioContext.currentTime, 0.15); // C6
    createTone(1319, audioContext.currentTime + 0.08, 0.15); // E6
    
    return true;
  } catch (error) {
    console.log("Không thể tạo âm thanh bằng Web Audio API:", error);
    return false;
  }
};

// Tạo âm thanh giống Messenger
const createMessengerSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.05);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.25);
    
    return true;
  } catch (error) {
    console.log("Không thể tạo âm thanh Messenger:", error);
    return false;
  }
};

// Tạo âm thanh giống WhatsApp
const createWhatsAppSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(554, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
    
    return true;
  } catch (error) {
    console.log("Không thể tạo âm thanh WhatsApp:", error);
    return false;
  }
};

// Tạo âm thanh đơn giản
const createSimpleSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    return true;
  } catch (error) {
    console.log("Không thể tạo âm thanh đơn giản:", error);
    return false;
  }
};

// Phát âm thanh thông báo
export const playNotificationSound = () => {
  const settings = getNotificationSettings();
  
  // Kiểm tra xem có bật âm thanh thông báo không
  if (!settings.soundNotifications) {
    return;
  }

  // Sử dụng chung file facebook-notification.mp3 cho tất cả
  const getAudioFile = () => {
    return '/facebook-notification.mp3';
  };

  // Fallback âm thanh tự tạo nếu không có file
  const playFallbackSound = () => {
    switch (settings.soundType) {
      case 'facebook':
        return createFacebookLikeSound();
      case 'messenger':
        return createMessengerSound();
      case 'whatsapp':
        return createWhatsAppSound();
      case 'simple':
        return createSimpleSound();
      default:
        return createFacebookLikeSound();
    }
  };

  try {
    const audioFile = getAudioFile();
    const audio = new Audio(audioFile);
    audio.volume = 0.6; // Âm lượng 60%
    
    // Thử phát file âm thanh trước
    audio.play().catch(() => {
      console.log(`Không thể phát file ${audioFile}, sử dụng âm thanh tự tạo`);
      // Nếu không phát được file âm thanh, dùng âm thanh tự tạo
      playFallbackSound();
    });
  } catch {
    console.log('Lỗi khi tạo Audio object, sử dụng âm thanh tự tạo');
    // Fallback: phát âm thanh tự tạo
    playFallbackSound();
  }
};

// Kiểm tra xem có nên hiển thị thông báo không
export const shouldShowNotification = (messageData, currentUserId, selectedChatId) => {
  // Không hiển thị thông báo cho tin nhắn của chính mình
  if (messageData.sender_id === currentUserId) {
    return false;
  }

  // Không hiển thị thông báo nếu đang ở trong cuộc trò chuyện đó và trang đang được focus
  const isPageVisible = !document.hidden && document.hasFocus();
  if (isPageVisible && selectedChatId === messageData.conversation_id) {
    return false;
  }

  return true;
};

// Khởi tạo hệ thống thông báo
export const initializeNotificationSystem = () => {
  // Yêu cầu quyền thông báo khi ứng dụng khởi động
  requestNotificationPermission();
  
  // Lắng nghe sự kiện visibility change để quản lý thông báo
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // Khi người dùng quay lại trang, có thể clear các thông báo cũ
      console.log("Người dùng đã quay lại trang");
    }
  });
}; 