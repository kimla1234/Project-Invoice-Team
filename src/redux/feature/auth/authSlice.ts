import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";

type initialStateType = {
  token: string | null; // assuming token is string for simplicity
  isAuthenticated: boolean;
};
const initialState: initialStateType = {
  token: null,

  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken(state, action: PayloadAction<string>) {
      console.log("AuthSlice Access Token Set in Redux:", action.payload); // Log token
      state.token = action.payload;

    },
    clearToken: (state) => {
      state.token = null;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },

  // reducers: {
  //     setAccessToken(state, action: PayloadAction<string> ) {
  //         console.log("Access Token Set in Redux:", action.payload);
  //         state.token = action.payload;
  //     },
  // },
});

export const { setAccessToken, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;

// customize selector for easy component access
export const selectToken = (state: RootState) => state.auth.token;
export const selectAuthentication = (state: RootState) =>
  state.auth.isAuthenticated;
