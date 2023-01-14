import { createSlice } from "@reduxjs/toolkit";
import { maps } from "Constants/map";
import { IMap } from "Types/Interfaces";

export const mapsSlice = createSlice({
  name: "maps",
  initialState: [...maps],
  reducers: {},
});

export const selectMap = (state: IMap[], route?: string) => {
  if (route) {
    return state.filter((map) => map.imageRoute === route)[0];
  }
  return state[0];
};

export default mapsSlice.reducer;
