import React from 'react';
import PropTypes from 'prop-types';

import { FlexColumn } from '../FlexColumn';
import { PageInfoRow } from './PageInfoRow';

export const PageInfoColumn = ({ columnData, isEditingDisabled, titleColour, infoColour }) => (
  <FlexColumn flex={1}>
    {columnData.map(row => (
      <PageInfoRow
        isEditingDisabled={isEditingDisabled}
        titleColour={titleColour}
        infoColour={infoColour}
        row={row}
      />
    ))}
  </FlexColumn>
);

PageInfoColumn.defaultProps = { isEditingDisabled: false };

PageInfoColumn.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  columnData: PropTypes.array.isRequired,
  isEditingDisabled: PropTypes.bool,
  titleColour: PropTypes.string.isRequired,
  infoColour: PropTypes.string.isRequired,
};
