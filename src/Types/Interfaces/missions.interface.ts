export interface MissionLocation {
  name: string;
  xCoordinate: number;
  yCoordinate: number;
  imageWidth: number;
  imageHeight: number;
  mapReference: {
    sys: { id: string };
  };
}

export interface Mission {
  sys: {
    id: string;
  };
  complete: boolean;
  missionName: string;
  location: string;
  setter: string;
  reward: string;
  description: string;
  missionLocation: undefined | MissionLocation;
}

export interface MissionPage {
  title: string;
  missionsCollection: {
    items: Mission[];
  };
}
