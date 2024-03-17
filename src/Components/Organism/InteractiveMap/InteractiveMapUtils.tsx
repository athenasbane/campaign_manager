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
