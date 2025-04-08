import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  authenticated: false,
  user: {
    id: "",
    email: "",
    fullName: "",
    dob: "",
    phoneNumber: "",
  },
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action) {
      state.authenticated = true;
      state.user = action.payload;
    },
    logout(state) {
      state.authenticated = false;
      state.user = initialState.user;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
  },
});

export const { login, logout,setLoading } = userSlice.actions;
