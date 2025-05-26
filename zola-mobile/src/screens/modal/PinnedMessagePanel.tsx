import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const PinnedMessagePanel = ({
  pinnedMessages,
  onSelectMessage,
  onUnpinMessage,
}) => {
  const [showAll, setShowAll] = useState(false);

  if (!pinnedMessages || pinnedMessages.length === 0) return null;

  const visibleMessages = showAll ? pinnedMessages : [pinnedMessages[0]];

  const renderItem = ({ item }) => {
    let content = item.text;
    let imageUri = null;
    let fileName = "";
    let multiImageUris = [];

    if (item.type === "image" && item.files && item.files.length > 0) {
      imageUri = item.files[0].uri;
      content = "Ảnh:";
    } else if (
      item.type === "media" &&
      item.files &&
      item.files.length > 0 &&
      item.files[0].type?.startsWith("image")
    ) {
      imageUri = item.files[0].uri;
      content = "Ảnh:";
    } else if (item.type === "video" && item.files && item.files.length > 0) {
      content = "Video";
      fileName = item.files[0].name || "";
    } else if (
      item.type === "document" &&
      item.files &&
      item.files.length > 0
    ) {
      content = "Tài liệu";
      fileName = item.files[0].name || "";
    } else if (
      item.type === "multiple_files" ||
      (item.type === "media" && item.files?.length > 1)
    ) {
      content = "Ảnh:";
      // Lấy tối đa 3 ảnh
      multiImageUris = item.files
        .filter((f) => f.type?.startsWith("image"))
        .slice(0, 3)
        .map((f) => f.uri);
    } else if (item.type === "notify") {
      content = item.text;
    }

    return (
      <TouchableOpacity
        onPress={() => onSelectMessage(item.id)}
        style={{
          backgroundColor: "#fff",
          padding: 10,
          borderRadius: 8,
          marginBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontWeight: "500", color: "#333" }}>
              {item.senderName}
            </Text>
            <Text style={{ color: "#666", marginTop: 2 }}>
              {content}
              {(item.type === "video" || item.type === "document") &&
              fileName ? (
                <Text style={{ color: "#007bff" }}>{`: ${fileName}`}</Text>
              ) : (
                ""
              )}
            </Text>
          </View>
          {/* Hiển thị 1 ảnh nếu là ảnh đơn, hoặc tối đa 3 ảnh nếu là nhiều ảnh */}
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 40, height: 40, borderRadius: 6, marginLeft: 10 }}
            />
          )}
          {multiImageUris.length > 0 && (
            <View style={{ flexDirection: "row", marginLeft: 10 }}>
              {multiImageUris.map((uri, idx) => (
                <Image
                  key={idx}
                  source={{ uri }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    marginLeft: idx === 0 ? 0 : 4,
                  }}
                />
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onUnpinMessage(item.id);
          }}
          style={{ padding: 5, marginLeft: 8 }}
        >
          <MaterialIcons name="push-pin" size={20} color="#007bff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  return (
    <View
      style={{
        padding: 12,
        backgroundColor: "#f0f4f8",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#dcdcdc",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontWeight: "600",
            fontSize: 12,
            color: "#333",
          }}
        >
          📌 Tin nhắn đã ghim:
        </Text>

        {pinnedMessages.length > 1 && (
          <TouchableOpacity onPress={() => setShowAll(!showAll)}>
            <Text style={{ color: "#007bff", fontWeight: "500" }}>
              {showAll ? "Thu gọn" : "Xem thêm"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={visibleMessages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default PinnedMessagePanel;
