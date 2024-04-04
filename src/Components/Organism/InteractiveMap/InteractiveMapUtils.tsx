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
