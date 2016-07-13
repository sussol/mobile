/* @flow weak */

/**
 * mSupply Mobile
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
    this.onRowPress = this.onRowPress.bind(this);
  }

  onRowPress() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const { style, children, renderExpansion, onPress, ...touchableOpacityProps } = this.props;
    if (renderExpansion) {
      return (
        <TouchableOpacity
          {...touchableOpacityProps}
          style={[defaultStyles.row, style]}
          onPress={this.onRowPress}
        >
          <View style={defaultStyles.cellContainer}>
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
          <View style={defaultStyles.cellContainer}>
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
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#d6f3ff',
  },
  cellContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  expansionContainer: {
    flex: 1,
  },
});
