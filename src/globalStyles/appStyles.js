/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { BACKGROUND_COLOR } from './colors';
import { APP_FONT_FAMILY } from './fonts';

export const appStyles = {
  appBackground: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
  },
};
