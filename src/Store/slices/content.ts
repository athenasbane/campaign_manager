import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TContent } from "Types/Types/content.type";

export const contentApi = createApi({
  reducerPath: "contentApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_BACKEND_URL }),
  endpoints: (builder) => ({
    getContentBySlug: builder.query<TContent[], string>({
      query: (slug) => `content/${slug}`,
    }),
  }),
});

export const { useGetContentBySlugQuery } = contentApi;
