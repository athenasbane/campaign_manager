import { ESessionType } from "../../Types/Enum/sessions.enum";

export interface ISession {
  __typename: ESessionType.Session;
  sessionNumber: number;
  location: string;
  shortDescription: string;
  longDescription: {
    json: string;
  };
}

export interface ISessionLocation {
  __typename: ESessionType.Location;
  displayText: string;
}

export interface ISessionStoryIncrement {
  __typename: ESessionType.StoryIncrement;
  increment: "chapter" | "act";
  displayText: string;
}
