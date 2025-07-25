// GraphQL query builders for Contentful API
import { gql } from "graphql-request";
import { Campaigns } from "../../Pages/Sessions/Sessions";

const sessionsCampaign = {
  droskara: "2H9lfjk05Rh14SpuPZp2qb",
  noktblast: "56lSNM3OZNhIruz3THMzot",
  eldoria: "5MVZ8hTfPXGlrvpjruVmnW",
  tordenhelm: "6PM6Xg15tJKo5TYINpeS1g",
} as const;

export const buildSessionsQuery = (campaign: keyof typeof Campaigns) => gql`
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
`;

export const MISSIONS_PAGE_QUERY = gql`
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
`;

export const buildContentPageQuery = (id: string) => gql`
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
`;

export const buildListPageQuery = (id: string) => gql`
  {
    listPage(id: "${id}") {
      pageTitle
      linksCollection {
        items {
          ... on LorePage {
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
`;

export const buildMapPageQuery = (id: string) => gql`
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
`;

export const buildDocumentPageQuery = (id: string) => gql`
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
`;

export const FRONT_PAGE_QUERY = gql`
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
`;
