const lightBlue = "#36b7ff";
const blue = "#487cff";
const white = "#ffffff";
const offWhite = "#fafafa";
const lightGray = "#f3f3f3";
const gray = "#D8D8D8";
const black = "#000000";
const shadow = "#A8A8A8";
const text = "#2B2D2F";
const red = "#ff4f4f";
const green = "#1ca081";

const getShadow = (x, y, blur, color) =>
  `${x}px ${y}px ${blur}px ${color ? color : colors.shadow}`;
const hexWithOpacity = (color, alpha) =>
  "rgba(" +
  parseInt(color.substring(1, 3), 16) +
  "," +
  parseInt(color.substring(3, 5), 16) +
  "," +
  parseInt(color.substring(5, 7), 16) +
  "," +
  alpha +
  ")";

export const colors = {
  lightBlue,
  blue,
  white,
  offWhite,
  lightGray,
  black,
  shadow,
  gray,
  text,
  red,
  green,
  hexWithOpacity,
  getShadow,
};
