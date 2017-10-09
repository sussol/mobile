/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import {
  StyleSheet,
} from 'react-native';
import { appStyles, COMPONENT_HEIGHT } from './appStyles';
import { authStyles } from './authStyles';
import { buttonStyles } from './buttonStyles';
import { dataTableStyles, dataTableColors } from './dataTableStyles';
import { finaliseStyles } from './finaliseStyles';
import { loadingIndicatorStyles } from './loadingIndicatorStyles';
import { modalStyles } from './modalStyles';
import { navigationStyles } from './navigationStyles';
import {
  pageStyles,
  expansionPageStyles,
  PAGE_TOP_LEFT_WIDTH,
  PAGE_CONTENT_PADDING_BOTTOM,
  PAGE_CONTENT_PADDING_TOP,
  PAGE_CONTENT_PADDING_HORIZONTAL,
} from './pageStyles';
import { toggleBarStyles } from './toggleBarStyles';
export { textStyles } from './textStyles';

export { APP_FONT_FAMILY } from './fonts';
export {
  SUSSOL_ORANGE,
  BLUE_WHITE,
  BACKGROUND_COLOR,
  SHADOW_BORDER,
  DARK_GREY,
  DARKER_GREY,
  GREY,
  WARM_GREY,
  WARMER_GREY,
  LIGHT_GREY,
  ROW_BLUE,
  FINALISE_GREEN,
  FINALISED_RED,
} from './colors';
export {
  COMPONENT_HEIGHT,
  dataTableStyles,
  dataTableColors,
  pageStyles,
  expansionPageStyles,
  PAGE_TOP_LEFT_WIDTH,
  PAGE_CONTENT_PADDING_BOTTOM,
  PAGE_CONTENT_PADDING_TOP,
  PAGE_CONTENT_PADDING_HORIZONTAL,
};

export default StyleSheet.create({
  ...appStyles,
  ...authStyles,
  ...buttonStyles,
  ...finaliseStyles,
  ...loadingIndicatorStyles,
  ...modalStyles,
  ...navigationStyles,
  ...pageStyles,
  ...toggleBarStyles,
});
