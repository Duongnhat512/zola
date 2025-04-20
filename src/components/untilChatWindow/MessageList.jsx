import React from "react";
import { Avatar, Image, Dropdown, Spin } from "antd";
import MessageOptions from "./MessageOptions";

const MessageList = ({
  messages,
  handleCopyMessage,
  handleDeleteMessage,
  handleRevokeMessage,
  messagesEndRef,
  onScroll,
  isLoading,
  hasMoreMessages,
}) => {
  console.log("messages", messages);

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-4 message-list-container"
      // onScroll={onScroll}
    >
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
            msg.file_name
        )
        .map((msg) => (
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
                    padding: msg.type === "text" || msg.text==="Tin nhắn đã thu hồi" ? "8px 12px" : "0",
                    borderRadius: "12px",
                    maxWidth: "300px",
                    backgroundColor:
                      msg.sender === "me" ? "#d1e7ff" : "#ffffff",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {msg.status === "pending" ? (
                    <Spin
                      size="large"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "50px",
                        width: "50px",
                      }}
                    />
                  ) : (
                    <>
                      {msg.type === "image" && msg.media && (
                        <Image
                          src={msg.media}
                          alt="Đã gửi ảnh"
                          style={{
                            maxWidth: "100%",
                            height: "auto",
                            borderRadius: "8px",
                            marginTop: msg.text ? "8px" : "0",
                          }}
                        />
                      )}
                      {msg.type === "video" && msg.media && (
                        <video
                          src={msg.media}
                          controls
                          style={{
                            maxWidth: "100%",
                            borderRadius: "8px",
                          }}
                        />
                      )}
                      {msg.type === "document" && msg.file_name && (
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
                      )}
                      {msg?.text && <p>{msg.text}</p>}
                    </>
                  )}
                </div>

                <Dropdown
                  overlay={
                    <MessageOptions
                      msg={msg}
                      onCopy={handleCopyMessage}
                      onDelete={handleDeleteMessage}
                      onRevoke={handleRevokeMessage}
                    />
                  }
                  trigger={["click"]}
                  placement={msg.sender === "me" ? "bottomRight" : "bottomLeft"}
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                  overlayStyle={{
                    width: "200px",
                    maxWidth: "300px",
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
          </div>
        ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
