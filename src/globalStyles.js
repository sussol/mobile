/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import {
  StyleSheet,
} from 'react-native';
export const APP_FONT_FAMILY = 'Museo_Slab_500';
export const SUSSOL_ORANGE = '#e95c30';
export const BLUE_WHITE = '#ecf3fc';
export const BACKGROUND_COLOR = '#f8fbfe';
export const SHADOW_BORDER = 'rgba(0, 0, 0, 0.1)';
export const DARK_GREY = '#4a4a4a';
export const DARKER_GREY = '#333333';
export const GREY = '#909192';
export const WARM_GREY = '#9b9b9b';
export const WARMER_GREY = '#a8aaac';
export const LIGHT_GREY = '#c9cccd';
export const ROW_BLUE = 'rgba(73, 143, 226, 0.05)';
export const FINALISE_GREEN = '#219d1b';
export const FINALISED_RED = '#f63b30';
export const PAGE_CONTENT_PADDING_HORIZONTAL = 20;
export const PAGE_CONTENT_PADDING_TOP = 10;
export const PAGE_CONTENT_PADDING_BOTTOM = 20;
export const COMPONENT_HEIGHT = 45;
export const SEARCH_BAR_WIDTH = 800;
const PAGE_TOP_LEFT_WIDTH = SEARCH_BAR_WIDTH;

export default StyleSheet.create({
  appBackground: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: SHADOW_BORDER,
    backgroundColor: BLUE_WHITE,
  },
  pageContentContainer: {
    flex: 1,
    paddingHorizontal: PAGE_CONTENT_PADDING_HORIZONTAL,
    paddingTop: PAGE_CONTENT_PADDING_TOP,
    paddingBottom: PAGE_CONTENT_PADDING_BOTTOM,
    backgroundColor: BACKGROUND_COLOR,
  },
  pageTopSectionContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  pageTopLeftSectionContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: PAGE_TOP_LEFT_WIDTH,
  },
  pageTopRightSectionContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
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
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButton: {
    borderColor: 'white',
  },
  modalButtonText: {
    color: 'white',
  },
  modalOrangeButton: {
    borderColor: 'white',
    backgroundColor: SUSSOL_ORANGE,
  },
  modalTextInput: {
    width: SEARCH_BAR_WIDTH,
    borderColor: BACKGROUND_COLOR,
  },
  modalText: {
    color: 'white',
    fontFamily: APP_FONT_FAMILY, // Doesn't affect the placeholder text - RN 0.27
  },
  authFormModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: 'flex-start',
  },
  authFormTextInputStyle: {
    flex: 1,
    marginHorizontal: 60,
    color: SUSSOL_ORANGE,
    fontFamily: APP_FONT_FAMILY,
  },
  authFormContainer: {
    flex: 1,
    marginTop: 80,
    marginHorizontal: 300,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    elevation: 3,
    borderColor: WARMER_GREY,
    borderWidth: 1,
    borderRadius: 1,
  },
  authFormButton: {
    backgroundColor: SUSSOL_ORANGE,
  },
  authFormButtonContainer: {
    alignSelf: 'stretch',
  },
  authFormButtonText: {
    color: 'white',
    fontFamily: APP_FONT_FAMILY,
    textAlign: 'center',
    fontSize: 22,
    marginVertical: 15,
  },
  authFormLogo: {
    marginTop: 30,
    marginBottom: 60,
  },
  loginButton: {
    marginTop: 60,
  },
  initialisationStateIcon: {
    marginTop: 46,
    marginBottom: 24,
  },
  navBarStyle: {
    backgroundColor: BACKGROUND_COLOR,
    borderBottomWidth: 0,
    elevation: 0,
  },
  text: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
  },
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
  disabledButton: {
    borderColor: WARMER_GREY,
  },
  topButton: {
    marginBottom: 10,
  },
  leftButton: {
    marginRight: 10,
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
  dataTableText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    color: DARK_GREY,
  },
  dataTableHeader: {
    backgroundColor: 'white',
  },
  dataTableHeaderCell: {
    height: 40,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    backgroundColor: 'white',
    borderColor: BLUE_WHITE,
  },
  dataTableRow: {
    backgroundColor: BACKGROUND_COLOR,
  },
  dataTableExpansion: {
    padding: 15,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: BLUE_WHITE,
  },
  dataTableCell: {
    height: COMPONENT_HEIGHT,
    borderRightWidth: 2,
    borderColor: BLUE_WHITE,
  },
  dataTableRightMostCell: {
    borderRightWidth: 0,
  },
  dataTableCheckableCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataTableButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    borderWidth: 1,
    borderRadius: 4,
    padding: 15,
    margin: 5,
    borderColor: SUSSOL_ORANGE,
  },
  finaliseButton: {
    color: FINALISE_GREEN,
    fontSize: 40,
  },
  finaliseModal: {
    paddingHorizontal: PAGE_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: 'transparent',
  },
  finaliseModalButtonContainer: {
    justifyContent: 'center',
  },
  finaliseModalButton: {
    marginHorizontal: 15,
    borderColor: 'white',
  },
  finaliseModalConfirmButton: {
    backgroundColor: SUSSOL_ORANGE,
  },
  finaliseModalButtonText: {
    color: 'white',
  },
  finaliseModalText: {
    color: 'white',
    fontSize: 22,
    fontFamily: APP_FONT_FAMILY,
    textAlign: 'center',
    marginHorizontal: 190,
  },
  finalisedLock: {
    color: FINALISED_RED,
    fontSize: 28,
    marginHorizontal: 8,
    bottom: 6,
  },
  toggleBar: {
    borderColor: SUSSOL_ORANGE,
    marginHorizontal: 5,
    borderRadius: 4,
  },
  toggleText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    color: SUSSOL_ORANGE,
  },
  toggleTextSelected: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    color: 'white',
  },
  toggleOption: {
  },
  toggleOptionSelected: {
    backgroundColor: SUSSOL_ORANGE,
  },
  loadingIndicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DARK_GREY,
    opacity: 0.88,
  },
});
