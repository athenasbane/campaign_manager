import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

interface DistanceToolProps {
  pinOneActive: boolean;
  handlePinOneActive: (newValue: boolean) => void;
  isPinOneVisable: boolean;
  isPinTwoVisable: boolean;
  detail: number;
  unitOfDistance: string;
  distance?: number;
}

export default function DistanceTool({
  pinOneActive,
  handlePinOneActive,
  isPinOneVisable,
  isPinTwoVisable,
  detail,
  unitOfDistance,
  distance,
}: DistanceToolProps) {
  return (
    <Stack direction="row">
      <Stack direction="row" sx={{ width: "50%" }}>
        <Box>
          <Button
            disabled={pinOneActive}
            onClick={() => handlePinOneActive(true)}
          >
            Start
          </Button>
        </Box>
        <Box>
          <Button
            disabled={!pinOneActive}
            onClick={() => handlePinOneActive(false)}
          >
            Destination
          </Button>
        </Box>
      </Stack>
      {isPinOneVisable && isPinTwoVisable ? (
        <Box sx={{ width: "50%", alignSelf: "center" }}>
          <Typography textAlign="end" variant="body1">
            {`Distance: `}
            {((distance || 0) * detail).toFixed(1)}
            {unitOfDistance}
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
}
