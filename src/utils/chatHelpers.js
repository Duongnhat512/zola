// Hàm đánh dấu tin nhắn đã đọc
export const markAsRead = (socket, conversationId, userId) => {
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

  // Import notification helpers
  import("./notificationHelpers").then(({
    shouldShowNotification,
    showNewMessageNotification,
    playNotificationSound
  }) => {
    // Kiểm tra xem có nên hiển thị thông báo không
    if (shouldShowNotification(msg, userMain.id, currentChat?.conversation_id)) {
      // Tìm thông tin cuộc trò chuyện từ state hiện tại
      setChats(prevChats => {
        const chat = prevChats.find(c => c.conversation_id === msg.conversation_id);

        if (chat) {
          // Xác định tên người gửi và tên nhóm
          let senderName = msg.sender_name || "Người dùng";
          let isGroup = chat.type === "group";
          let groupName = isGroup ? chat.name : null;

          // Hiển thị thông báo trình duyệt
          showNewMessageNotification(
            msg.message || "Đã gửi một tệp",
            senderName,
            isGroup,
            groupName
          );

          // Phát âm thanh thông báo
          playNotificationSound();
        }

        return prevChats; // Không thay đổi state
      });
    }
  });

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
  console.log("Created At:", msg.created_at, new Date(msg.created_at));
  setChats((prevChats) => {
    const updatedChats = [...prevChats]
      .map((chat) =>
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
      .sort((a, b) => {
        const aTime = a.last_message?.created_at
          ? new Date(a.last_message.created_at).getTime()
          : 0;
        const bTime = b.last_message?.created_at
          ? new Date(b.last_message.created_at).getTime()
          : 0;
        return bTime - aTime;
      });

    console.log("Updated Chats:", updatedChats); // Log để kiểm tra danh sách đã sắp xếp
    return updatedChats; // Trả về danh sách đã sắp xếp
  });
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

  socket.emit("set_hidden_message", payload, () => { });
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
  socket.emit("delete_message", payload, () => { });
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

export const handleImageChange = (e, setPreviewImage, setSelectedImage) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  let previewList = [];
  let selectedList = [];
  let loaded = 0;

  files.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = () => {
      previewList[idx] = reader.result;
      selectedList[idx] = {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_data: reader.result,
      };
      loaded++;
      if (loaded === files.length) {
        // Cộng dồn với state cũ
        setPreviewImage(prev => [...(prev || []), ...previewList]);
        setSelectedImage(prev => [...(prev || []), ...selectedList]);
      }
    };
    reader.readAsDataURL(file);
  });
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