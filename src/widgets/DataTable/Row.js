/* @flow weak */

/**
 * mSupply MobileRow component
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export class Row extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
    this.expandRow = this.expandRow.bind(this);
  }

  expandRow() {
    this.setState({
      expanded: this.state.expanded !== true,
    });
  }

  render() {
    const { style, children, renderExpansion, onPress, ...touchableOpacityProps } = this.props;
    if (renderExpansion) {
      return (
        <TouchableOpacity
          {...touchableOpacityProps}
          style={[defaultStyles.row, style]}
          onPress={this.expandRow}
        >
          <View style={{ flex: 1, flexDirection: 'row' }}>
            {children}
          </View>
          {this.state.expanded && renderExpansion()}
        </TouchableOpacity>
      );
    }
    if (onPress) {
      return (
        <TouchableOpacity
          {...touchableOpacityProps}
          style={[defaultStyles.row, style]}
          onPress={onPress}
        >
          <View style={{ flex: 1, flexDirection: 'row' }}>
            {children}
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <View style={[defaultStyles.row, { flexDirection: 'row' }, style]}>
        {children}
      </View>
    );
  }
}

Row.propTypes = {
  style: View.propTypes.style,
  children: React.PropTypes.any,
  onPress: React.PropTypes.func,
  renderExpansion: React.PropTypes.func,
};

const defaultStyles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#d6f3ff',
  },
});
