import React from 'react';
import PropTypes from 'prop-types';

import { FlexColumn } from '../FlexColumn';
import { PageInfoRow } from './PageInfoRow';

export const PageInfoColumn = ({ columnData, isEditingDisabled, titleColour, infoColour }) => (
  <FlexColumn flex={1}>
    {columnData.map(({ onPress, editableType, title, info }) => (
      <PageInfoRow
        key={title}
        isEditingDisabled={isEditingDisabled}
        titleColour={titleColour}
        infoColour={infoColour}
        onPress={onPress}
        editableType={editableType}
        info={info}
        title={title}
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
