import React from 'react';
import PropTypes from 'prop-types';

import { FlexRow } from '../FlexRow';
import { PageInfoColumn } from './PageInfoColumn';

import { SUSSOL_ORANGE, DARK_GREY } from '../../globalStyles';

/**
 * A component to display info in a generic way at the top of a page.
 * @prop  {bool}   isEditingDisabled  Indicator whether all editing is disabled
 * @prop  {string} infoColor         Colour of all info components
 * @prop  {string} titleColor        Colour of all title components
 * @prop  {array}  columns   An array containing columns of information to be
 *                          displayed, with an entry in the array representing
 *                          a column, which is an array of info objects
 *                          containing a title and info.
 *
 *                          E.g.:
 *
 *                          [[{title: 'col1:', info: 'row1'},
 *                            {title: 'col1:', info: 'row2'}]
 *                           [{title: 'col2:', info: 'row1',
 *                             editableType: 'selectable'},
 *                            {title: 'col2:', info: 'row2',
 *                             editableType: 'text'}]]
 *
 *                          would display:
 *
 *                            col1: row1 col2: row1
 *                            col1: row2 col2: row2
 */
export const PageInfo = React.memo(({ columns, isEditingDisabled, titleColor, infoColor }) => (
  <FlexRow>
    {columns.map((column, index) => (
      <PageInfoColumn
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        isEditingDisabled={isEditingDisabled}
        titleColor={titleColor}
        infoColor={infoColor}
        columnData={column}
      />
    ))}
  </FlexRow>
));

PageInfo.defaultProps = {
  isEditingDisabled: false,
  titleColor: DARK_GREY,
  infoColor: SUSSOL_ORANGE,
};

PageInfo.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  columns: PropTypes.array.isRequired,
  isEditingDisabled: PropTypes.bool,
  titleColor: PropTypes.string,
  infoColor: PropTypes.string,
};
