import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  role: null,
  authenticated: false,
  token: null,
  user: null
};

export const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.authenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.authenticated = false;
      state.user = null;
    },
  },
});

export const { login, logout } = userSlice.actions;