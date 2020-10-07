import React from 'react';
import PropTypes from 'prop-types';

import { FlexRow } from '../FlexRow';
import { PageInfoTitle } from './PageInfoTitle';
import { PageInfoDetail } from './PageInfoDetail';

export const PageInfoRow = ({
  isDisabled,
  titleColor,
  infoColor,
  onPress,
  editableType,
  title,
  info,
}) => (
  <FlexRow style={{ marginTop: 5 }}>
    <PageInfoTitle isDisabled={isDisabled} color={titleColor} onPress={onPress} title={title} />
    <PageInfoDetail
      isDisabled={isDisabled}
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
  isDisabled: false,
};

PageInfoRow.propTypes = {
  isDisabled: PropTypes.bool,
  titleColor: PropTypes.string.isRequired,
  infoColor: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  editableType: PropTypes.string,
  title: PropTypes.string.isRequired,
  info: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
