export const distanceCalc = (
  pOneX: number,
  pOneY: number,
  pTwoX: number,
  pTwoY: number,
  height: number,
  width: number
) => {
  const maxX = Math.max(pOneX, pTwoX) / height;
  const maxY = Math.max(pOneY, pTwoY) / width;
  const minX = Math.min(pOneX, pTwoX) / height;
  const minY = Math.min(pOneY, pTwoY) / width;

  const maxXMinusMinX = maxX - minX;
  const maxYMinusMinY = maxY - minY;

  const xSquared = maxXMinusMinX ** 2;
  const ySquared = maxYMinusMinY ** 2;

  const xSquaredPlusYSquared = xSquared + ySquared;

  const sqrt = Math.sqrt(xSquaredPlusYSquared);

  return sqrt;
};

export const mapCoordinateDistanceCalc = (
  pointOne: [number, number],
  pointTwo: [number, number],
  imageHeight: number,
  imageWidth: number
) => {
  const yDistance = Math.abs(pointOne[1] - pointTwo[1]) / imageHeight;
  const xDistance = Math.abs(pointOne[0] - pointTwo[0]) / imageWidth;

  return Math.sqrt(xDistance ** 2 + yDistance ** 2);
};

export const calculatePinCoordinates = (
  currentHeight: number,
  currentWidth: number,
  imageHeight: number,
  imageWidth: number,
  yCoordinate: number,
  xCoordinate: number
): [number, number] => {
  const diffHeight = currentHeight / imageHeight;
  const diffWidth = currentWidth / imageWidth;

  const newTop = diffHeight * yCoordinate;
  const newLeft = diffWidth * xCoordinate;

  return [newTop, newLeft];
};
