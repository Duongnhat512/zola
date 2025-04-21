// Hàm đánh dấu tin nhắn đã đọc
export const markAsRead = (socket, conversationId, userId, setChats) => {
  socket.emit("mark_as_read", {
    conversation_id: conversationId,
    user_id: userId,
  });
};

// Hàm xử lý thêm emoji vào input
export const addEmojiToInput = (
  emojiUrl,
  setInput,
  setIsEmojiPickerVisible
) => {
  const emojiUnicode = String.fromCodePoint(
    ...emojiUrl
      .split("/")
      .pop()
      .split(".")[0]
      .split("-")
      .map((hex) => parseInt(hex, 16))
  );
  setInput((prev) => prev + emojiUnicode);
  setIsEmojiPickerVisible(false);
};

// Hàm xử lý tin nhắn mới
export const handleNewMessage = (
  msg,
  selectedChatRef,
  userMain,
  setMessages,
  setChats,
  markAsRead
) => {
  const currentChat = selectedChatRef.current;

  if (currentChat?.conversation_id === msg.conversation_id) {
    markAsRead(msg.conversation_id);
    setMessages((prev) => [
      ...prev,
      {
        id: msg.message_id,
        sender: msg.sender_id === userMain.id ? "me" : "other",
        avatar:
          msg.sender_id === userMain.id
            ? userMain.avatar || "/default-avatar.jpg"
            : msg.sender_avatar || "/default-avatar.jpg",
        text: msg.message,
        media: msg.media,
        type: msg.type,
        time: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        file_name: msg.file_name || null,
      },
    ]);
  }
  setChats((prevChats) =>
    prevChats.map((chat) =>
      chat.conversation_id === msg.conversation_id
        ? {
            ...chat,
            unread_count:
              currentChat?.conversation_id === msg.conversation_id
                ? chat.unread_count // Không tăng nếu đang ở trong cuộc trò chuyện
                : (chat.unread_count || 0) + 1,
            last_message: {
              ...chat.last_message,
              message: msg.message,
              created_at: msg.created_at,
              type: msg.type,
            },
          }
        : chat
    )
  );
};

export const copyMessage = (text) => {
  navigator.clipboard.writeText(text);
  console.log("Copied:", text);
};

// Hàm xóa tin nhắn
export const deleteMessage = (socket, userId, idMessage, setMessages) => {
  const payload = {
    user_id: userId,
    message_id: idMessage,
  };
  console.log("hidden message payload:", payload);

  socket.emit("set_hidden_message", payload, () => {});
  setMessages((prev) => prev.filter((msg) => msg.id !== idMessage));
};

// Hàm thu hồi tin nhắn
export const revokeMessage = (socket, userId, idMessage, setMessages) => {
  console.log("Revoke message:", idMessage);

  const payload = {
    user_id: userId,
    message_id: idMessage,
  };
  console.log("Revoke message payload:", payload);
  socket.emit("delete_message", payload, () => {});
  setMessages((prev) =>
    prev.map((msg) =>
      msg.id === idMessage
        ? {
            ...msg,
            text: "Tin nhắn đã thu hồi",
            media: null,
            file_name: null,
          }
        : msg
    )
  );
};
export const scrollToBottom = (messagesEndRef) => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }
};

// Hàm xử lý thay đổi hình ảnh
export const handleImageChange = (e, setPreviewImage, setSelectedImage) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result); // Lưu ảnh xem trước vào state
      setSelectedImage({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_data: reader.result, // Base64 của ảnh
      }); // Lưu thông tin file vào state
    };
    reader.readAsDataURL(file); // Đọc file dưới dạng Base64
  }
  e.target.value = "";
};

// Hàm xử lý thay đổi tệp
export const handleFileChange = (e, setSelectedFile, sendMessageCallback) => {
  const file = e.target.files[0];
  if (!file) {
    console.error("No file selected");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const fileData = {
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_data: reader.result, // Base64 của file
    };

    setSelectedFile(fileData); // Lưu thông tin file vào state

    // Gọi hàm sendMessage ngay sau khi file được chọn
    sendMessageCallback(fileData);
  };

  reader.onerror = (error) => {
    console.error("Error reading file:", error);
  };

  reader.readAsDataURL(file); // Đọc file dưới dạng Base64
  e.target.value = ""; // Đặt lại giá trị của input file để có thể chọn lại cùng một file
};

export const handleVideoChange = (e, setSelectedVideo, sendMessageCallback) => {
  const file = e.target.files[0];
  if (!file) {
    console.error("No video selected");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const videoData = {
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_data: reader.result, // Base64 của video
    };

    setSelectedVideo(videoData); // Lưu thông tin video vào state

    // Gửi video ngay sau khi chọn
    sendMessageCallback(videoData);
  };

  reader.onerror = (error) => {
    console.error("Error reading video:", error);
  };

  reader.readAsDataURL(file); // Đọc video dưới dạng Base64
  e.target.value = ""; // Đặt lại giá trị của input video để có thể chọn lại cùng một video
};
