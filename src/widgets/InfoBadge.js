import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableHighlight, Text } from 'react-native';
import Popover from 'react-native-popover-view';
import Badge from './Badge';
import { getBadgeData } from '../utilities/getBadgeData';
import { SUSSOL_ORANGE } from '../globalStyles';

export class InfoBadge extends React.PureComponent {
  state = {
    isPopOverVisible: false,
    rect: {},
  };

  showPopover() {
    // Open popover and determine where to open it on canvas
    this.touchableContainer.measure((ox, oy, width, height, px, py) => {
      this.setState({
        isPopOverVisible: true,
        rect: { x: px, y: py, width, height },
      });
    });
  }

  closePopover() {
    this.setState({ isPopOverVisible: false });
  }

  render() {
    const { children, mainWrapperStyle, popoverPosition, routeName } = this.props;
    const { isPopOverVisible, rect } = this.state;
    const info = getBadgeData(routeName);

    // Get total of all the count variables in the info array. We want to show it on the badge
    const pendingCount = info.reduce((total, item) => total + (item.count || 0), 0);

    // Since having multiple digit text can break the badge, we are showing 99+
    // if the number is greater then 99.
    const unfinalisedCountText = pendingCount > 99 ? '99+' : pendingCount;

    return (
      <View style={{ position: 'relative' }}>
        {children}
        {pendingCount !== 0 && (
          <View style={[localStyles.mainWrapperStyle, mainWrapperStyle]}>
            <TouchableHighlight
              ref={ref => {
                this.touchableContainer = ref;
              }}
              style={localStyles.touchableContainerStyle}
              onPress={() => this.showPopover()}
            >
              <Badge
                value={unfinalisedCountText}
                badgeStyle={localStyles.badgeStyle}
                textStyle={localStyles.badgeFontStyle}
              />
            </TouchableHighlight>
            <Popover
              isVisible={isPopOverVisible}
              fromRect={rect}
              onRequestClose={() => this.closePopover()}
              popoverStyle={{ padding: 10, backgroundColor: SUSSOL_ORANGE }}
              arrowStyle={{ backgroundColor: SUSSOL_ORANGE }}
              backgroundStyle={{ backgroundColor: 'transparent' }}
              placement={popoverPosition}
            >
              <Text style={localStyles.badgeTextStyle}>
                {info.map(
                  (item, key) =>
                    (item.count > 0 || item.text) && (
                      // eslint-disable-next-line react/no-array-index-key
                      <Text key={key}>
                        {item.title} : {item.count || item.text}
                        {key === info.length - 1 ? '' : '\n'}
                      </Text>
                    )
                )}
              </Text>
            </Popover>
          </View>
        )}
      </View>
    );
  }
}

export default InfoBadge;

InfoBadge.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  routeName: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  mainWrapperStyle: PropTypes.object,
  popoverPosition: PropTypes.string,
};

InfoBadge.defaultProps = {
  mainWrapperStyle: {},
  popoverPosition: 'auto',
};

const localStyles = StyleSheet.create({
  mainWrapperStyle: {
    position: 'absolute',
    top: 0,
    right: 8,
  },
  touchableContainerStyle: {
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  badgeStyle: {
    width: 45,
    backgroundColor: SUSSOL_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeFontStyle: {
    fontSize: 10,
    color: '#FFF',
  },
  badgeTextStyle: {
    color: '#FFF',
    fontSize: 12,
  },
});
