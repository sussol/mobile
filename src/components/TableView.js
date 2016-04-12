/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { ListView } from 'realm/react-native';

export class Row extends Component {
  static defaultProps = {
    expandable: false
  }
  static propTypes = {
    expandable: React.PropTypes.bool,
  }
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    }
    this.render = this.render.bind(this)
    this.expandRow = this.expandRow.bind(this)
  }

  expandRow() {
    this.setState({
      expanded: this.state.expanded === true ? false : true,
    });
    console.log("is Expanded: " + this.state.expanded);
  }

  render() {
    return (
      <TouchableOpacity
        style={[styles.row, this.state.expanded && styles.expanded]}
        onPress={this.props.expandable && this.expandRow}>
        {this.props.children}
      </TouchableOpacity>
    )
  }
}

export class Cell extends Component {
  render() {
    return (
      <View style={[styles.cell, {flex: this.props.width}]}>
        <Text style={this.props.style}>
          {this.props.children}
        </Text>
      </View>
    )
  }
}

export class CellView extends Component {
  render() {
    return (
      <View style={styles.cellView}>
        {this.props.children}
      </View>
    )
  }
}

export class EditableCell extends Component {
  render() {
    return (
      <View style={[styles.editableCell, {flex: this.props.width}]}>
        <TextInput
          style={this.props.style}
          placeholder={String(this.props.children)}
        />
      </View>
    )
  }
}

export class Expansion extends Component {
  render() {
    return (
      <View style={styles.expansion}>
        {this.props.children}
      </View>
    )
  }
}

export class ExpansionView extends Component {
  render() {
    return (
      <View style={styles.expansionView}>
        {this.props.children}
      </View>
    )
  }
}

export class TableButton extends Component {
  render() {
    return (
      <TouchableOpacity style={styles.tableButton} onPress={this.props.onPress}>
        {this.props.children}
      </TouchableOpacity>
    )
  }
}

export class Header extends Component {

}

export class HeaderCell extends Component {

}

export default class TableView extends Component {

  render() {
    return(
      <View style={styles.verticalContainer}>
        <ListView
          style={styles.listview}
          dataSource={this.props.dataSource}
          renderRow={this.props.renderRow}
          showsVerticalScrollIndicator={true}
          scrollRenderAheadDistance={5000}
        />
      </View>
    );
  };
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#d6f3ff',
  },
  cell:{
    flex: 1,
  },
  cellView:{
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  editableCell: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: 'blue',
  },
  expansion: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'magenta',
  },
  expansionView: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'lightblue',
  },
  tableButton: {
    flex: 1,
  },
  verticalContainer: {
    flex: 1,
  },
  listview: {
    backgroundColor: '#74c3e6',
  }
});
