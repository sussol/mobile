/* eslint-disable import/prefer-default-export */
export const getAdjustedStyle = (style, width, isLastCell) => {
  if (width && isLastCell) return { ...style, flex: width, borderRightWidth: 0 };
  if (width) return { ...style, flex: width };
  if (isLastCell) return { ...style, borderWidth: 0 };
  return style;
};
