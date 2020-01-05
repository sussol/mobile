/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { COMPONENT_HEIGHT } from './appStyles';
import { SUSSOL_ORANGE, WARM_GREY, WARMER_GREY, DARKER_GREY, DARK_GREY } from './colors';
import { APP_FONT_FAMILY } from './fonts';

export const buttonStyles = {
  buttonText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 10,
    color: SUSSOL_ORANGE,
  },
  disabledButtonText: {
    color: WARM_GREY,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: COMPONENT_HEIGHT,
    width: 140,
    borderWidth: 1,
    borderRadius: 4,
    padding: 15,
    margin: 5,
    borderColor: SUSSOL_ORANGE,
  },
  wideButton: {
    width: 285,
    marginBottom: 5,
    marginTop: 5,
  },
  disabledButton: {
    borderColor: WARMER_GREY,
  },
  topButton: {
    marginBottom: 10,
    marginLeft: 5,
  },
  leftButton: {
    marginRight: 10,
    marginLeft: 5,
  },
  menuButtonText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 17,
    color: DARKER_GREY,
  },
  menuButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 12,
    marginHorizontal: 30,
    width: 240,
    height: 60,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: DARK_GREY,
  },
};

export default buttonStyles;
