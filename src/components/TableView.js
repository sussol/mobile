
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

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#d6f3ff',
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
  },
  rowView: {
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
    flex: 0.5,
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
    flex: 0.08,
  },
  header: {
    flex: 0.08,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    backgroundColor: 'grey',
  },
  headerCell: {
    flex: 1,
  },
});

export class Row extends Component {
  // static PropTypes = {
  //   expansion: React.PropTypes.func,
  //   children: React.PropTypes.any,
  // }
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

export function Cell(props) {
  return (
    <View style={[styles.cell, { flex: props.width }]}>
      <Text style={props.style}>
        {props.children}
      </Text>
    </View>
  );
}
Cell.propTypes = {
  style: React.PropTypes.number,
  width: React.PropTypes.number,
  children: React.PropTypes.any,
};

export function RowView(props) {
  return (
    <View style={styles.rowView}>
      {props.children}
    </View>
  );
}
RowView.propTypes = {
  children: React.PropTypes.any,
};

export class EditableCell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'N/A',
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentWillMount() {
    this.setState({
      value: String(this.props.value),
    });
  }

  onEndEditing() {
    this.props.onEndEditing(this.props.target, this.state.value);
  }

  render() {
    return (
      <View style={[styles.editableCell, { flex: this.props.width }]}>
        <TextInput
          style={this.props.style}
          keyboardType={this.props.keyboardType}
          onChange = {(event) => this.setState({ value: event.nativeEvent.text })}
          onEndEditing={() => this.onEndEditing()}
          value={this.state.value}
        />
      </View>
    );
  }
}
EditableCell.propTypes = {
  style: React.PropTypes.number,
  width: React.PropTypes.number,
  keyboardType: React.PropTypes.string,
  onEndEditing: React.PropTypes.func,
  target: React.PropTypes.object,
  value: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
};

export function Expansion(props) {
  return (
    <View style={styles.expansion}>
      {props.children}
    </View>
  );
}
Expansion.propTypes = {
  children: React.PropTypes.any,
};

export function ExpansionView(props) {
  return (
    <View style={styles.expansionView}>
      {props.children}
    </View>
  );
}
ExpansionView.propTypes = {
  children: React.PropTypes.any,
};

export function TableButton(props) {
  return (
    <TouchableOpacity style={styles.tableButton} onPress={props.onPress}>
      {props.children}
    </TouchableOpacity>
  );
}
TableButton.propTypes = {
  children: React.PropTypes.any,
  onPress: React.PropTypes.func,
};

export function Header(props) {
  return (
    <View style={styles.header}>
      {props.children}
    </View>
  );
}
Header.propTypes = {
  children: React.PropTypes.any,
};


export function HeaderCell(props) {
  if (typeof this.props.onPress === 'function') {
    return (
      <TouchableOpacity
        style={[styles.headerCell, { flex: props.width }]}
        onPress={this.props.onPress}
      >
        <Text style={this.props.style}>
          {this.props.children}
        </Text>
      </TouchableOpacity>
    );
  }
  return (
    <View style={[styles.headerCell, { flex: this.props.width }]}>
      <Text style={this.props.style}>
        {this.props.children}
      </Text>
    </View>
  );
}
HeaderCell.propTypes = {
  style: React.PropTypes.number,
  width: React.PropTypes.number,
  onPress: React.PropTypes.func,
  children: React.PropTypes.any,
};


export default function TableView(props) {
  return (
    <View style={styles.verticalContainer}>
      {
        (typeof props.searchBar === 'function') &&
          <TextInput
            style={styles.searchBar}
            onChange={(event) => props.searchBar(event)}
            placeholder="Search"
          />
      }
      {props.header()}
      <ListView
        style={styles.listview}
        dataSource={props.dataSource}
        renderRow={props.renderRow}
        showsVerticalScrollIndicator
        scrollRenderAheadDistance={5000}
      />
    </View>
  );
}
TableView.propTypes = {
  searchBar: React.PropTypes.func,
  header: React.PropTypes.func,
  dataSource: React.PropTypes.object,
  renderRow: React.PropTypes.func,
};
