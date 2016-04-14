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
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    }
    this.expandRow = this.expandRow.bind(this)
  }

  expandRow() {
    this.setState({
      expanded: this.state.expanded ? false : true,
    });
    console.log("is Expanded: " + this.state.expanded);
  }

  render() {
    return (
      <TouchableOpacity
        style={[styles.row, this.state.expanded && styles.expanded]}
        onPress={typeof this.props.expansion === 'function' && this.expandRow}>
        {this.props.children}
        {this.state.expanded && this.props.expansion()}
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

export class RowView extends Component {
  render() {
    return (
      <View style={styles.rowView}>
        {this.props.children}
      </View>
    )
  }
}

export class EditableCell extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: "N/A"
    }
    this.componentDidMount = this.componentDidMount.bind(this)
  }

  componentDidMount() {
    this.setState({
      value: String(this.props.value)
    });
  }

  onEndEditing() {
    this.props.onEndEditing(this.props.target, this.state.value)
  }

  render() {
    return (
      <View style={[styles.editableCell, {flex: this.props.width}]}>
        <TextInput
          style={this.props.style}
          keyboardType={this.props.keyboardType}
          onChange = {(event) => this.setState({value: event.nativeEvent.text})}
          onEndEditing={() => this.onEndEditing()}
          value={this.state.value}
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
  render() {
    return (
      <View style={styles.header}>
        {this.props.children}
      </View>
    );
  }
}

export class HeaderCell extends Component {
  render() {
    if (typeof this.props.onPress === 'function') {
      return (
        <TouchableOpacity style={[styles.headerCell, {flex: this.props.width}]}
          onPress={this.props.onPress}
        >
          <Text style={this.props.style}>
            {this.props.children}
          </Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={[styles.headerCell, {flex: this.props.width}]}>
          <Text style={this.props.style}>
            {this.props.children}
          </Text>
        </View>
      );
    }
  }
}

export default class TableView extends Component {

  render() {
    return(
      <View style={styles.verticalContainer}>
        {
          (typeof this.props.searchBar === 'function') &&
            <TextInput
              style={styles.searchBar}
              onChange={(event) => this.props.searchBar(event)}
              placeholder='Search'
            />
        }
        {this.props.header()}
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
    alignItems: 'stretch',
    backgroundColor: '#d6f3ff',
  },
  cell:{
    flex: 1,
    justifyContent: 'center',
  },
  rowView:{
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  editableCell: {
    flex: 1,
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
    justifyContent: 'space-around',
    backgroundColor: 'purple',
  },
  tableButton: {
    flex: .5,
//    alignSelf: 'flex-end',
    backgroundColor: 'green',
  },
  verticalContainer: {
    flex: 1,
  },
  listview: {
    flex: 1,
    backgroundColor: '#74c3e6',
  },
  searchBar: {
    fontSize: 20,
    marginLeft: 20,
    textAlign: 'left',
    flex: 0.08
  },
  header: {
    flex: 0.08,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    backgroundColor: 'grey',
  },
  headerCell: {
    flex: 1,
  }
});
