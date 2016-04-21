/* @flow weak */

/**
 * OfflineMobile Row component
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

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
    return (
      <TouchableOpacity
        style={[styles.row, this.props.style]}
        onPress={typeof this.props.renderExpansion === 'function' && this.expandRow}
      >
        {this.props.children}
        {this.state.expanded && this.props.renderExpansion()}
      </TouchableOpacity>
    );
  }
}
Row.propTypes = {
  renderExpansion: React.PropTypes.func,
  children: React.PropTypes.any,
  style: React.PropTypes.object,
};
