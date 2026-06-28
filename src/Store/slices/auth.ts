import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const AUTH_STORAGE_KEY = "campaign_manager_auth";

export interface AuthState {
  token: string | null;
  playerName: string | null;
}

const loadInitialState = (): AuthState => {
  if (typeof window === "undefined") {
    return { token: null, playerName: null };
  }

  const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedAuth) {
    return { token: null, playerName: null };
  }

  try {
    return JSON.parse(storedAuth) as AuthState;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return { token: null, playerName: null };
  }
};

const persistAuth = (state: AuthState) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!state.token) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadInitialState(),
  reducers: {
    login: (
      state,
      action: PayloadAction<{ token: string; playerName: string }>
    ) => {
      state.token = action.payload.token;
      state.playerName = action.payload.playerName;
      persistAuth(state);
    },
    logout: (state) => {
      state.token = null;
      state.playerName = null;
      persistAuth(state);
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
