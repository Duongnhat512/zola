import React, { useEffect, useState } from "react";
import { Avatar, Image, Dropdown, Spin, Progress, Button } from "antd";
import { ArrowDownOutlined, PushpinFilled, LinkOutlined, PlayCircleOutlined, GlobalOutlined, YoutubeOutlined, TwitterOutlined, FacebookOutlined, InstagramOutlined } from "@ant-design/icons";
import MessageOptions from "./MessageOptions";
import { PinnedListBlock } from "./ShareMessage";
import LinkPreview from "./LinkPreview";
import { processMessageLinks, detectUrls } from "../../utils/linkPreview";

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
  pinnedMessage,
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

  const [linkPreviews, setLinkPreviews] = useState({});
  const [loadingPreviews, setLoadingPreviews] = useState(new Set());

  // Hàm để ẩn URLs khỏi text message khi có preview
  const getDisplayText = (text, messageId) => {
    if (!text) return text;
    
    // Nếu có link preview cho message này, loại bỏ URLs khỏi text
    if (linkPreviews[messageId] && linkPreviews[messageId].length > 0) {
      const urls = detectUrls(text);
      let displayText = text;
      
      // Loại bỏ tất cả URLs khỏi text
      urls.forEach(url => {
        displayText = displayText.replace(url, '').trim();
      });
      
      // Nếu sau khi loại bỏ URL, text rỗng thì không hiển thị text
      return displayText.trim() || null;
    }
    
    return text;
  };

  // Xử lý link preview cho tin nhắn
  useEffect(() => {
    const processLinks = async () => {
      const newPreviews = { ...linkPreviews };
      const newLoading = new Set();
      
      for (const msg of messages) {
        if (msg.type === 'text' && 
            msg.text && 
            detectUrls(msg.text).length > 0 && 
            !linkPreviews[msg.id] && 
            !loadingPreviews.has(msg.id)) {
          
          newLoading.add(msg.id);
          setLoadingPreviews(new Set(newLoading));
          
          try {
            const previews = await processMessageLinks(msg.text);
            if (previews.length > 0) {
              newPreviews[msg.id] = previews;
            }
          } catch (error) {
            console.error('Error processing links for message:', msg.id, error);
          } finally {
            newLoading.delete(msg.id);
            setLoadingPreviews(new Set(newLoading));
          }
        }
      }
      
      setLinkPreviews(newPreviews);
    };

    if (messages.length > 0) {
      processLinks();
    }
  }, [messages]);

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
        .map((msg) => {
          const displayText = getDisplayText(msg.text, msg.id);
          
          return (
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
                    className={`flex flex-col items-${msg.sender === "me" ? "end" : "start"}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        position: "relative",
                        flexDirection: "column",
                      }}
                    >
                      {/* Chỉ hiển thị text bubble nếu có text sau khi loại bỏ URL */}
                      {displayText && (
                        <div
                          style={{
                            padding: "8px 12px",
                            borderRadius: "12px",
                            maxWidth: "500px",
                            backgroundColor:
                              msg.sender === "me" ? "#d1e7ff" : "#ffffff",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            wordBreak: "break-word",
                            marginBottom: "4px",
                          }}
                        >
                          <p
                            style={{
                              wordBreak: "break-word",
                              whiteSpace: "pre-line",
                              fontSize: 16,
                              lineHeight: "1.4",
                              margin: 0,
                            }}
                          >
                            {displayText}
                          </p>
                        </div>
                      )}

                      {/* Loading state cho link preview */}
                      {loadingPreviews.has(msg.id) && (
                        <div style={{ 
                          marginTop: '4px',
                          padding: '16px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          <Spin size="small" />
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            Đang tải link preview...
                          </span>
                        </div>
                      )}
                      
                      {/* Link Preview */}
                      {linkPreviews[msg.id] && linkPreviews[msg.id].map((preview, index) => (
                        <LinkPreview
                          key={index}
                          preview={preview}
                          sender={msg.sender}
                        />
                      ))}

                      {/* Message options dropdown */}
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
                              top: "8px",
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
          );
        })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
