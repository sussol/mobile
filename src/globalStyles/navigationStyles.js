/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { BACKGROUND_COLOR, DARK_GREY, GREY } from './colors';
import { APP_FONT_FAMILY } from './fonts';

export const navigationStyles = {
  navBarStyle: {
    backgroundColor: BACKGROUND_COLOR,
    borderBottomWidth: 0,
    elevation: 0,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderColor: DARK_GREY,
  },
  navBarText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 10,
    color: GREY,
    alignSelf: 'flex-end',
    marginRight: 15,
  },
  navBarRightContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    bottom: 6,
  },
};
