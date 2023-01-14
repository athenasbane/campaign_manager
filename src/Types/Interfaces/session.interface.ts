import { SessionType } from "../Enum/sessions.enum";

export interface ISession {
  type: SessionType.Session;
  sessionNo: number;
  location: string;
  inGameEndTime: string;
  shortDescription: string;
  longDescription: string;
}

export interface ISessionLocation {
  type: SessionType.Location;
  displayLabel: string;
}

export interface ISessionStoryIncrement {
  type: SessionType.StoryIncrement;
  increment: "chapter" | "act";
  displayLabel: string;
}
