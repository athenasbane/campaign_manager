import TreeView from "@mui/lab/TreeView";
import { Stack, Box, Skeleton, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useGetMissionsPageQuery } from "../../Store/slices/backend";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildSelection } from "./MissionsUtils";
import { Mission } from "../../Types/Interfaces/missions.interface";
import MissionDetails from "../../Components/Molecule/MissionDetails/MissionDetails";

export default function Missions() {
  const [selected, setSelected] = useState<Mission>();

  const handleNodeSelect = (_: any, nodeIds: string) => {
    if (data) {
      const [selectedMission] = data.missionsCollection.items.filter(
        (mission: any) => mission.sys.id === nodeIds
      );
      setSelected(selectedMission);
    }
  };
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetMissionsPageQuery(undefined);

  useEffect(() => {
    if (error || (!data && !isLoading)) {
      navigate("/404");
    }
  }, [error, navigate, data, isLoading]);

  if (isLoading) {
    return <Skeleton height={40} />;
  }

  const selection = buildSelection(data?.missionsCollection.items || []);

  const mission = selected ? (
    <MissionDetails {...selected} />
  ) : (
    <Typography textAlign="center" variant="h3">
      Select a mission
    </Typography>
  );
  return (
    <Stack direction="column">
      <Box sx={{ textAlign: "center" }}>
        <Typography textAlign="center" variant="h2">
          {data?.title}
        </Typography>
      </Box>
      <Stack direction="row" justifyContent="center" gap={6}>
        <Box
          sx={{
            border: "1px solid white",
            padding: 3,
            borderBottomRightRadius: 10,
            width: { xs: "100%", sm: "33%" },
          }}
        >
          <TreeView
            onNodeSelect={handleNodeSelect}
            aria-label="mission select"
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
          >
            {selection}
          </TreeView>
        </Box>
        <Stack
          direction="column"
          gap={4}
          sx={{
            border: "1px solid white",
            padding: 3,
            borderBottomRightRadius: 10,
            width: { xs: "100%", sm: "58%" },
          }}
        >
          {mission}
        </Stack>
      </Stack>
    </Stack>
  );
}
