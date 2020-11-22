import React from 'react';
import PropTypes from 'prop-types';

import { FlexColumn } from '../FlexColumn';
import { PageInfoRow } from './PageInfoRow';

export const PageInfoColumn = ({
  columnData,
  isEditingDisabled,
  titleColor,
  infoColor,
  numberOfLines,
  titleTextAlign,
}) => (
  <FlexColumn flex={1}>
    {columnData.map(({ onPress, editableType, title, info }) => (
      <PageInfoRow
        titleTextAlign={titleTextAlign}
        numberOfLines={numberOfLines}
        key={title}
        isEditingDisabled={isEditingDisabled}
        titleColor={titleColor}
        infoColor={infoColor}
        onPress={onPress}
        editableType={editableType}
        info={info}
        title={title}
      />
    ))}
  </FlexColumn>
);

PageInfoColumn.defaultProps = {
  isEditingDisabled: false,
  numberOfLines: 1,
  titleTextAlign: 'left',
};

PageInfoColumn.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  columnData: PropTypes.array.isRequired,
  isEditingDisabled: PropTypes.bool,
  titleColor: PropTypes.string.isRequired,
  infoColor: PropTypes.string.isRequired,
  numberOfLines: PropTypes.number,
  titleTextAlign: PropTypes.string,
};
