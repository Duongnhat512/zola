import React, { useEffect, useState } from "react";
import { SmileOutlined, SendOutlined } from "@ant-design/icons";
import {
  EllipsisOutlined,
  CopyOutlined,
  DeleteOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Input, Avatar, Button, Dropdown, Menu, Image } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  PaperClipOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import socket from "../../services/Socket";
import { useSelector } from "react-redux";
import { useRef } from "react";
import { hiddenMessage } from "../../services/UserService";
import AddMember from "../../pages/Group/AddMember";
import InfoGroup from "../../pages/Group/InfoGroup";
const ChatWindow = ({ selectedChat }) => {
  const selectedChatRef = useRef();
  const [emojiList, setEmojiList] = useState({});
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isInfoGroupVisible, setIsInfoGroupVisible] = useState(false);

  const handleOpen = () => setIsModalVisible(true);
  const handleClose = () => setIsModalVisible(false);
  console.log("Selected chat:", selectedChat);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);
  const userMain = useSelector((state) => state.user.user);

  useEffect(() => {
    console.log(1);

    if (!selectedChat?.conversation_id) return;

    socket.emit("get_messages", {
      conversation_id: selectedChat.conversation_id,
    });

    socket.on("list_messages", (data) => {
      console.log("Received messages:", data);

      const dataSort = data.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      const formattedMessages = dataSort.map((msg) => ({
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
      }));

      setMessages(formattedMessages);
    });

    return () => {
      socket.off("list_messages");
    };
  }, [selectedChat?.conversation_id, selectedChat?.user_id, userMain.id]);

  useEffect(() => {
    socket.on("new_message", (msg) => {
      const currentChat = selectedChatRef.current;
      console.log("New message received:", msg);
      
      if (
        currentChat?.conversation_id === msg.conversation_id
      ) {
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
          },
        ]);
      }
    });
    return () => {
      socket.off("new_message");
    };
  }, [userMain.id]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    // Gọi API để lấy danh sách emoji
    const fetchEmojis = async () => {
      try {
        const response = await fetch("https://api.github.com/emojis");
        const data = await response.json();
        setEmojiList(data);
      } catch (error) {
        console.error("Failed to fetch emojis:", error);
      }
    };

    fetchEmojis();
  }, []);
  const addEmojiToInput = (emojiUrl) => {
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
  const emojiDropdown = (
    <div className="grid grid-cols-8 gap-2 p-2 bg-white shadow-lg rounded-lg max-h-64 overflow-y-auto">
      {Object.entries(emojiList).map(([name, url]) => (
        <img
          key={name}
          src={url}
          alt={name}
          className="w-8 h-8 cursor-pointer"
          onClick={() => addEmojiToInput(url)}
        />
      ))}
    </div>
  );
  const sendMessage = () => {
    if (!input.trim() && !previewImage) return;

    const tempId = `msg-${Date.now()}`;
    const isGroup = selectedChat?.list_user_id?.length > 1;

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender: "me",
        avatar: userMain.avatar || "/default-avatar.jpg",
        text: input,
        image: previewImage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "pending",
      },
    ]);
    if (isGroup) {
      let msg = {
        conversation_id: selectedChat?.conversation_id,
        message: input,
        type: "text",
        status: "sent",
      };
      socket.emit("send_group_message", msg, (response) => {
        if (response.status === "success") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? {
                    ...m,
                    id: response.message_id,
                    status: "sent",
                    time: new Date(response.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  }
                : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
          );
        }
      });
    } else {
      let msg = {
        receiver_id: selectedChat?.list_user_id[0],
        message: input,
        type: "text",
        status: "sent",
      };
      // Gửi tin nhắn cá nhân
      socket.emit("send_private_message", msg, (response) => {
        if (response.status === "success") {
          // Cập nhật trạng thái tin nhắn thành "sent"
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? {
                    ...m,
                    id: response.message_id,
                    status: "sent",
                    time: new Date(response.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  }
                : m
            )
          );
        } else {
          // Nếu gửi thất bại, cập nhật trạng thái thành "failed"
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
          );
        }
      });
    }

    setInput(""); // Xóa nội dung trong ô nhập
    setPreviewImage(null); // Clear the preview image after sending
  };
  const sendFile = (file) => {
    if (!file) return;

    const msg = {
      receiver_id: selectedChat?.list_user_id[0],
      file, // File to be sent
      type: "file",
      status: "sent",
    };

    socket.emit("send_private_file", msg, (response) => {
      // if (response.status === "success") {
      console.log("File sent successfully:", response);
      setMessages((prev) => [
        ...prev,
        {
          id: response.message_id,
          sender: "me",
          avatar: userMain.avatar || "/default-avatar.jpg",
          text: file.name, // Display file name
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "file",
          fileUrl: response.file_url, // URL of the uploaded file
        },
      ]);
      // } else {
      // console.error("Failed to send file:", response.error);
      // }
    });
    console.log("Emitting file_sent event with data:");
  };

  const sendImage = async (image) => {
    if (!image) return;

    const tempId = `msg-${Date.now()}`;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(",")[1];

      const fileMessage = {
        conversation_id: selectedChat?.conversation_id,
        sender_id: userMain.id,
        receiver_id: selectedChat?.list_user_id[0],
        file_name: image.name,
        file_type: image.type,
        file_size: image.size,
        file_data: `data:${image.type};base64,${base64Data}`,
        message: `Đã gửi ảnh: ${image.name}`,
        type: "image",
      };
      // setMessages((prev) => [
      //   ...prev,
      //   // {
      //   //   id: tempId,
      //   //   sender: "me",
      //   //   avatar: userMain.avatar || "/default-avatar.jpg",
      //   //   text: "[Đang gửi ảnh...]",
      //   //   time: now.toLocaleTimeString([], {
      //   //     hour: "2-digit",
      //   //     minute: "2-digit",
      //   //   }),
      //   //   status: "pending",
      //   //   type: "image",
      //   // },
      // ]);

      socket.emit("send_private_file", fileMessage, (response) => {
        // if (response.success) {
        // setMessages((prev) =>
        //   prev.map((m) =>
        //     m.id === tempId
        //       ? {
        //           ...m,
        //           id: response.message_id || tempId,
        //           status: "sent",
        //           text: "[Ảnh đã gửi]",
        //           time: response.time
        //             ? new Date(response.time).toLocaleTimeString([], {
        //                 hour: "2-digit",
        //                 minute: "2-digit",
        //               })
        //             : m.time,
        //           imageUrl: response.file_url,
        //           sender: response.sender_id === userMain.id ? "me" : "other",
        //           avatar:
        //             response.sender_id === userMain.id
        //               ? userMain.avatar || "/default-avatar.jpg"
        //               : selectedChat?.user?.avt || "/default-avatar.jpg",
        //         }
        //       : m
        //   )
        // );
      });
    };
    socket.on("file_sent", (data) => {
      console.log("File sent:", data);
      setMessages((prev) => [
        ...prev,
        {
          id: data.message_id,
          sender: "me",
          avatar: userMain.avatar || "/default-avatar.jpg",
          text: "Ảnh", // Display file name
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "file",
          fileUrl: data.file_url, // URL of the uploaded file
        },
      ]);
    });
    reader.readAsDataURL(image);
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result); // Set the preview image
      };
      reader.readAsDataURL(file);
    }
  };
  const messagesEndRef = useRef(null); 
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const messageOptions = (msg) => (
    <Menu>
      <Menu.Item
        key="copy"
        icon={<CopyOutlined />}
        onClick={() => copyMessage(msg.text)}
      >
        Copy tin nhắn
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => deleteMessage(msg.id)}
      >
        Xóa tin nhắn ở phía tôi
      </Menu.Item>
      <Menu.Item
        key="revoke"
        icon={<UndoOutlined />}
        onClick={() => revokeMessage(msg.id)}
      >
        Thu hồi tin nhắn
      </Menu.Item>
    </Menu>
  );
  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    console.log("Copied:", text);
  };
  const deleteMessage = async (idMessage) => {
    try {
      const response = await hiddenMessage(idMessage, userMain.id);
      if (response.status === "success") {
        setMessages((prev) => prev.filter((msg) => msg.id !== idMessage));
        console.log("Message hidden successfully:", idMessage);
      } else {
        console.error("Failed to hide message:", response.data);
      }
    } catch (error) {
      console.error("Error while hiding message:", error);
    }
  };
  const revokeMessage = (idMessage) => {
    const payload = {
      user_id: userMain.id, // ID của người dùng hiện tại
      message_id: idMessage, // ID của tin nhắn cần xóa
    };

    // Gửi sự kiện delete_message qua socket
    socket.emit("delete_message", payload, (response) => {
      if (response.status === "success") {
        // Xóa tin nhắn khỏi danh sách nếu thành công
        setMessages((prev) => prev.filter((msg) => msg.id !== idMessage));
        console.log("Message deleted successfully:", idMessage);
      } else {
        console.error("Failed to delete message:", response.error);
      }
    });
  };
  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center flex-col text-center flex-1">
        <h1 className="text-2xl font-semibold text-gray-800">
          Chào mừng đến với <span className="text-blue-600">Zalo PC</span>!
        </h1>
        <p className="text-sm text-gray-600 mt-2 max-w-md">
          Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người thân,
          bạn bè được tối ưu hoá cho máy tính của bạn.
        </p>
      </div>
    );
  }
  console.log(messages);
  
  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-white p-4 shadow flex items-center justify-between">
        <div className="flex items-center">
          <Avatar
            src={selectedChat?.avatar || "/default-avatar.jpg"}
            size="large"
            className="mr-3"
          />
          <div>
            <h2 className="font-semibold">{selectedChat?.name}</h2>
            {selectedChat?.list_user_id?.length > 1 ? (
              <p className="text-sm text-gray-500">{selectedChat?.list_user_id?.length +1} thành viên</p>
            ) : (
              <p className="text-sm text-gray-500">Vừa truy cập</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button className="flex gap-2 ml-2" onClick={() => {
             handleOpen();
          }}>
            <UserOutlined className="text-gray-500 text-lg cursor-pointer hover:text-blue-500" />
          </Button>
          <button className="text-gray-600 hover:text-blue-500">
            <VideoCameraOutlined className="text-xl" title="Video call" />
          </button>
          <button className="text-gray-600 hover:text-blue-500">
            <SearchOutlined className="text-xl" title="Tìm kiếm" />
          </button>
          <button className="text-gray-600 hover:text-blue-500" 
          onClick={() => {
            setIsInfoGroupVisible(!isInfoGroupVisible);
          }}
          >
            <InfoCircleOutlined
              className="text-xl"
              title="Thông tin hộp thoại"
            />
          </button>
        </div>
      </div>
      {isInfoGroupVisible && (
      <InfoGroup selectedChat={selectedChat} visible={isInfoGroupVisible} onClose={handleClose} />
     )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "me" ? "justify-end" : "items-start"
            } gap-2`}
          >
            {msg.sender !== "me" && (
              <Avatar
                src={msg.avatar || "/default-avatar.jpg"}
                size="small"
                className="self-end"
              />
            )}
            <div
              className={`flex flex-col items-${
                msg.sender === "me" ? "end" : "start"
              }`}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "12px",
                    maxWidth: "300px",
                    backgroundColor:
                      msg.sender === "me" ? "#d1e7ff" : "#ffffff",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {msg.type === "file" || msg.type==="image"? (
                    <Image
                      src={msg.media || msg.fileUrl || msg.image}
                      alt={msg.message || "Đã gửi ảnh"}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <span>{msg.message || msg.text}</span>
                  )}
                </div>

                <Dropdown
                  overlay={messageOptions(msg)}
                  trigger={["click"]}
                  placement={msg.sender === "me" ? "bottomRight" : "bottomLeft"}
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                  overlayStyle={{
                    width: "200px",
                    maxWidth: "300px",
                    wordWrap: "break-word",
                  }}
                >
                  <span
                    style={{
                      fontSize: "16px",
                      marginLeft: msg.sender === "me" ? "-15px" : "0",
                      right: msg.sender !== "me" && "-15px",
                      cursor: "pointer",
                      color: "#888",
                      position: "absolute",
                    }}
                  >
                    ⋮
                  </span>
                </Dropdown>
              </div>

              <span
                style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {isModalVisible && (
      <AddMember selectedChat={selectedChat} visible={isModalVisible} onClose={handleClose} />
     )}
     

      <div className="p-4 bg-white border-t">
        {previewImage && (
          <div className="mb-4">
            <img src={previewImage} alt="Preview" className="max-w-xs rounded-lg" />
          </div>
        )}
        <div className="flex items-center gap-4 mb-2 text-gray-600">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <PictureOutlined style={{ fontSize: "20px" }} />
          </label>
          <Dropdown
            overlay={emojiDropdown}
            trigger={["click"]}
            visible={isEmojiPickerVisible}
            onVisibleChange={(visible) => setIsEmojiPickerVisible(visible)}
          >
            <button className="hover:text-blue-500" title="Chọn Emoji">
              <SmileOutlined style={{ fontSize: "20px" }} />
            </button>
          </Dropdown>
          <button
            className="hover:text-blue-500"
            title="Gửi file"
            onClick={() => {
              const file = document.createElement("input");
              file.type = "file";
              file.onchange = (e) => sendFile(e.target.files[0]);
              file.click();
            }}
          >
            <PaperClipOutlined style={{ fontSize: "20px" }} />
          </button>
          <button className="hover:text-blue-500" title="Gửi tài liệu">
            <FileTextOutlined style={{ fontSize: "20px" }} />
          </button>
        </div>
        

        <div className="flex">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn"
            onPressEnter={sendMessage}
            className="rounded-full py-2 px-4 flex-1 mr-2"
          />
          <Button
            icon={<SendOutlined />}
            onClick={sendMessage}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-400"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
