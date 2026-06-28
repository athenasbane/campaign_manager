import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { PlayerProfile } from "../../Types/Interfaces/player.interface";

export const playerApi = createApi({
  reducerPath: "playerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_PLAYER_API_URL || "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getPlayerProfile: builder.query<PlayerProfile, void>({
      query: () => "/player/me",
    }),
  }),
});

export const { useGetPlayerProfileQuery } = playerApi;
