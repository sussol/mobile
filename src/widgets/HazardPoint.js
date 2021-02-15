/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import PropTypes from 'prop-types';
import Svg, { Rect, Path, G } from 'react-native-svg';

import { SUSSOL_ORANGE, TRANSPARENT } from '../globalStyles/colors';

const hazardPath = `M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423
 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595
 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982
 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z`;

/**
 * Custom component for rendering clickable hazard icons.
 */
export const HazardPoint = props => {
  const { x, y, onPress, dataSet, index } = props;
  const { xOffset, yOffset, scale, fill } = hazardPointStyles;

  const onPressWrapper = React.useCallback(() => onPress?.(dataSet[index]?.id), []);

  return (
    <Svg>
      <G>
        <Rect
          x={x + xOffset}
          y={y + yOffset}
          width="50"
          height="50"
          fill={TRANSPARENT}
          onPress={onPressWrapper}
        />
        <Path x={x + xOffset} y={y + yOffset} scale={scale} d={hazardPath} fill={fill} />
      </G>
    </Svg>
  );
};

// Offsets to position hazard point relative to top-left (x,y) coordinates to render above each
// scatter point.
const hazardPointStyles = {
  xOffset: -14,
  yOffset: -33,
  scale: 0.05,
  fill: SUSSOL_ORANGE,
};

// Bug in Victory charts causes required props to be undefined on first render,
// do not set as required.
HazardPoint.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  onPress: PropTypes.func,
  index: PropTypes.number.isRequired,
  dataSet: PropTypes.array.isRequired,
};
