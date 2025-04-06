import { configureStore } from '@reduxjs/toolkit';
import { orderSlice } from './OrderSlice';
import { userSlice } from './UserSlice';
const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    order: orderSlice.reducer,
  },
});
export default store;