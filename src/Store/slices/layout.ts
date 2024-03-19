import { createSlice } from "@reduxjs/toolkit";

export interface ILayoutDetails {
  height: number;
  width: number;
}

export enum EnumLayout {
  NavBar = "navbar",
}

export type ILayoutSliceState = Record<EnumLayout, ILayoutDetails>;

const initialState: ILayoutSliceState = {
  [EnumLayout.NavBar]: {
    height: 50,
    width: 500,
  },
};

export const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    setLayoutValue: (
      state: ILayoutSliceState,
      action: {
        type: string;
        payload: { component: EnumLayout; details: ILayoutDetails };
      }
    ) => {
      state[action.payload.component] = action.payload.details;
    },
  },
});

export const { setLayoutValue } = layoutSlice.actions;

export const selectLayoutDetails = (
  state: ILayoutSliceState,
  component: EnumLayout
) => state[component];

export default layoutSlice.reducer;
