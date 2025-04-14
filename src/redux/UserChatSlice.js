import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  selectedChat: null,
  isFromAddFriendModal: false, // Trạng thái xác định nguồn gốc
};

export const userChatSlice = createSlice({
  name: "userChat",
  initialState,
  reducers: {
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload.chat;
      state.isFromAddFriendModal = action.payload.isFromAddFriendModal || false;
    },
    clearSelectedChat: (state) => {
      state.selectedChat = null;
      state.isFromAddFriendModal = false;
    },
  },
});

export const { setSelectedChat, clearSelectedChat } = userChatSlice.actions;
