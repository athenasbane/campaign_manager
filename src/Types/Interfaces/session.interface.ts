import { ESessionType } from "Types/Enum/sessions.enum";

export interface ISession {
  type: ESessionType.Session;
  sessionNo: number;
  location: string;
  inGameEndTime: string;
  shortDescription: string;
  longDescription: string;
}

export interface ISessionLocation {
  type: ESessionType.Location;
  displayText: string;
}

export interface ISessionStoryIncrement {
  type: ESessionType.StoryIncrement;
  increment: "chapter" | "act";
  displayText: string;
}
