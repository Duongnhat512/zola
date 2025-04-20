// Hàm đánh dấu tin nhắn đã đọc
export const markAsRead = (socket, conversationId, userId, setChats) => {
  socket.emit("mark_as_read", {
    conversation_id: conversationId,
    user_id: userId,
  });

  setChats((prevChats) =>
    prevChats.map((chat) =>
      chat.conversation_id === conversationId
        ? { ...chat, is_unread: false, unread_count: 0 }
        : chat
    )
  );
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
    // Nếu cuộc trò chuyện hiện tại đang mở, đánh dấu là đã đọc
    markAsRead(msg.conversation_id);

    // Thêm tin nhắn mới vào danh sách tin nhắn
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
  } else {
    // Nếu không phải cuộc trò chuyện hiện tại, tăng unread_count
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.conversation_id === msg.conversation_id
          ? {
              ...chat,
              unread_count: (chat.unread_count || 0) + 1,
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
  }
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
};

// Hàm xử lý thay đổi tệp
export const handleFileChange = (e, setSelectedFile, sendMessageCallback) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);
    
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
  };
export const sendMessage = ({
    input,
    previewImage,
    selectedFile,
    selectedChat,
    userMain,
    setMessages,
    fetchConversations,
    setInput,
    setPreviewImage,
    setSelectedFile,
    setSelectedImage,
    socket,
    selectedImage
  }) => {
    if (!input.trim() && !previewImage && !selectedFile) return; // Không gửi nếu không có nội dung
    const tempId = `msg-${Date.now()}`;
    const isGroup = selectedChat?.list_user_id?.length > 2;
  
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender: "me",
        avatar: userMain.avatar || "/default-avatar.jpg",
        text: input || null,
        media: previewImage || null,
        file_name: selectedFile?.file_name || null,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "pending",
      },
    ]);
  
    const msg = {
      conversation_id: selectedChat?.conversation_id || null,
      receiver_id: selectedChat?.list_user_id?.find((id) => id !== userMain.id) || null,
      message: input || null,
      file_name: selectedImage?.file_name || selectedFile?.file_name || null,
      file_type: selectedImage?.file_type || selectedFile?.file_type || null,
      file_size: selectedImage?.file_size || selectedFile?.file_size || null,
      file_data: selectedImage?.file_data || selectedFile?.file_data || null,
    };
  
    const event = isGroup ? "send_group_message" : "send_private_message";
    socket.emit(event, msg, () => {});
    socket.on("message_sent", (msg) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                id: msg.message_id,
                text: msg.message || null,
                media: msg.media || null,
                file_name: msg.file_name || null,
                type: msg.type || "text",
                time: new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                status: "sent",
              }
            : m
        )
      );
      fetchConversations();
    });
  
    setInput("");
    setPreviewImage(null);
    setSelectedFile(null);
    setSelectedImage(null);

  };