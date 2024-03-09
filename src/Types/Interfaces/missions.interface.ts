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
}

export interface MissionPage {
  title: string;
  missionsCollection: {
    items: Mission[];
  };
}
