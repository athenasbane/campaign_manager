import { createApi } from "@reduxjs/toolkit/query/react";

import { request, ClientError } from "graphql-request";
import { Campaigns } from "../../Pages/Sessions/Sessions";
import {
  IDocumentPageFields,
  IMapPageFields,
} from "../../Types/contentful-code-gen";
import { MissionPage } from "../../Types/Interfaces/missions.interface";
import {
  buildSessionsQuery,
  MISSIONS_PAGE_QUERY,
  buildContentPageQuery,
  buildListPageQuery,
  buildMapPageQuery,
  buildDocumentPageQuery,
  FRONT_PAGE_QUERY,
  GET_EXCHANGE_RATE_PAGE,
} from "./backendQueries";

import { ExchangeRateResponse } from "../../Types/Interfaces/exchangeRateResponse.interface";

const graphqlBaseQuery =
  ({
    baseUrl,
    headers,
  }: {
    baseUrl: string;
    headers: { "Content-Type": string; Authorization: string };
  }) =>
  async ({ body }: { body: string }) => {
    try {
      const result = await request(baseUrl, body, undefined, headers);
      return { data: result };
    } catch (error) {
      if (error instanceof ClientError) {
        return { error: { status: error.response.status, data: error } };
      }
      return { error: { status: 500, data: error } };
    }
  };

export const contentfulApi = createApi({
  reducerPath: "contentfulApi",
  baseQuery: graphqlBaseQuery({
    baseUrl: `https://graphql.contentful.com/content/v1/spaces/${process.env.REACT_APP_CONTENTFUL_SPACE_ID}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN}`,
    },
  }),
  endpoints: (builder) => ({
    getSessionsData: builder.query({
      query: (campaign: keyof typeof Campaigns) => ({
        body: buildSessionsQuery(campaign),
      }),
      transformResponse: (response: any) =>
        response.sessionsPage.dataCollection.items.reverse(),
    }),
    getMissionsPage: builder.query({
      query: () => ({
        body: MISSIONS_PAGE_QUERY,
      }),
      transformResponse: (response: any) =>
        response.missionsPage as MissionPage,
    }),
    getContentPage: builder.query({
      query: (id) => ({
        body: buildContentPageQuery(id),
      }),
      transformResponse: (response: any) => response.lorePage,
    }),
    getListPage: builder.query({
      query: (id) => ({
        body: buildListPageQuery(id),
      }),
      transformResponse: (response: any) => response?.listPage,
    }),
    getMapPage: builder.query({
      query: (id) => ({
        body: buildMapPageQuery(id),
      }),
      transformResponse: (response: { mapPage: IMapPageFields }) =>
        response?.mapPage,
    }),
    getDocumentPage: builder.query({
      query: (id) => ({
        body: buildDocumentPageQuery(id),
      }),
      transformResponse: (response: { documentPage: IDocumentPageFields }) =>
        response?.documentPage,
    }),
    getFrontPage: builder.query({
      query: () => ({
        body: FRONT_PAGE_QUERY,
      }),
      transformResponse: (response: { frontPage: any }) => {
        return response?.frontPage;
      },
    }),
    getExhangeRatesPage: builder.query({
      query: () => ({
        body: GET_EXCHANGE_RATE_PAGE,
      }),
      transformResponse: (response: {
        exchangeRatePage: ExchangeRateResponse;
      }) => {
        return response?.exchangeRatePage;
      },
    }),
  }),
});

export const {
  useGetSessionsDataQuery,
  useGetContentPageQuery,
  useGetListPageQuery,
  useGetMapPageQuery,
  useGetDocumentPageQuery,
  useGetFrontPageQuery,
  useGetMissionsPageQuery,
  useGetExhangeRatesPageQuery,
} = contentfulApi;
