import { TSession } from "../../Types/Types/session.type";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const sessionsApi = createApi({
  reducerPath: "sessionApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_BACKEND_URL }),
  endpoints: (builder) => ({
    getSession: builder.query<TSession[], undefined>({
      query: () => `sessions`,
    }),
  }),
});

export const { useGetSessionQuery } = sessionsApi;
