import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IMap } from "Types/Interfaces";

export const mapApi = createApi({
  reducerPath: "mapApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_BACKEND_URL }),
  endpoints: (builder) => ({
    getMapBySlug: builder.query<IMap, string>({
      query: (slug) => `map/${slug}`,
    }),
  }),
});

export const { useGetMapBySlugQuery } = mapApi;
