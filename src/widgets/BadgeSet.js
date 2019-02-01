import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableHighlight, Text } from 'react-native';
import { Badge } from 'react-native-elements';
import { SUSSOL_ORANGE } from '../globalStyles';
import Popover from 'react-native-popover-view';

export class BadgeSet extends React.PureComponent {
  state = {
    isPopOverVisible: false,
    rect: {},
  };

  showPopover() {
    this.touchableContainer.measure((ox, oy, width, height, px, py) => {
      this.setState({
        isPopOverVisible: true,
        rect: { x: px, y: py, width: width, height: height },
      });
    });
  }

  closePopover() {
    this.setState({ isPopOverVisible: false });
  }

  render() {
    const {
      MainElement,
      unfinalisedCount,
      mainWrapperStyle,
      popoverPosition,
    } = this.props;

    const unfinalisedCountText = (unfinalisedCount > 99) ? '99+' : unfinalisedCount;
    return (
      <View style={{ position: 'relative' }}>
      {MainElement}
      {(unfinalisedCount !== 0) && (
        <View style={[localStyles.mainWrapperStyle, mainWrapperStyle]}>
          <TouchableHighlight
            ref={(ref) => { this.touchableContainer = ref; }}
            style={localStyles.touchableContainerStyle}
            onPress={() => this.showPopover()}
          >
            <Badge
              value={unfinalisedCountText}
              wrapperStyle={localStyles.badgeWrapperStyle}
              containerStyle={localStyles.unfinalisedContainerStyle}
              textStyle={localStyles.badgeFontStyle}
            />
          </TouchableHighlight>
          <Popover
            isVisible={this.state.isPopOverVisible}
            fromRect={this.state.rect}
            onClose={() => this.closePopover()}
            popoverStyle={{ padding: 10, backgroundColor: SUSSOL_ORANGE }}
            arrowStyle={{ backgroundColor: SUSSOL_ORANGE }}
            showBackground={false}
            placement={popoverPosition}
          >
            <Text style={{ color: '#FFF', fontSize: 10 }}>
              {unfinalisedCountText} Not Finalised</Text>
          </Popover>
        </View>
      )}
      </View>
    );
  }
}

BadgeSet.propTypes = {
  MainElement: PropTypes.element.isRequired,
  unfinalisedCount: PropTypes.number,
  popoverPosition: PropTypes.string,
};

BadgeSet.defaultProps = {
  MainElement: {},
  unfinalisedCount: 0,
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
  badgeWrapperStyle: {
    width: 45,
  },
  unfinalisedContainerStyle: {
    backgroundColor: SUSSOL_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeFontStyle: {
    fontSize: 10,
    color: '#FFF',
  },
});
