import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Mission } from "../../Types/Interfaces/missions.interface";

type ActiveMission = Pick<
  Mission,
  | "missionName"
  | "location"
  | "setter"
  | "reward"
  | "description"
  | "missionLocation"
>;

interface IActiveMissionState {
  mission: ActiveMission | null;
}

const initialState: IActiveMissionState = { mission: null };

export const activeMissionSlice = createSlice({
  name: "activeMission",
  initialState,
  reducers: {
    setActiveMission: (state, action: PayloadAction<ActiveMission>) => {
      state.mission = action.payload;
    },
  },
});

export const { setActiveMission } = activeMissionSlice.actions;

export default activeMissionSlice.reducer;
