/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { FINALISE_GREEN, FINALISED_RED, GREY } from './colors';
import { APP_FONT_FAMILY } from './fonts';

export const navigationStyles = {
  navBarText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 10,
    color: GREY,
    alignSelf: 'flex-end',
    marginRight: 15,
  },
  navBarRightContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    bottom: 6,
  },
  finaliseButton: {
    color: FINALISE_GREEN,
    fontSize: 40,
  },
  finalisedLock: {
    color: FINALISED_RED,
    fontSize: 28,
    marginHorizontal: 8,
    bottom: 6,
  },
};
