import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IListType } from "Types/Interfaces/list.interface";
import { IMap } from "Types/Interfaces";
import { TContent } from "Types/Types/content.type";
import { TSession } from "Types/Types/session.type";
import { request, gql, ClientError } from "graphql-request";

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
    getNextSession: builder.query<{ date: string } | null, undefined>({
      query: () => "nextsession",
    }),
  }),
});

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
      query: () => ({
        body: gql`
          query {
            sessionsPage(id: "6PM6Xg15tJKo5TYINpeS1g") {
              dataCollection {
                items {
                  ... on Session {
                    __typename
                    sessionNumber
                    shortDescription
                    longDescription {
                      json
                    }
                  }
                  ... on SessionLocation {
                    __typename
                    displayText
                  }
                  ... on SessionStoryIncrement {
                    __typename
                    displayText
                    increment
                  }
                }
              }
            }
          }
        `,
      }),
      transformResponse: (response: any) =>
        response.sessionsPage.dataCollection.items.reverse(),
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

export const { useGetSessionsDataQuery } = contentfulApi;
