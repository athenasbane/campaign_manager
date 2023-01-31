import { IListType } from "Constants/lists";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const listApi = createApi({
  reducerPath: "listApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_BACKEND_URL }),
  endpoints: (builder) => ({
    getListBySlug: builder.query<IListType, string>({
      query: (slug) => `list/${slug}`,
    }),
  }),
});

export const { useGetListBySlugQuery } = listApi;
