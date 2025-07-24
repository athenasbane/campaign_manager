import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { setActiveMission } from "../../../Store/slices/activeMission";
import { MissionLocation } from "../../../Types/Interfaces/missions.interface";
import { useAppDispatch } from "../../../hooks/store.hooks";
import { useNavigate } from "react-router-dom";

export interface MissionDetailsProps {
  missionName: string;
  location: string;
  setter: string;
  reward: string;
  description: string;
  missionLocation?: MissionLocation;
}

export default function MissionDetails({
  missionName,
  location,
  setter,
  reward,
  description,
  missionLocation,
}: MissionDetailsProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const handleMissionSelect = () => {
    if (missionLocation?.name) {
      dispatch(
        setActiveMission({
          missionName,
          location,
          setter,
          reward,
          description,
          missionLocation,
        })
      );
      navigate("/map/" + missionLocation.mapReference.sys.id);
    }
  };
  return (
    <>
      <Box mb={4}>
        <Typography variant="h3" textAlign="center">
          {missionName}
        </Typography>
      </Box>
      <Stack direction="row">
        <Box sx={{ width: "50%" }}>
          <Typography variant="h4">Location:</Typography>
        </Box>
        <Box sx={{ width: "50%" }}>
          <Typography variant="h5">{location}</Typography>
        </Box>
      </Stack>
      <Stack direction="row">
        <Box sx={{ width: "50%" }}>
          <Typography variant="h4">Who:</Typography>
        </Box>
        <Box sx={{ width: "50%" }}>
          <Typography variant="h5">{setter}</Typography>
        </Box>
      </Stack>
      <Stack direction="row">
        <Box sx={{ width: "50%" }}>
          <Typography variant="h4">Reward:</Typography>
        </Box>
        <Box sx={{ width: "50%" }}>
          <Typography variant="h5">{reward}</Typography>
        </Box>
      </Stack>
      <Stack direction="column">
        <Box>
          <Typography variant="h4">Description:</Typography>
        </Box>
        <Box>
          <Typography variant="h6">{description}</Typography>
        </Box>
      </Stack>
      {missionLocation?.name ? (
        <Stack direction="row">
          <Box>
            <Typography variant="h4">View on Map: </Typography>
          </Box>
          <Box>
            <Button onClick={handleMissionSelect}>Map</Button>
          </Box>
        </Stack>
      ) : null}
    </>
  );
}
