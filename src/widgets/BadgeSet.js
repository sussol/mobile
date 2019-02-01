import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableHighlight, Text } from 'react-native';
import { Badge } from 'react-native-elements';
import { SUSSOL_ORANGE } from '../globalStyles';
import Popover from 'react-native-popover-view';

export class BadgeSet extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      buttonRect: {},
    };
  }

  showPopover() {
    this.touchableContainer.measure((ox, oy, width, height, px, py) => {
      this.setState({
        isVisible: true,
        buttonRect: { x: px, y: py, width: width, height: height },
      });
    });
  }

  closePopover() {
    this.setState({ isVisible: false });
  }

  render() {
    const {
      MainElement,
      finalizeValue,
      mainWrapper,
      popPlacement,
    } = this.props;

    const finalizeTxt = (finalizeValue > 99) ? '99+' : finalizeValue;
    return (
      <View style={{ position: 'relative' }}>
      {MainElement}
      {(finalizeValue !== 0) && (
        <View style={[localStyles.mainWrapper, mainWrapper]}>
          <TouchableHighlight
            ref={(ref) => { this.touchableContainer = ref; }}
            style={localStyles.touchPlaceholder}
            onPress={() => this.showPopover()}
          >
            <Badge
              value={finalizeTxt}
              wrapperStyle={[localStyles.badgeWrapper, localStyles.finalize]}
              containerStyle={localStyles.finalizeContainer}
              textStyle={localStyles.badgeFont}
            />
          </TouchableHighlight>
          <Popover
            isVisible={this.state.isVisible}
            fromRect={this.state.buttonRect}
            onClose={() => this.closePopover()}
            popoverStyle={{ padding: 10, backgroundColor: SUSSOL_ORANGE }}
            arrowStyle={{ backgroundColor: SUSSOL_ORANGE }}
            showBackground={false}
            placement={popPlacement}
          >
            <Text style={{ color: '#FFF', fontSize: 10 }}>{finalizeTxt} Not Finalized</Text>
          </Popover>
        </View>
      )}
      </View>
    );
  }
}

BadgeSet.propTypes = {
  MainElement: PropTypes.element.isRequired,
  finalizeValue: PropTypes.number,
  popPlacement: PropTypes.string,
};

BadgeSet.defaultProps = {
  MainElement: {},
  finalizeValue: 0,
  mainWrapper: {},
  popPlacement: 'auto',
};

const localStyles = StyleSheet.create({
  mainWrapper: {
    position: 'absolute',
    top: 0,
    right: 8,
  },
  touchPlaceholder: {
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  badgeWrapper: {
    width: 45,
  },
  finalizeContainer: {
    backgroundColor: SUSSOL_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeFont: {
    fontSize: 10,
    color: '#FFF',
  },
  finalize: {
  },
});
