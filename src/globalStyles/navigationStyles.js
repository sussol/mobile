/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { BACKGROUND_COLOR, GREY } from './colors';
import { PAGE_CONTENT_PADDING_HORIZONTAL } from './pageStyles';
import { APP_FONT_FAMILY } from './fonts';

export const navigationStyles = {
  headerStyle: {
    backgroundColor: BACKGROUND_COLOR,
    height: 36,
  },
  headerLeftContainerStyle: { paddingLeft: PAGE_CONTENT_PADDING_HORIZONTAL },
  headerRightContainerStyle: {
    paddingRight: PAGE_CONTENT_PADDING_HORIZONTAL,
  },
  navBarRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navBarText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 10,
    color: GREY,

    marginRight: 15,
  },
};

export default navigationStyles;
