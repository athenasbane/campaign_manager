import { createSlice } from "@reduxjs/toolkit";

export enum EnumModalSlice {
  Menu = "menu",
}

interface IModalSliceInitialState {
  [EnumModalSlice.Menu]: boolean;
}

const initialState: IModalSliceInitialState = {
  menu: false,
};

export const modalSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    closeAll: (state) => {
      const keys = Object.keys(state);
      keys.forEach((key) => (state[key as EnumModalSlice] = false));
    },
    openSingleModal: (
      state: IModalSliceInitialState,
      action: { type: string; payload: EnumModalSlice }
    ) => {
      state[action.payload] = true;
    },
  },
});

// Action creators are generated for each case reducer function
export const { closeAll, openSingleModal } = modalSlice.actions;

export const selectModalStatus = (
  state: IModalSliceInitialState,
  modal: EnumModalSlice
) => state[modal];

export default modalSlice.reducer;
