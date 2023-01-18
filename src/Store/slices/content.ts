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

export default contentSlice.reducer;
