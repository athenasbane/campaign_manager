import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IListType } from "Types/Interfaces/list.interface";
import { IMap } from "Types/Interfaces";
import { TContent } from "Types/Types/content.type";
import { TSession } from "Types/Types/session.type";

export const backendApi = createApi({
  reducerPath: "backendApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_BACKEND_URL }),
  endpoints: (builder) => ({
    getContentBySlug: builder.query<TContent[], string>({
      query: (slug) => `content/${slug}`,
    }),
    getListBySlug: builder.query<IListType, string>({
      query: (slug) => `list/${slug}`,
    }),
    getMapBySlug: builder.query<IMap, string>({
      query: (slug) => `map/${slug}`,
    }),
    getSession: builder.query<TSession[], undefined>({
      query: () => `sessions`,
    }),
    getNextSession: builder.query<string | null, undefined>({
      query: () => "nextsession",
    }),
  }),
});

export const {
  useGetContentBySlugQuery,
  useGetListBySlugQuery,
  useGetMapBySlugQuery,
  useGetSessionQuery,
  useGetNextSessionQuery,
} = backendApi;
