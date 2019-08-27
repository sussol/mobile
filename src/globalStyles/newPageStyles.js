/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { APP_FONT_FAMILY } from './fonts';
import { TRANSPARENT } from './colors';

export const PAGE_CONTENT_PADDING_HORIZONTAL = 20;
export const PAGE_CONTENT_PADDING_TOP = 10;
export const PAGE_CONTENT_PADDING_BOTTOM = 20;

const newPageStyles = {
  newPageContentContainer: {
    flex: 1,
    paddingTop: PAGE_CONTENT_PADDING_TOP,
    paddingHorizontal: PAGE_CONTENT_PADDING_HORIZONTAL,
    paddingBottom: PAGE_CONTENT_PADDING_BOTTOM,
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
    flex: 2,
    paddingHorizontal: 10,
  },
  newPageTopRightSectionContainer: {
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
};

export default newPageStyles;
