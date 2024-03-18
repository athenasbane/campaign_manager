import { createApi } from "@reduxjs/toolkit/query/react";

import { request, gql, ClientError } from "graphql-request";
import { Campaigns } from "Pages/Sessions/Sessions";
import { IDocumentPageFields, IMapPageFields } from "Types/contentful-code-gen";
import { MissionPage } from "Types/Interfaces/missions.interface";

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

const sessionsCampaign = {
  noktblast: "56lSNM3OZNhIruz3THMzot",
  eldoria: "5MVZ8hTfPXGlrvpjruVmnW",
  tordenhelm: "6PM6Xg15tJKo5TYINpeS1g",
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
        body: gql`
          query {
            sessionsPage(id: "${sessionsCampaign[campaign]}") {
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
    getMissionsPage: builder.query({
      query: () => ({
        body: gql`
          {
            missionsPage(id: "35OsBQH599pWE86UcKVHJI") {
              title
              missionsCollection {
                items {
                  sys {
                    id
                  }
                  complete
                  missionName
                  location
                  setter
                  reward
                  description
                  missionLocation {
                    name
                    xCoordinate
                    yCoordinate
                    imageWidth
                    imageHeight
                    mapReference {
                      sys {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        `,
      }),
      transformResponse: (response: any) =>
        response.missionsPage as MissionPage,
    }),
    getContentPage: builder.query({
      query: (id) => ({
        body: gql`
          {
            lorePage(id: "${id}") {
              pageTitle
              pageContentCollection(limit: 1) {
                ... on LorePagePageContentCollection {
                  items {
                ... on Content {
                  sys {
                    id
                  }
                  content {
                    json
                    links {
                      entries {
                        block {
                          sys {
                        id
                      }
                        }
                        inline {
                          sys {
                            id
                          }
                        }
                      }
                      assets {
                        block {
                          sys {
                            id
                          }
                          url
                          title
                          width
                          height
                          description
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      `,
      }),
      transformResponse: (response: any) => response.lorePage,
    }),
    getListPage: builder.query({
      query: (id) => ({
        body: gql`
        {
  listPage(id: "${id}") {
    pageTitle
    linksCollection {
      items {
        ... on LorePage{
         __typename
          pageTitle
        sys {
          id
        }
        }
        ... on ListPage {
            __typename
          pageTitle
          sys {
            id
          }
          
        }
        ... on MapPage {
          __typename
          pageTitle
          sys {
            id
          }
        }
      }
    }
  }
}
        `,
      }),
      transformResponse: (response: any) => response?.listPage,
    }),
    getMapPage: builder.query({
      query: (id) => ({
        body: gql`
         {
          mapPage(id: "${id}") {
            pageTitle
            unitOfDistance
            levelOfDetail
            map {
              title
              url
            }
          }
         }
        `,
      }),
      transformResponse: (response: { mapPage: IMapPageFields }) =>
        response?.mapPage,
    }),
    getDocumentPage: builder.query({
      query: (id) => ({
        body: gql`
         {
          documentPage(id: "${id}") {
    pageTitle
    documentsCollection {
      items {
        ... on Document {
          title
          document {
            url
          }
        }
      }
    }
  }
         }
        `,
      }),
      transformResponse: (response: { documentPage: IDocumentPageFields }) =>
        response?.documentPage,
    }),
    getFrontPage: builder.query({
      query: () => ({
        body: gql`
          {
            frontPage(id: "Au0GrSfWTpKE23kMWkYsf") {
              nextSession
              pageTitle
              introduction {
                json
                links {
                  entries {
                    block {
                      sys {
                        id
                      }
                    }
                    inline {
                      sys {
                        id
                      }
                    }
                  }
                  assets {
                    block {
                      sys {
                        id
                      }
                      url
                      title
                      width
                      height
                      description
                    }
                  }
                }
              }
            }
          }
        `,
      }),
      transformResponse: (response: { frontPage: any }) => response?.frontPage,
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
} = contentfulApi;
