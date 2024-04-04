import { Box } from "@mui/material";
import Pins from "Components/Molecule/Pins/Pins";
import MapTools from "Components/Molecule/MapTools/MapTools";
import { StyledImg } from "./InteractiveMapStyles";
import { useInteractiveMapTools } from "./useInteractiveMapTools";

export interface InteractiveMapProps {
  imageSrc: string;

  unitOfDistance: string | null;

  detail?: number | null;

  width?: number | string;

  height?: number | string;
}
export interface IPin {
  top: number;
  left: number;
  visable: boolean;
}

export default function InteractiveMap({
  imageSrc,
  detail = 10,
  width,
  height,
  unitOfDistance = " Days",
}: InteractiveMapProps) {
  const {
    handleToolChange,
    activeTool,
    toolRef,
    pinOneActive,
    pinOne,
    pinTwo,
    distance,
    isVisable,
    setPinOneActive,
    ref,
    pinSet,
    missionPin,
    activeMission,
    imageRef,
    divHeight,
    divWidth,
  } = useInteractiveMapTools();

  return (
    <Box>
      <MapTools
        handleToolChange={handleToolChange}
        activeTool={activeTool}
        toolRef={toolRef}
        pinOneActive={pinOneActive}
        isPinOneVisable={pinOne.visable}
        isPinTwoVisable={pinTwo.visable}
        distance={distance}
        detail={detail}
        unitOfDistance={unitOfDistance}
        isSnackBarVisable={isVisable}
        handlePinOneActive={(newValue: boolean) => setPinOneActive(newValue)}
      />
      <div style={{ position: "relative" }} ref={ref} onClick={pinSet}>
        <Pins
          pinOneTop={pinOne.top}
          pinOneLeft={pinOne.left}
          isPinOneVisable={pinOne.visable}
          pinTwoTop={pinTwo.top}
          pinTwoLeft={pinTwo.left}
          isPinTwoVisable={pinTwo.visable}
          missionPinTop={missionPin.top}
          missionPinLeft={missionPin.left}
          isMissionPinVisable={missionPin.visable}
          missionName={activeMission?.missionLocation?.name}
          imageHeight={divHeight}
          imageWidth={divWidth}
        />
        <StyledImg
          ref={imageRef}
          width={width}
          height={height}
          src={imageSrc}
          alt="map"
        />
      </div>
    </Box>
  );
}
