/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  APP_FONT_FAMILY,
  FINALISED_RED,
  FINALISE_GREEN,
  BLUE_WHITE,
  DARK_GREY,
} from '../globalStyles';

/**
 * Two state toggle bar. Primary use for within a cell in a data table. Has three
 * states - True: LHS toggled, False: RHS Toggled, Null: Nothing toggled.
 * Can be controlled by pressing any part of the component to switch the toggle,
 * or use the returned key to control dependent on which toggle was pressed.
 * @prop {String} firstText     Text for the LHS toggle
 * @prop {String} secondText    Text for the RHS toggle
 * @prop {String} firstKey      Key returned when the LHS toggle is pressed
 * @prop {String} secondKey     Key returned when the RHS toggle is pressed
 * @prop {Bool}   currentState  Current state of the toggle. True = left, right = right, null = none
 * @prop {Func}   onPress       onPress function - returns {key, nextState}
 */
export default class MiniToggleBar extends React.PureComponent {
  styles = () => {
    const { currentState } = this.props;
    if (currentState === null) {
      return {
        // Set a middle divider when no toggles have been set.
        firstStyle: { borderRightColor: '#CDCDCD', borderRightWidth: 1 },
      };
    }

    return {
      // Set the border color for the main container.
      mainStyle: currentState ? { borderColor: FINALISE_GREEN } : { borderColor: FINALISED_RED },
      // Set the background and font color for the left hand side.
      firstStyle: currentState && { backgroundColor: FINALISE_GREEN },
      firstTextStyle: currentState && { color: BLUE_WHITE },
      // Set the background color and font color for the right hand side.
      secondTextStyle: !currentState && { color: BLUE_WHITE },
      secondStyle: !currentState && { backgroundColor: FINALISED_RED, color: BLUE_WHITE },
    };
  };

  onPress = key => () => {
    const { onPress, currentState } = this.props;
    onPress({ newState: !currentState, key });
  };

  render() {
    const { firstText, secondText, firstKey, secondKey } = this.props;
    const { main, touchable, text } = localStyles;
    const { mainStyle, firstStyle, firstTextStyle, secondTextStyle, secondStyle } = this.styles();
    return (
      <View style={[main, mainStyle]}>
        <TouchableOpacity style={[touchable, firstStyle]} onPress={this.onPress(firstKey)}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={[text, firstTextStyle]}>
            {firstText}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[touchable, secondStyle]} onPress={this.onPress(secondKey)}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={[text, secondTextStyle]}>
            {secondText}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  main: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: DARK_GREY,
    alignSelf: 'center',
    flexDirection: 'row',
    height: '85%',
    width: '85%',
  },
  touchable: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: DARK_GREY,
    fontFamily: APP_FONT_FAMILY,
  },
});

MiniToggleBar.defaultProps = {
  firstKey: null,
  secondKey: null,
};

MiniToggleBar.propTypes = {
  firstText: PropTypes.string.isRequired,
  secondText: PropTypes.string.isRequired,
  firstKey: PropTypes.string,
  secondKey: PropTypes.string,
  currentState: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
};
