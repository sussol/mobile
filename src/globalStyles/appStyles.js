/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { BACKGROUND_COLOR } from './colors';
import { APP_FONT_FAMILY } from './fonts';

export const COMPONENT_HEIGHT = 45;
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
  bottomContainer: {
    flex: 1,
    maxHeight: 100,
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 40,
  },
};
