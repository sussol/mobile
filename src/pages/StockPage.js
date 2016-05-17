/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  View,
  StyleSheet,
} from 'react-native';

import { DataTable } from '../widgets/DataTable';
const {
  Cell,
  Expansion,
  Header,
  HeaderCell,
  Row,
} = DataTable;

import { getItemQuantity } from '../utilities';
import { ListView } from 'realm/react-native';
import globalStyles from '../globalStyles';

export default class StockPage extends Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource,
      query: 'item_name=@',
      items: props.database.objects('Item'),
      sortBy: 'name',
      reverseSort: false,
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onColumnSort = this.onColumnSort.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.onEndDefaultPackSizeEdit = this.onEndDefaultPackSizeEdit.bind(this);
    this.renderExpansion = this.renderExpansion.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillMount() {
    const data = this.state.items.sorted(this.state.sortBy);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
      deleteTargetItem: this.state.items[0],
    });
  }

  onSearchChange(event) {
    const term = event.nativeEvent.text;
    const { items, sortBy, dataSource, reverseSort } = this.state;
    const data = items.filtered('name CONTAINS[c] $0', term).sorted(sortBy, reverseSort);
    this.setState({
      dataSource: dataSource.cloneWithRows(data),
    });
  }

  onColumnSort(sortBy) {
    this.setState({
      sortBy: sortBy,
      reverseSort: this.state.reverseSort !== true,
    });
    const data = this.state.items.sorted(this.state.sortBy, this.state.reverseSort);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
  }

  renderHeader() {
    return (
      <Header style={globalStyles.header}>
        <HeaderCell
          style={globalStyles.headerCell}
          textStyle={[globalStyles.text, styles.text]}
          onPress={() => this.onColumnSort('code')}
          width={1.3}
          text={'ITEM CODE'}
        />
        <HeaderCell
          style={globalStyles.headerCell}
          textStyle={[globalStyles.text, styles.text]}
          width={7.2}
          onPress={() => this.onColumnSort('name')}
          text={'ITEM NAME'}
        />
        <HeaderCell
          style={globalStyles.headerCell}
          textStyle={[globalStyles.text, styles.text]}
          width={1.6}
          text={'STOCK ON HAND'}
        />
      </Header>
    );
  }

  renderExpansion(item) {
    return (
      <Expansion>
        <View style={{ flex: 1.3 }} />
        <View style={{ flex: 7.2 }}>
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around' }}>
            <Text style={[globalStyles.text, styles.text]}>Category: {item.category.name}</Text>
            <Text style={[globalStyles.text, styles.text]}>Department: {item.department.name}</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around' }}>
            <Text style={[globalStyles.text, styles.text]}>
              Number of batches: {item.lines.length}
            </Text>
            <Text style={[globalStyles.text, styles.text]}>
              Nearest expiry: value
            </Text>
          </View>
        </View>
        <View style={{ flex: 1.6 }} />
      </Expansion>
    );
  }

  renderRow(item) {
    return (
      <Row style={globalStyles.row} renderExpansion={() => this.renderExpansion(item)}>
        <Cell
          style={globalStyles.cell}
          textStyle={[globalStyles.text, styles.text]}
          width={1.3}
        >
          {item.code}
        </Cell>
        <Cell
          style={globalStyles.cell}
          textStyle={[globalStyles.text, styles.text]}
          width={7.2}
        >
          {item.name}
        </Cell>
        <Cell
          style={globalStyles.cell}
          textStyle={[globalStyles.text, styles.text]}
          width={1.6}
        >
          {getItemQuantity(item)}
        </Cell>
      </Row>
    );
  }

  render() {
    return (
      <View style={globalStyles.container}>
        <DataTable
          style={globalStyles.container}
          listViewStyle={globalStyles.container}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
          searchBar={this.onSearchChange}
          searchBarStyle={globalStyles.searchBar}
        />
      </View>
    );
  }
}

StockPage.propTypes = {
  database: React.PropTypes.object,
  style: View.propTypes.style,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modal: {
    backgroundColor: 'red', // for hurting your eyes
  },
  button: {
    backgroundColor: 'rgba(130, 171, 189, 0.7)',
  },
  text: {
    fontSize: 20,
    marginLeft: 20,
    textAlign: 'left',
  },
  packSize: {
    fontSize: 20,
    height: 45,
    textAlign: 'right',
    marginRight: 20,
  },
  DataTable: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
});
