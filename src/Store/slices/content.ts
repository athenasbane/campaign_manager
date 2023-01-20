import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createSlice } from "@reduxjs/toolkit";
import {
  alignmentContent,
  deadGodsContent,
  demons,
  pactMortalis,
  theImperium,
} from "Constants/content";
import { EContentType } from "Types/Enum/content.enum";
import { ITitle } from "Types/Interfaces";
import { TContent } from "Types/Types/content.type";

// Define a service using a base URL and expected endpoints
// export const pokemonApi = createApi({
//   reducerPath: 'pokemonApi',
//   baseQuery: fetchBaseQuery({ baseUrl: 'https://pokeapi.co/api/v2/' }),
//   endpoints: (builder) => ({
//     getPokemonByName: builder.query<Pokemon, string>({
//       query: (name) => `pokemon/${name}`,
//     }),
//   }),
// })

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
// export const { useGetPokemonByNameQuery } = pokemonApi

export const contentApi = createApi({
  reducerPath: "contentApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_BACKEND_URL }),
  endpoints: (builder) => ({
    getContentBySlug: builder.query<TContent[], string>({
      query: (slug) => `content/${slug}`,
    }),
  }),
});

export const contentSlice = createSlice({
  name: "content",
  initialState: {
    alignment: alignmentContent,
    dead_gods: deadGodsContent,
    pact_mortalis: pactMortalis,
    the_imperium: theImperium,
    demons,
  },
  reducers: {},
});

// export const selectSessions = (state: TSession[]) => state;
export const selectContent = (
  state: Record<string, TContent[]>,
  page: string
) => {
  if (!Object.keys(state).includes(page)) {
    return [
      {
        contentType: EContentType.Title,
        displayText: "404",
        variant: "h2",
      },
      {
        contentType: EContentType.Title,
        displayText: "Page Not Found",
      },
    ] satisfies ITitle[];
  }

  return state[page];
};

export const { useGetContentBySlugQuery } = contentApi;
export default contentSlice.reducer;
