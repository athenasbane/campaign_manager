import { createSlice } from "@reduxjs/toolkit";
import { sessions } from "../../Constants/sessions";
import { TSession } from "../../Types/Types/session.type";

export const sessionsSlice = createSlice({
  name: "sessions",
  initialState: [...sessions],
  reducers: {},
});

export const selectSessions = (state: TSession[]) => state;

export default sessionsSlice.reducer;
