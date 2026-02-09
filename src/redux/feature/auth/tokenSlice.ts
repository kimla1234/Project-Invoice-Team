// src/redux/feature/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface AuthState {
  user: { id: number; email: string; username: string } | null;
  tokens: Tokens | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
};

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    setAuthState(state, action: PayloadAction<AuthState>) {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      console.log('sate',state.user);
      console.log('tokens',state.tokens);
    },
    
    logout(state) {
      state.user = null;
      state.tokens = null;
    },
  },
});

export const { setAuthState, logout } = tokenSlice.actions
export default tokenSlice.reducer
