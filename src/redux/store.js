import { configureStore } from "@reduxjs/toolkit";
import { orderSlice } from "./OrderSlice";
import { userSlice } from "./UserSlice";
import { userChatSlice } from "./UserChatSlice";
const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    order: orderSlice.reducer,
    chatUser: userChatSlice.reducer,
  },
});
export default store;
