import { Box, Collapse } from "@mui/material";

import { useCallback, useEffect, useRef, useState } from "react";
import { distanceCalc } from "./InteractiveMapUtils";
import Pin from "Components/Molecule/Pin/Pin";
import Line from "Components/Molecule/Line/Line";
import MapToolBar from "Components/Molecule/MapToolBar/MapToolBar";
import DistanceTool from "Components/Molecule/DistanceTool/DistanceTool";
import { useAppSelector } from "hooks/store.hooks";

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

  const pinSet = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (pinOneActive) {
      setPinOne((prev) => ({
        top: event.clientY - (rect?.top || 0),
        left: event.clientX - (rect?.left || 0),
        visable: !prev.visable,
      }));
      return;
    }

    setPinTwo((prev) => ({
      top: event.clientY - (rect?.top || 0),
      left: event.clientX - (rect?.left || 0),
      visable: !prev.visable,
    }));
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
      <MapToolBar
        handleToolBarChange={handleToolChange}
        activeTool={activeTool}
      />
      <Collapse in={activeTool === 1}>
        <DistanceTool
          pinOneActive={pinOneActive}
          handlePinOneActive={(newValue: boolean) => setPinOneActive(newValue)}
          isPinOneVisable={pinOne.visable}
          isPinTwoVisable={pinTwo.visable}
          distance={distance}
          detail={detail || 10}
          unitOfDistance={unitOfDistance || " Days"}
        />
      </Collapse>
      <div style={{ position: "relative" }} ref={ref} onClick={pinSet}>
        <Pin
          top={pinOne.top}
          left={pinOne.left}
          isVisable={pinOne.visable}
          color="success"
        />
        <Pin
          top={pinTwo.top}
          left={pinTwo.left}
          isVisable={pinTwo.visable}
          color="error"
        />
        <Pin
          top={missionPin.top}
          left={missionPin.left}
          isVisable={missionPin.visable}
          name={activeMission?.missionLocation?.name}
          color="warning"
        />
        {pinOne.visable && pinTwo.visable ? (
          <Line
            x1={pinOne.left}
            y1={pinOne.top}
            x2={pinTwo.left}
            y2={pinTwo.top}
            divHeight={divHeight}
            divWidth={divWidth}
          />
        ) : null}
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
