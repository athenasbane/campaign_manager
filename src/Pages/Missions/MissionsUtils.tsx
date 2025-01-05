import { TreeItem } from "@mui/lab";
import { Mission } from "../../Types/Interfaces/missions.interface";

export const buildSelection = (missions: Mission[]) => {
  const active = missions.filter((item: any) => !item.complete);

  const complete = missions.filter((item: any) => item.complete);

  const activeNode = active.map((mission) => (
    <TreeItem
      key={mission.sys.id}
      nodeId={mission.sys.id}
      label={mission.missionName}
    />
  ));

  const completedNode = complete.map((mission) => (
    <TreeItem
      key={mission.sys.id}
      nodeId={mission.sys.id}
      label={mission.missionName}
    />
  ));

  return (
    <>
      <TreeItem nodeId="active" label="Active">
        {activeNode}
      </TreeItem>
      <TreeItem sx={{ color: "grey" }} nodeId="complete" label="Complete">
        {completedNode}
      </TreeItem>
    </>
  );
};
