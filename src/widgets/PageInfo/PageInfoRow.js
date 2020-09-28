import React from 'react';
import PropTypes from 'prop-types';

import { FlexRow } from '../FlexRow';
import { PageInfoTitle } from './PageInfoTitle';
import { PageInfoDetail } from './PageInfoDetail';

export const PageInfoRow = ({
  isDisabled,
  titleColour,
  infoColour,
  onPress,
  editableType,
  title,
  info,
}) => (
  <FlexRow style={{ marginTop: 5 }}>
    <PageInfoTitle isDisabled={isDisabled} colour={titleColour} onPress={onPress} title={title} />
    <PageInfoDetail
      isDisabled={isDisabled}
      colour={infoColour}
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
  titleColour: PropTypes.string.isRequired,
  infoColour: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  editableType: PropTypes.string,
  title: PropTypes.string.isRequired,
  info: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
