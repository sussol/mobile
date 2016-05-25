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
} from 'react-native';

import {
  Cell,
  DataTable,
  Expansion,
  Header,
  HeaderCell,
  Row,
} from '../widgets/DataTable';

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
      dataSource: dataSource,
      items: props.database.objects('Item'),
      searchTerm: '',
      sortBy: 'name',
      reverseSort: false,
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onColumnSort = this.onColumnSort.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderExpansion = this.renderExpansion.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillMount() {
    const data = this.state.items.sorted(this.state.sortBy);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
  }


  onSearchChange(event) {
    const term = event.nativeEvent.text;
    this.setState({
      searchTerm: term,
    });
    const { items, sortBy, dataSource, reverseSort, searchTerm } = this.state;
    const data = items.filtered(`${sortBy} CONTAINS[c] "${searchTerm}"`).sorted(sortBy, reverseSort);
    this.setState({
      dataSource: dataSource.cloneWithRows(data),
    });
  }

  onColumnSort(newSortBy) {
    this.setState({
      sortBy: newSortBy,
      reverseSort: this.state.reverseSort !== true,
    });
    const { items, sortBy, dataSource, reverseSort, searchTerm } = this.state;
    const data = items.filtered(`${sortBy} CONTAINS[c] "${searchTerm}"`).sorted(sortBy, reverseSort);
    this.setState({
      dataSource: dataSource.cloneWithRows(data),
    });
  }

  renderHeader() {
    return (
      <Header style={globalStyles.dataTableHeader}>
        <HeaderCell
          style={[globalStyles.dataTableCell, globalStyles.dataTableHeaderCell]}
          textStyle={[globalStyles.text, localStyles.text]}
          onPress={() => this.onColumnSort('code')}
          width={columnWidths[0]}
          text={'ITEM CODE'}
        />
        <HeaderCell
          style={[globalStyles.dataTableCell, globalStyles.dataTableHeaderCell]}
          textStyle={[globalStyles.text, localStyles.text]}
          width={columnWidths[1]}
          onPress={() => this.onColumnSort('name')}
          text={'ITEM NAME'}
        />
        <HeaderCell
          style={[globalStyles.dataTableHeaderCell]}
          textStyle={[globalStyles.text, localStyles.text]}
          width={columnWidths[2]}
          text={'STOCK ON HAND'}
        />
      </Header>
    );
  }

  renderExpansion(item) {
    return (
      <Expansion>
        <View style={{ flex: columnWidths[0] }} />
        <View style={{ flex: columnWidths[1], flexDirection: 'row' }}>
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around' }}>
            <Text style={[globalStyles.text, localStyles.text]}>
              Category: {item.category.name}
            </Text>
            <Text style={[globalStyles.text, localStyles.text]}>
              Department: {item.department.name}
            </Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around' }}>
            <Text style={[globalStyles.text, localStyles.text]}>
              Number of batches: {item.lines.length}
            </Text>
            <Text style={[globalStyles.text, localStyles.text]}>
              Nearest expiry: value
            </Text>
          </View>
        </View>
        <View style={{ flex: columnWidths[2] }} />
      </Expansion>
    );
  }

  renderRow(item) {
    return (
      <Row style={globalStyles.dataTableRow} renderExpansion={() => this.renderExpansion(item)}>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={[globalStyles.text, localStyles.text]}
          width={columnWidths[0]}
        >
          {item.code}
        </Cell>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={[globalStyles.text, localStyles.text]}
          width={columnWidths[1]}
        >
          {item.name}
        </Cell>
        <Cell
          style={[globalStyles.dataTableCell, localStyles.cellLast]}
          textStyle={[globalStyles.text, localStyles.text]}
          width={columnWidths[2]}
        >
          {getItemQuantity(item)}
        </Cell>
      </Row>
    );
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={localStyles.horizontalContainer}>
          <TextInput
            style={globalStyles.searchBar}
            onChange={(event) => this.onSearchChange(event)}
            placeholder="Search"
          />
        </View>
        <DataTable
          style={globalStyles.dataTable}
          listViewStyle={globalStyles.container}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
        />
      </View>
    );
  }
}

StockPage.propTypes = {
  database: React.PropTypes.object,
  style: View.propTypes.style,
};
const columnWidths = [1.3, 7.2, 1.6];
const localStyles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 20,
    marginLeft: 20,
    textAlign: 'left',
  },
  cellLast: {
    borderRightWidth: 0,
  },
  dataTable: {
    flex: 1,
  },
});
