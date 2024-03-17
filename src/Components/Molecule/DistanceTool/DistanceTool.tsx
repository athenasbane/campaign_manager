import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

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
    <Grid container direction="row">
      <Grid container item direction="row" xs={9}>
        <Grid item>
          <Button
            disabled={pinOneActive}
            onClick={() => handlePinOneActive(true)}
          >
            Start
          </Button>
        </Grid>
        <Grid item>
          <Button
            disabled={!pinOneActive}
            onClick={() => handlePinOneActive(false)}
          >
            Destination
          </Button>
        </Grid>
      </Grid>
      {isPinOneVisable && isPinTwoVisable ? (
        <Grid item xs={3}>
          <Typography textAlign="end" variant="h5">
            {`Distance: `}
            {((distance || 0) * detail).toFixed(1)}
            {unitOfDistance}
          </Typography>
        </Grid>
      ) : null}
    </Grid>
  );
}
