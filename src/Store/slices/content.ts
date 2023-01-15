import { createSlice } from "@reduxjs/toolkit";
import { alignmentContent, deadGodsContent } from "Constants/content";
import { EContentType } from "Types/Enum/content.enum";
import { ITitle } from "Types/Interfaces";
import { TContent } from "Types/Types/content.type";

export const contentSlice = createSlice({
  name: "content",
  initialState: { alignment: alignmentContent, dead_gods: deadGodsContent },
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
        displayLabel: "404",
        variant: "h2",
      },
      {
        contentType: EContentType.Title,
        displayLabel: "Page Not Found",
      },
    ] satisfies ITitle[];
  }

  return state[page];
};

export default contentSlice.reducer;
