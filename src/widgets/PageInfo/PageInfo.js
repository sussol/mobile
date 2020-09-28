import React from 'react';
import PropTypes from 'prop-types';

import { FlexRow } from '../FlexRow';
import { PageInfoColumn } from './PageInfoColumn';

import { SUSSOL_ORANGE, DARK_GREY } from '../../globalStyles';

export const PageInfo = React.memo(({ columns, isEditingDisabled, titleColour, infoColour }) => (
  <FlexRow>
    {columns.map(columnData => (
      <PageInfoColumn
        isEditingDisabled={isEditingDisabled}
        titleColour={titleColour}
        infoColour={infoColour}
        columnData={columnData}
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
