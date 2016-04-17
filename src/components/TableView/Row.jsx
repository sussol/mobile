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
    // console.log(`Is Expanded: ${this.state.expanded}`);
  }

  render() {
    return (
      <TouchableOpacity
        style={[styles.row, this.state.expanded && styles.expanded]}
        onPress={typeof this.props.expansion === 'function' && this.expandRow}
      >
        {this.props.children}
        {this.state.expanded && this.props.expansion()}
      </TouchableOpacity>
    );
  }
}
Row.propTypes = {
  expansion: React.PropTypes.func,
  children: React.PropTypes.any,
};
