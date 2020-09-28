import React from 'react';
import PropTypes from 'prop-types';

import { FlexRow } from '../FlexRow';
import { PageInfoColumn } from './PageInfoColumn';

import { SUSSOL_ORANGE, DARK_GREY } from '../../globalStyles';

/**
 * A component to display info in a generic way at the top of a page.
 * @prop  {bool}   isEditingDisabled  Indicator whether all editing is disabled
 * @prop  {string} infoColour         Colour of all info components
 * @prop  {string} titleColour        Colour of all title components
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
export const PageInfo = React.memo(({ columns, isEditingDisabled, titleColour, infoColour }) => (
  <FlexRow>
    {columns.map((column, index) => (
      <PageInfoColumn
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        isEditingDisabled={isEditingDisabled}
        titleColour={titleColour}
        infoColour={infoColour}
        columnData={column}
      />
    ))}
  </FlexRow>
));

PageInfo.defaultProps = {
  isEditingDisabled: false,
  titleColour: DARK_GREY,
  infoColour: SUSSOL_ORANGE,
};

PageInfo.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  columns: PropTypes.array.isRequired,
  isEditingDisabled: PropTypes.bool,
  titleColour: PropTypes.string,
  infoColour: PropTypes.string,
};
