import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  orders: [],
};
export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    doAddOrder: (state, action) => {
      const productIndex = state.orders.findIndex(
        (order) => order.id === action.payload.id
      );

      if (productIndex >= 0) {
        // If the product is already in the cart, update the quantity
        state.orders[productIndex].quantity = action.payload.quantity;
      } else {
        // If the product is not in the cart, add it
        state.orders.push(action.payload);
      }
    },
    doRemoveOrder: (state, action) => {
      state.orders = state.orders.filter(
        (order) => order.id !== action.payload.id
      );
    },
  },
});

export const { doAddOrder, doRemoveOrder } = orderSlice.actions;
