import { createSlice } from "@reduxjs/toolkit";
import { IListType, list } from "../../Constants/lists";

export const listSlice = createSlice({
  name: "lists",
  initialState: [...list],
  reducers: {},
});

export const selectFilteredList = (
  state: IListType[],
  queryType?: string,
  queryLinks?: string
) => {
  let filteredTypes = state;
  if (queryType) {
    filteredTypes = state.filter((el) => {
      return el.param === queryType;
    });
  }

  if (queryLinks) {
    const [type] = filteredTypes;
    type.links = type.links.filter((el) => el.displayLabel !== queryLinks);
  }

  return filteredTypes;
};

export default listSlice.reducer;
