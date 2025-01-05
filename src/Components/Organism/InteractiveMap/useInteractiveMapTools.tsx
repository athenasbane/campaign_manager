import { useCallback, useEffect, useRef, useState } from "react";
import { calculatePinCoordinates, distanceCalc } from "./InteractiveMapUtils";
import { IPin } from "./InteractiveMap";
import useOnScreen from "../../../hooks/onScreen.hooks";
import { EnumLayout, selectLayoutDetails } from "../../../Store/slices/layout";
import { useAppSelector } from "../../../hooks/store.hooks";

const initialPinState = {
  top: 0,
  left: 0,
  visable: false,
};

export const useInteractiveMapTools = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const toolRef = useRef<HTMLDivElement | null>(null);
  const [distance, setDistance] = useState<number | undefined>(undefined);
  const [divWidth, setDivWidth] = useState<number>(300);
  const [divHeight, setDivHeight] = useState<number>(100);
  const [debounce, setDebounce] = useState<boolean>(true);
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

      const [top, left] = calculatePinCoordinates(
        height,
        width,
        activeMission.missionLocation.imageHeight,
        activeMission.missionLocation.imageWidth,
        activeMission.missionLocation.yCoordinate,
        activeMission.missionLocation.xCoordinate
      );

      setMissionPin({ top, left, visable: true });
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

  return {
    ref,
    imageRef,
    toolRef,
    distance,
    activeTool,
    pinOne,
    pinTwo,
    missionPin,
    pinOneActive,
    setPinOneActive,
    handleToolChange,
    isVisable,
    pinSet,
    activeMission,
    divHeight,
    divWidth,
  };
};
