import React from 'react';
import PropTypes from 'prop-types';

import { FlexRow } from '../FlexRow';
import { PageInfoTitle } from './PageInfoTitle';
import { PageInfoDetail } from './PageInfoDetail';

export const PageInfoRow = ({
  isEditingDisabled,
  titleColor,
  infoColor,
  onPress,
  editableType,
  title,
  info,
  numberOfLines,
  titleTextAlign,
}) => (
  <FlexRow style={{ marginTop: 5 }}>
    <PageInfoTitle
      numberOfLines={numberOfLines}
      isEditingDisabled={isEditingDisabled}
      color={titleColor}
      onPress={onPress}
      title={title}
      textAlign={titleTextAlign}
    />
    <PageInfoDetail
      numberOfLines={numberOfLines}
      isEditingDisabled={isEditingDisabled}
      color={infoColor}
      onPress={onPress}
      info={info}
      type={editableType}
    />
  </FlexRow>
);

PageInfoRow.defaultProps = {
  info: '',
  editableType: '',
  onPress: null,
  isEditingDisabled: false,
  numberOfLines: 1,
  titleTextAlign: 'left',
};

PageInfoRow.propTypes = {
  isEditingDisabled: PropTypes.bool,
  titleColor: PropTypes.string.isRequired,
  infoColor: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  editableType: PropTypes.string,
  title: PropTypes.string.isRequired,
  info: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  numberOfLines: PropTypes.number,
  titleTextAlign: PropTypes.string,
};
