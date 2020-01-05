/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { StyleSheet } from 'react-native';

import { appStyles, COMPONENT_HEIGHT } from './appStyles';
import { authStyles } from './authStyles';
import { buttonStyles } from './buttonStyles';
import { confirmModalStyles } from './confirmModalStyles';
import { loadingIndicatorStyles } from './loadingIndicatorStyles';
import { modalStyles } from './modalStyles';
import { navigationStyles } from './navigationStyles';
import {
  PAGE_CONTENT_PADDING_BOTTOM,
  PAGE_CONTENT_PADDING_TOP,
  PAGE_CONTENT_PADDING_HORIZONTAL,
  FULL_SCREEN_MODAL_MARGIN,
  pageStyles,
} from './pageStyles';
import { toggleBarStyles } from './toggleBarStyles';
import { dataTableStyles, dataTableColors } from './dataTableStyles';
import { pickerStyles } from './pickerStyles';

export {
  BACKGROUND_COLOR,
  BLUE_WHITE,
  DARK_GREY,
  DARKER_GREY,
  FINALISE_GREEN,
  FINALISED_RED,
  GREY,
  LIGHT_GREY,
  ROW_BLUE,
  SHADOW_BORDER,
  SOFT_RED,
  SUSSOL_ORANGE,
  WARM_GREY,
  WARMER_GREY,
  WHITE,
} from './colors';

export { APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from './fonts';

export { textStyles } from './textStyles';

export {
  COMPONENT_HEIGHT,
  dataTableStyles,
  dataTableColors,
  FULL_SCREEN_MODAL_MARGIN,
  PAGE_CONTENT_PADDING_BOTTOM,
  PAGE_CONTENT_PADDING_TOP,
  PAGE_CONTENT_PADDING_HORIZONTAL,
};

export default StyleSheet.create({
  ...appStyles,
  ...authStyles,
  ...buttonStyles,
  ...confirmModalStyles,
  ...loadingIndicatorStyles,
  ...modalStyles,
  ...navigationStyles,
  ...pageStyles,
  ...pickerStyles,
  ...toggleBarStyles,
});
