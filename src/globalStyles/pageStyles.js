/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { SHADOW_BORDER, BLUE_WHITE, BACKGROUND_COLOR, TRANSPARENT } from './colors';
import { APP_FONT_FAMILY } from './fonts';

export const PAGE_CONTENT_PADDING_HORIZONTAL = 20;
export const PAGE_CONTENT_PADDING_TOP = 10;
export const PAGE_CONTENT_PADDING_BOTTOM = 20;

export const pageStyles = {
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
    flex: 2,
  },
  pageTopRightSectionContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  searchBar: {
    height: 40,
    flex: 1,
    fontSize: 16,
    fontFamily: APP_FONT_FAMILY,
    backgroundColor: TRANSPARENT,
  },
  newPageContentContainer: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f8fbfe',
  },
  newContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ecf3fc',
  },
  newPageTopSectionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  newPageTopLeftSectionContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: 500,
    paddingHorizontal: 10,
  },
  newPageTopRightSectionContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
};

export const expansionPageStyles = {
  ...pageStyles,
  container: {
    ...pageStyles.container,
    backgroundColor: TRANSPARENT,
  },
  pageContentContainer: {
    ...pageStyles.pageContentContainer,
    backgroundColor: TRANSPARENT,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  pageTopSectionContainer: {
    ...pageStyles.pageTopSectionContainer,
    paddingVertical: 4,
  },
};
