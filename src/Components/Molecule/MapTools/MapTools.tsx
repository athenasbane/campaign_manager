import Collapse from "@mui/material/Collapse";
import MapToolBar from "../MapToolBar/MapToolBar";
import DistanceTool from "../DistanceTool/DistanceTool";
import Snackbar from "@mui/material/Snackbar";

export interface MapToolsProp {
  handleToolChange: (_: React.SyntheticEvent, newValue: number) => void;
  activeTool: number;
  toolRef: React.MutableRefObject<HTMLDivElement | null>;
  pinOneActive: boolean;
  isPinOneVisable: boolean;
  isPinTwoVisable: boolean;
  distance?: number;
  detail: number | null;
  unitOfDistance: string | null;
  isSnackBarVisable: boolean;
  handlePinOneActive: (newValue: boolean) => void;
}

export default function MapTools({
  handleToolChange,
  activeTool,
  toolRef,
  pinOneActive,
  isPinOneVisable,
  isPinTwoVisable,
  distance,
  detail,
  unitOfDistance,
  isSnackBarVisable,
  handlePinOneActive,
}: MapToolsProp) {
  return (
    <>
      <MapToolBar
        handleToolBarChange={handleToolChange}
        activeTool={activeTool}
      />
      <Collapse ref={toolRef} in={activeTool === 1}>
        <DistanceTool
          pinOneActive={pinOneActive}
          handlePinOneActive={handlePinOneActive}
          isPinOneVisable={isPinOneVisable}
          isPinTwoVisable={isPinTwoVisable}
          distance={distance}
          detail={detail || 10}
          unitOfDistance={unitOfDistance || " Days"}
        />
      </Collapse>
      <Snackbar
        open={!isSnackBarVisable}
        sx={{ backgroundColor: "rgba(0,0,0,0.5)", paddingRight: 4 }}
      >
        <div style={{ justifyContent: "row" }}>
          <DistanceTool
            pinOneActive={pinOneActive}
            handlePinOneActive={handlePinOneActive}
            isPinOneVisable={isPinOneVisable}
            isPinTwoVisable={isPinTwoVisable}
            distance={distance}
            detail={detail || 10}
            unitOfDistance={unitOfDistance || " Days"}
          />
        </div>
      </Snackbar>
    </>
  );
}
