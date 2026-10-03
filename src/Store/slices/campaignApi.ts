import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import type {
  CampaignArticle,
  CampaignOverview,
  CampaignSearch,
} from "../../Types/Interfaces/campaign.interface";
import { logout } from "./auth";
import type { InteractiveMapData } from "../../Types/Interfaces/interactiveMap.interface";

const query = fetchBaseQuery({
  baseUrl: `${(process.env.REACT_APP_CAMPAIGN_API_URL || "").replace(/\/$/, "")}/api/campaigns/luxtria`,
  cache: "no-store",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});
export const campaignApi = createApi({
  reducerPath: "campaignApi",
  refetchOnMountOrArgChange: true,
  baseQuery: async (args, api, options) => {
    const result = await query(args, api, options);
    if (result.error?.status === 401) api.dispatch(logout());
    return result;
  },
  tagTypes: ["Campaign", "Entries"],
  endpoints: (builder) => ({
    getCampaignMap: builder.query<InteractiveMapData, void>({
      query: () => "/maps/luxtria",
      providesTags: ["Campaign", "Entries"],
    }),
    getCampaignOverview: builder.query<CampaignOverview, void>({
      query: () => "",
      providesTags: ["Campaign"],
    }),
    searchCampaign: builder.query<
      CampaignSearch,
      Record<string, string | number>
    >({
      query: (params) => ({ url: "/entries", params }),
      providesTags: ["Entries"],
    }),
    getCampaignEntry: builder.query<CampaignArticle, string>({
      query: (id) => `/entries/${encodeURIComponent(id)}`,
      providesTags: ["Entries"],
    }),
    saveReaderState: builder.mutation<
      { saved: boolean },
      {
        id: string;
        read?: boolean;
        bookmarked?: boolean;
        personalNotes?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/entries/${encodeURIComponent(id)}/state`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Campaign", "Entries"],
    }),
  }),
});
export const {
  useGetCampaignMapQuery,
  useGetCampaignOverviewQuery,
  useSearchCampaignQuery,
  useGetCampaignEntryQuery,
  useSaveReaderStateMutation,
} = campaignApi;
