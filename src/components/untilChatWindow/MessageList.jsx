import React, { useEffect, useState } from "react";
import { Avatar, Image, Dropdown, Spin, Progress, Button } from "antd";
import { ArrowDownOutlined, PushpinFilled } from "@ant-design/icons";
import MessageOptions from "./MessageOptions";
import { PinnedListBlock } from "./ShareMessage";

const MessageList = ({
  messages,
  permission,
  handleCopyMessage,
  handleDeleteMessage,
  handleRevokeMessage,
  handleForwardMessage,
  handlePinMessage,
  handleUnPinMessage,
  messagesEndRef,
  onScroll,
  isLoading,
  hasMoreMessages,
  pinnedMessage, // <-- add this prop if you have it, or derive below
}) => {
  // Lấy tin nhắn ghim đầu tiên (nếu chưa truyền prop)
  let pinned;
  if (pinnedMessage === null) {
    pinned = messages.find((msg) => msg.pinned);
  } else {
    pinned = messages.find((msg) => msg.id === pinnedMessage.id);
  }

  useState(() => {
    if (pinnedMessage === null) {
      pinned = messages.find((msg) => msg.pinned);
    } else {
      pinned = messages.find((msg) => msg.id === pinnedMessage.id);
    }
  }, [pinnedMessage])

  const [isPinnedModal, setIsPinnedModal] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);

  const handleOpenPinnedModal = () => {
    setIsPinnedModal(true);
  };
  useEffect(() => {
    if (messages && messages.length > 0) {
      const filteredPinned = messages.filter((msg) => msg.pinned === true);
      setPinnedMessages(filteredPinned);
    } else {
      setPinnedMessages([]);
    }

  }, [messages]); // thay vì [pinned], dùng [messages] để luôn cập nhật khi có thay đổi
  console.log(messages);

  return (
    <div className="flex-1 overflow-y-auto py-2 px-4 space-y-4 message-list-container relative">
      {/* Pinned message block */}
      {pinned && isPinnedModal === false && pinnedMessages.length > 0 && (
        <div className="sticky top-0 z-20 flex justify-center mb-4">
          <div className="flex items-center justify-between bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg w-full max-w-[600px]">
            <div className="flex">
              <PushpinFilled className="text-orange-500 text-lg mr-2" />
              <div className="flex flex-col">
                <div className="font-medium text-gray-700 mr-2">Tin nhắn đã ghim</div>
                <div className="font-semibold text-gray-900 truncate max-w-[300px]">
                  {pinned.text}
                </div>
              </div>
            </div>

            <div>
              <Button onClick={handleOpenPinnedModal}>
                Tin ghim <ArrowDownOutlined />
              </Button>
              <a
                href={`#msg-${pinned.id}`}
                className="text-blue-500 font-medium ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(`msg-${pinned.id}`);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });

                    // Thêm lớp nền highlight
                    el.classList.add("text-red-600");

                    // Xóa highlight sau 2 giây (hoặc thời gian tùy chọn)
                    setTimeout(() => {
                      el.classList.remove("text-red-600");
                    }, 2000);
                  }
                }}
              >
                Xem
              </a>

            </div>
          </div>
        </div>
      )}

      {pinned && isPinnedModal === true && pinnedMessages.length > 0 && (
        <PinnedListBlock
          visible={isPinnedModal}
          onClose={() => setIsPinnedModal(false)}
          onUnpin={handleUnPinMessage}
          onViewAll={() => { }}
          onViewMessage={() => { }}
          pinnedMessages={pinnedMessages}
          permission={permission}
        />
      )}

      <div style={{ height: pinned && pinnedMessages.length > 0 ? 64 : 0 }} /> {/* Spacer for pinned block */}
      {/* {!hasMoreMessages && messages.length>10&&( 
        <div className="text-center text-gray-500 mb-4">
          Đã ở tin nhắn đầu tiên
        </div>
      )}
      {isLoading && ( 
        <div className="flex justify-center items-center mb-4">
          <Spin size="small" tip="Đang tải..." />
        </div>
      )} */}
      {messages
        .filter(
          (msg) =>
            msg.text === "Tin nhắn đã thu hồi" ||
            (msg.type === "text" && msg.text) ||
            msg.media ||
            msg.file_name ||
            msg.type === "notify"
        )
        .map((msg) => (
          <div
            key={msg.id}
            id={`msg-${msg.id}`}
            className={`flex ${msg.type === "notify"
              ? "justify-center" // Thông báo căn giữa
              : msg.sender === "me"
                ? "justify-end"
                : "items-start"
              } gap-2`}
          >
            {msg.type === "notify" ? (
              <div
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  textAlign: "center",
                  fontSize: "14px",
                  color: "#888",
                  maxWidth: "80%",
                  wordBreak: "break-word",
                }}
              >
                {msg.text}
              </div>
            ) : (
              <>
                {msg.sender !== "me" && (
                  <Avatar
                    src={msg.avatar || "/default-avatar.jpg"}
                    size="small"
                    className="self-end"
                  />
                )}
                <div
                  className={`flex flex-col items-${msg.sender === "me" ? "end" : "start"
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
                        padding:
                          msg.type === "text" ||
                            msg.type === "document" ||
                            msg.text === "Tin nhắn đã thu hồi"
                            ? "8px 12px"
                            : "0",
                        borderRadius: "12px",
                        maxWidth: "500px",
                        backgroundColor:
                          msg.sender === "me" ? "#d1e7ff" : "#ffffff",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        textAlign: "center",
                        wordBreak: "break-word",

                      }}
                    >
                      {msg.status === "pending" && msg.type != "text" ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            height: "100px",
                            width: "100px",
                            wordBreak: "break-word",
                          }}
                        >
                          <Progress
                            type="circle"
                            percent={msg.uploadProgress || 0} // Hiển thị phần trăm tải lên
                            width={50}
                            strokeColor="#007bff"
                          />
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#888",
                              marginTop: "8px",
                            }}
                          >
                            Đang tải...
                          </p>
                        </div>
                      ) : (
                        <>
                          <>
                            {/* Hiển thị nhiều ảnh nếu có (kiểu mới: type multiple_files và media là JSON) */}
                            {msg.type === "multiple_files" && msg.media && (() => {
                              let files = [];
                              try {
                                files = JSON.parse(msg.media);
                              } catch (e) {
                                files = [];
                              }
                              return (
                                <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 4, alignItems: "center", gap: 8, justifyContent: "center" }}>
                                  {files
                                    .filter(f => f.fileType === "image")
                                    .map((img, idx) => (
                                      <Image
                                        key={idx}
                                        src={img.fileUrl}
                                        alt={img.fileName || `image-${idx}`}
                                        style={{
                                          maxWidth: 246,
                                          maxHeight: 200,
                                          borderRadius: 8,
                                          objectFit: "cover",
                                        }}
                                      />
                                    ))}
                                </div>
                              );
                            })()}
                            {/* Hiển thị 1 ảnh cũ nếu có */}
                            {msg.type === "image" && msg.media && (() => {
                              try {
                                const files = JSON.parse(msg.media);
                                if (Array.isArray(files) && files.length === 1 && files[0].fileType === "image") {
                                  return (
                                    <Image
                                      src={files[0].fileUrl}
                                      alt={files[0].fileName || "image"}
                                      style={{
                                        maxWidth: 500,
                                        maxHeight: "auto",
                                        borderRadius: 8,
                                        objectFit: "cover",
                                      }}
                                    />
                                  );
                                }
                              } catch (e) { }
                              return null;
                            })()}
                          </>
                          {msg.media && (() => {
                            try {
                              const files = JSON.parse(msg.media);
                              if (Array.isArray(files) && files.length === 1) {
                                const file = files[0];
                                if (file.fileType === "video") {
                                  return (
                                    <video
                                      src={file.fileUrl}
                                      controls
                                      style={{
                                        maxWidth: "100%",
                                        borderRadius: "8px",
                                        background: "#000",
                                      }}
                                    />
                                  );
                                }
                                if (file.fileType === "document") {
                                  return (
                                    <a
                                      href={file.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        display: "block",
                                        color: "#007bff",
                                        textDecoration: "underline",
                                      }}
                                    >
                                      {file.fileName}
                                    </a>
                                  );
                                }
                              }
                            } catch (e) { }
                            // Nếu không phải JSON, fallback về kiểu cũ
                            if (msg.type === "video" && msg.media) {
                              return (
                                <video
                                  src={msg.media}
                                  controls
                                  style={{
                                    maxWidth: "100%",
                                    borderRadius: "8px",
                                    background: "#000",
                                  }}
                                />
                              );
                            }
                            if (msg.type === "document" && msg.file_name) {
                              return (
                                <a
                                  href={msg.media || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "block",
                                    color: "#007bff",
                                    textDecoration: "underline",
                                  }}
                                >
                                  {msg.file_name}
                                </a>
                              );
                            }
                            return null;
                          })()}
                          {msg?.text && (
                            <p
                              style={{
                                wordBreak: "break-word",
                                whiteSpace: "pre-line",
                                fontSize: 20,
                                lineHeight: "1.2"
                              }}
                            >
                              {msg.text}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <Dropdown
                      overlay={
                        <MessageOptions
                          msg={msg}
                          permission={permission}
                          onCopy={handleCopyMessage}
                          onDelete={handleDeleteMessage}
                          onRevoke={handleRevokeMessage}
                          onForward={() => handleForwardMessage(msg)}
                          onPinMessage={() => handlePinMessage(msg)}
                        />
                      }
                      trigger={["click"]}
                      placement={
                        msg.sender === "me" ? "bottomRight" : "bottomLeft"
                      }
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentNode
                      }
                      overlayStyle={{
                        width: "500px",
                        maxWidth: "500px",
                        wordWrap: "break-word",
                      }}
                    >
                      {msg.text !== "Tin nhắn đã thu hồi" && (
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
                      )}

                    </Dropdown>

                  </div>

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      marginTop: "4px",
                    }}
                  >
                    {msg.time}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
