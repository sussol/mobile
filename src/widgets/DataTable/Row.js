/* @flow weak */

/**
 * OfflineMobile Row component
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export class Row extends Component {
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
    const { style, children, renderExpansion, ...touchableOpacityProps } = this.props;
    return (
      <TouchableOpacity
        {...touchableOpacityProps}
        style={[defaultStyles.row, style]}
        onPress={typeof renderExpansion === 'function' && this.expandRow}
      >
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {children}
        </View>
        {this.state.expanded && renderExpansion()}
      </TouchableOpacity>
    );
  }
}

Row.propTypes = {
  style: React.View.propTypes.style,
  children: React.PropTypes.any,
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
