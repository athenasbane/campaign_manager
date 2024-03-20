import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { distanceCalc } from "./InteractiveMapUtils";
import { useAppSelector } from "hooks/store.hooks";
import useOnScreen from "hooks/onScreen.hooks";
import { EnumLayout, selectLayoutDetails } from "Store/slices/layout";
import Pins from "Components/Molecule/Pins/Pins";
import MapTools from "Components/Molecule/MapTools/MapTools";

export interface InteractiveMapProps {
  imageSrc: string;

  unitOfDistance: string | null;

  detail?: number | null;

  width?: number | string;

  height?: number | string;
}
interface IPin {
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
  const ref = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const toolRef = useRef<HTMLDivElement | null>(null);
  const [distance, setDistance] = useState<number | undefined>(undefined);
  const [divWidth, setDivWidth] = useState<number>(300);
  const [divHeight, setDivHeight] = useState<number>(100);
  const [debounce, setDebounce] = useState<boolean>(true);
  const initialPinState = {
    top: 0,
    left: 0,
    visable: false,
  };
  const [activeTool, setActiveTool] = useState<number>(1);
  const [pinOne, setPinOne] = useState<IPin>({ ...initialPinState });
  const [pinTwo, setPinTwo] = useState<IPin>({ ...initialPinState });
  const [missionPin, setMissionPin] = useState<IPin>({ ...initialPinState });
  const [pinOneActive, setPinOneActive] = useState<boolean>(true);

  const handleToolChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTool(newValue);
  };

  const activeMission = useAppSelector((state) => state.activeMission.mission);
  const navDetails = useAppSelector((state) =>
    selectLayoutDetails(state.layout, EnumLayout.NavBar)
  );

  const isVisable = useOnScreen(toolRef, navDetails.height);

  const pinSet = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = ref.current?.getBoundingClientRect();
    const setPin = (prev: IPin) => ({
      top: event.clientY - (rect?.top || 0),
      left: event.clientX - (rect?.left || 0),
      visable: !prev.visable,
    });
    if (pinOneActive) {
      setPinOne(setPin);
      return;
    }

    setPinTwo(setPin);
  };

  const handleResize = useCallback((): void => {
    if (imageRef.current && debounce) {
      setDebounce(false);
      const { height, width } = imageRef.current.getBoundingClientRect();

      const resizePin = (prev: {
        top: number;
        left: number;
        visable: boolean;
      }) => {
        const diffHeight = height / divHeight;
        const diffWidth = width / divWidth;

        const newTop = diffHeight * prev.top;
        const newLeft = diffWidth * prev.left;

        return {
          top: newTop,
          left: newLeft,
          visable: prev.visable,
        };
      };

      setPinOne(resizePin);
      setPinTwo(resizePin);
      setMissionPin(resizePin);
    }
  }, [divHeight, divWidth, debounce]);

  useEffect(() => {
    if (activeMission?.missionLocation?.imageHeight && imageRef.current) {
      const { height, width } = imageRef.current.getBoundingClientRect();

      const diffHeight = height / activeMission.missionLocation.imageHeight;
      const diffWidth = width / activeMission.missionLocation.imageWidth;

      const newTop = diffHeight * activeMission.missionLocation.yCoordinate;
      const newLeft = diffWidth * activeMission.missionLocation.xCoordinate;

      setMissionPin({ top: newTop, left: newLeft, visable: true });
    }
  }, [
    activeMission?.missionLocation?.imageHeight,
    divHeight,
    activeMission?.missionLocation?.imageWidth,
    divWidth,
    activeMission?.missionLocation?.xCoordinate,
    activeMission?.missionLocation?.yCoordinate,
  ]);

  useEffect(() => {
    if (imageRef.current) {
      const { height, width } = imageRef.current.getBoundingClientRect();

      const d = distanceCalc(
        pinOne.top,
        pinOne.left,
        pinTwo.top,
        pinTwo.left,
        height,
        width
      );

      setDistance(d);
      setDivHeight(height);
      setDivWidth(width);
    }
  }, [pinTwo.top, pinOne.top, pinTwo.left, pinOne.left]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(() => setDebounce(true), 1000);
    handleResize();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [divHeight, divWidth, handleResize, debounce]);

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
        <img
          ref={imageRef}
          style={{ position: "absolute", width, height }}
          src={imageSrc}
          alt="map"
        />
      </div>
    </Box>
  );
}
