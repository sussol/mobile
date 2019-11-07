/* eslint-disable react/forbid-prop-types */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View, TouchableHighlight, Text } from 'react-native';
import Popover from 'react-native-popover-view';

import { getBadgeData } from '../utilities/getBadgeData';
import { usePopover } from '../hooks';

import Badge from './Badge';

import { SUSSOL_ORANGE } from '../globalStyles';

const animationConfig = { duration: 150 };

export const InfoBadge = ({
  popoverBackgroundStyle,
  children,
  mainWrapperStyle,
  popoverPosition,
  routeName,
  arrowStyle,
  popoverStyle,
  badgeTextStyle,
  touchableContainerStyle,
}) => {
  const [ref, visible, show, close] = usePopover();

  // Get total of all the count variables in the info array. We want to show it on the badge
  const info = getBadgeData(routeName);
  const pendingCount = info.reduce((total, item) => total + (item.count || 0), 0);

  // show 99+ if the number is greater then 99 to limit the number of characters.
  const unfinalisedCountText = pendingCount > 99 ? '99+' : pendingCount;

  const popoverText = useCallback(
    (item, key) =>
      (item.count > 0 || item.text) && (
        <Text style={badgeTextStyle} key={key}>
          {`${item.title}: ${item.count || item.text}`}
        </Text>
      ),
    []
  );

  return (
    <View>
      {children}
      {pendingCount !== 0 && (
        <View style={mainWrapperStyle}>
          <TouchableHighlight ref={ref} style={touchableContainerStyle} onPress={show}>
            <Badge value={unfinalisedCountText} />
          </TouchableHighlight>
          <Popover
            isVisible={visible}
            fromView={ref.current}
            onRequestClose={close}
            popoverStyle={popoverStyle}
            arrowStyle={arrowStyle}
            backgroundStyle={popoverBackgroundStyle}
            placement={popoverPosition}
            animationConfig={animationConfig}
          >
            <View>{info.map(popoverText)}</View>
          </Popover>
        </View>
      )}
    </View>
  );
};

export default InfoBadge;

InfoBadge.propTypes = {
  routeName: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  mainWrapperStyle: PropTypes.object,
  popoverPosition: PropTypes.string,
  popoverBackgroundStyle: PropTypes.object,
  arrowStyle: PropTypes.object,
  popoverStyle: PropTypes.object,
  badgeTextStyle: PropTypes.object,
  touchableContainerStyle: PropTypes.object,
};

InfoBadge.defaultProps = {
  arrowStyle: { backgroundColor: SUSSOL_ORANGE },
  popoverStyle: { padding: 10, backgroundColor: SUSSOL_ORANGE },
  badgeTextStyle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  mainWrapperStyle: {
    position: 'absolute',
    top: 0,
    right: 8,
  },
  touchableContainerStyle: {
    borderRadius: 15,
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  popoverPosition: 'auto',
  popoverBackgroundStyle: { backgroundColor: 'transparent' },
};
