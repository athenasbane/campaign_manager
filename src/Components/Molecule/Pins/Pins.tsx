import Line from "../Line/Line";
import Pin from "../Pin/Pin";

export interface PinsProps {
  pinOneTop: number;
  pinOneLeft: number;
  isPinOneVisable: boolean;
  pinTwoTop: number;
  pinTwoLeft: number;
  isPinTwoVisable: boolean;
  missionPinTop: number;
  missionPinLeft: number;
  isMissionPinVisable: boolean;
  missionName?: string;
  imageHeight: number;
  imageWidth: number;
}

export default function Pins({
  pinOneTop,
  pinOneLeft,
  isPinOneVisable,
  pinTwoTop,
  pinTwoLeft,
  isPinTwoVisable,
  missionPinTop,
  missionPinLeft,
  isMissionPinVisable,
  missionName,
  imageHeight,
  imageWidth,
}: PinsProps) {
  return (
    <>
      <Pin
        top={pinOneTop}
        left={pinOneLeft}
        isVisable={isPinOneVisable}
        color="success"
      />
      <Pin
        top={pinTwoTop}
        left={pinTwoLeft}
        isVisable={isPinTwoVisable}
        color="error"
      />
      <Pin
        top={missionPinTop}
        left={missionPinLeft}
        isVisable={isMissionPinVisable}
        name={missionName}
        color="warning"
      />
      {isPinOneVisable && isPinTwoVisable ? (
        <Line
          x1={pinOneLeft}
          y1={pinOneTop}
          x2={pinTwoLeft}
          y2={pinTwoTop}
          divHeight={imageHeight}
          divWidth={imageWidth}
        />
      ) : null}
    </>
  );
}
