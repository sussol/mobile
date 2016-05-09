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

export default class Row extends Component {
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
        style={[styles.row, style]}
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
  style: React.PropTypes.number,
  children: React.PropTypes.any,
  renderExpansion: React.PropTypes.func,
};

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#d6f3ff',
  },
});
