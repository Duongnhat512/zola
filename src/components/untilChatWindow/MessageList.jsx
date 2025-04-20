import React from "react";
import { Avatar, Image, Dropdown } from "antd";
import MessageOptions from "./MessageOptions";

const MessageList = ({
  messages,
  handleCopyMessage,
  handleDeleteMessage,
  handleRevokeMessage,
  messagesEndRef,
}) => {
  return (
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
              src={msg.avatar || "https://via.placeholder.com/150"}
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
                {msg?.text && <p>{msg.text}</p>}

                {msg.type === "document" && msg.file_name && (
                  <a
                    href={msg.media || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      marginTop: msg.text || msg.image ? "8px" : "0",
                      color: "#007bff",
                      textDecoration: "underline",
                    }}
                  >
                    {msg.file_name}
                  </a>
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