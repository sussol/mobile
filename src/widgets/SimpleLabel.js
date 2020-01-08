/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';

import {
  APP_GENERAL_FONT_SIZE,
  APP_FONT_FAMILY,
  SUSSOL_ORANGE,
  DARKER_GREY,
} from '../globalStyles/index';

/**
 * Simple text label rendering in the form [label] [text] in various
 * sizes.
 *
 * @prop {String} label  The label text
 * @prop {String} text   The text string
 * @prop {String} size   The size of the label: "small" or "large"
 *
 */
export const SimpleLabel = React.memo(({ label, text, size, labelAlign, textAlign }) => {
  // Ensure null is set rather than any other nullish value as null is a node, but "" is not.
  const usingLabel = label || null;
  const styles = React.useMemo(() => simpleLabelStyles(size), [size]);
  const { labelStyle, textStyle, containerStyle } = styles;
  return (
    <View style={containerStyle}>
      {usingLabel && (
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{ ...labelStyle, textAlign: labelAlign }}
        >
          {`${label}  `}
        </Text>
      )}
      <Text numberOfLines={2} ellipsizeMode="tail" style={{ ...textStyle, textAlign }}>
        {text}
      </Text>
    </View>
  );
});

const simpleLabelStyles = size => ({
  labelStyle: {
    fontFamily: APP_FONT_FAMILY,
    color: SUSSOL_ORANGE,
    fontSize: size === 'small' ? APP_GENERAL_FONT_SIZE : 20,
    fontWeight: 'bold',
    flex: 1,
    flexShrink: 1,
  },
  textStyle: {
    flex: 4,
    flexGrow: 1,
    fontFamily: APP_FONT_FAMILY,
    color: DARKER_GREY,

    fontSize: size === 'small' ? APP_GENERAL_FONT_SIZE : 20,
  },
  containerStyle: { flexDirection: 'row', flex: 1, alignItems: 'center' },
});

SimpleLabel.defaultProps = {
  size: 'small',
  text: '',
  label: '',
  labelAlign: 'left',
  textAlign: 'left',
};

SimpleLabel.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.oneOf(['small', 'large']),
  label: PropTypes.string,
  labelAlign: PropTypes.string,
  textAlign: PropTypes.string,
};
