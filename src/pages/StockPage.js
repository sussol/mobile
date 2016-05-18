/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

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

import DropDown from 'react-native-dropdown';
const {
  Option,
  OptionList,
  Select,
  UpdatePosition,
} = DropDown;

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
    const data = items.filtered(`${sortBy} CONTAINS[c] $0`, term).sorted(sortBy, reverseSort);
    this.setState({
      dataSource: dataSource.cloneWithRows(data),
    });
  }

  onColumnSort() {
    this.setState({
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
          width={columnWidths[0]}
          text={'ITEM CODE'}
        />
        <HeaderCell
          style={globalStyles.headerCell}
          textStyle={[globalStyles.text, styles.text]}
          width={columnWidths[1]}
          onPress={() => this.onColumnSort('name')}
          text={'ITEM NAME'}
        />
        <HeaderCell
          style={globalStyles.headerCell}
          textStyle={[globalStyles.text, styles.text]}
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
        <View style={{ flex: columnWidths[2] }} />
      </Expansion>
    );
  }

  renderRow(item) {
    return (
      <Row style={globalStyles.row} renderExpansion={() => this.renderExpansion(item)}>
        <Cell
          style={globalStyles.cell}
          textStyle={[globalStyles.text, styles.text]}
          width={columnWidths[0]}
        >
          {item.code}
        </Cell>
        <Cell
          style={globalStyles.cell}
          textStyle={[globalStyles.text, styles.text]}
          width={columnWidths[1]}
        >
          {item.name}
        </Cell>
        <Cell
          style={globalStyles.cell}
          textStyle={[globalStyles.text, styles.text]}
          width={columnWidths[2]}
        >
          {getItemQuantity(item)}
        </Cell>
      </Row>
    );
  }

  render() {
    return (
      <View style={globalStyles.container}>
        <View style={styles.horizontalContainer}>
          <TextInput
            style={[globalStyles.searchBar, { flex: 1 }]}
            onChange={(event) => this.onSearchChange(event)}
            placeholder="Search"
          />
          <Select
            style={{ flex: 0.5 }}
            defaultValue={'Category'}
          >
          </Select>
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
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 20,
    marginLeft: 20,
    textAlign: 'left',
  },
  dataTable: {
    flex: 1,
  },
});
