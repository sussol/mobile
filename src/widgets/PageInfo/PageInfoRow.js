import React from 'react';
import PropTypes from 'prop-types';

import { FlexRow } from '../FlexRow';
import { PageInfoTitle } from './PageInfoTitle';
import { PageInfoDetail } from './PageInfoDetail';

export const PageInfoRow = ({ isDisabled, titleColour, infoColour, row }) => {
  const { onPress, editableType, title, info } = row;
  return (
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
};

PageInfoRow.propTypes = {
  isDisabled: PropTypes.bool.isRequired,
  titleColour: PropTypes.string.isRequired,
  infoColour: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  row: PropTypes.object.isRequired,
};
