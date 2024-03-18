import { SliceCaseReducers, createSlice } from "@reduxjs/toolkit";
import { Mission } from "Types/Interfaces/missions.interface";

interface IActiveMissionState {
  mission: Mission | null;
}

const initialState: IActiveMissionState = { mission: null };

export const activeMissionSlice = createSlice<
  IActiveMissionState,
  SliceCaseReducers<IActiveMissionState>
>({
  name: "activeMission",
  initialState,
  reducers: {
    setActiveMission: (state, action: { type: string; payload: Mission }) => {
      state.mission = action.payload;
    },
  },
});

export const { setActiveMission } = activeMissionSlice.actions;

export default activeMissionSlice.reducer;
