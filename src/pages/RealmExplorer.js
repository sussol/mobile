/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { PageButton } from '../widgets';
import {
  View,
  Alert,
} from 'react-native';
import Realm from 'realm';
import { SearchBar } from 'react-native-ui-components';
import {
  Cell,
  DataTable,
  Header,
  HeaderCell,
  Row,
} from 'react-native-data-table';
import FileSystem from 'react-native-filesystem';
import { ListView } from 'realm/react-native';

import globalStyles from '../globalStyles';

const OBJECT_TYPES = [
  'Address',
  'Item',
  'ItemBatch',
  'ItemDepartment',
  'ItemCategory',
  'ItemStoreJoin',
  'Transaction',
  'TransactionItem',
  'TransactionBatch',
  'TransactionCategory',
  'MasterList',
  'MasterListItem',
  'MasterListNameJoin',
  'Name',
  'NameStoreJoin',
  'NumberSequence',
  'NumberToReuse',
  'Requisition',
  'RequisitionItem',
  'Setting',
  'SyncOut',
  'Stocktake',
  'StocktakeItem',
  'StocktakeBatch',
  'User',
];

/**
* A page to explore the contents of the local database. Allows searching for any
* database object type, and will show the related data in a table.
* @prop   {Realm}               database      App wide database.
* @state  {ListView.DataSource} dataSource    DataTable input, used to update rows being rendered.
* @state  {Realm.Results}       data          Holds the data that get put into the dataSource
*/
export class RealmExplorer extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      data: null,
      dataSource: dataSource,
    };
    this.unfilteredData = null;
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.EmailData = this.EmailData.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillMount() {
    const data = this.props.database.objects('User');
    this.setState({
      data: data,
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
  }

  onFilterChange(filterString) {
    if (!this.unfilteredData) return;
    let data = null;
    if (filterString === '') { // if filter is emptied, clear filter
      data = this.unfilteredData;
    } else {
      try {
          // using this.unfilteredData, so we don't stack filters
        data = this.unfilteredData.filtered(filterString);
      } catch (err) {
        // ignore error silently
      }
    }

    if (data) {
      this.setState({
        data,
        dataSource: this.state.dataSource.cloneWithRows(data),
      });
    }
  }


  onSearchChange(searchTerm) {
    if (OBJECT_TYPES.indexOf(searchTerm) < 0) return;
    const data = this.props.database.objects(searchTerm);
    this.unfilteredData = data;
    this.setState({
      data: data,
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
  }

  EmailData() {

    const TransactionListAll = this.props.database.objects('Transaction');
    console.log('Ujwal log');
  //  console.log('TransactionAllt', Object.key(TransactionAll));
  //  const myJSON = JSON.stringify(TransactionAll);
    //console.log('Json data', myJSON);

/**    for (let i = 0; i < oldObjects.length; i++) {
           newObjects[i].name = oldObjects[i].firstName + ' ' + oldObjects[i].lastName;
         }
*/

    let DataforTextFile = '';
     for(let i = 0; i < TransactionListAll.length; i++){
       console.log('Line');
       console.log(TransactionListAll[i].serialNumber+' '+TransactionListAll[i].type);
        DataforTextFile = DataforTextFile+TransactionListAll[i].serialNumber+' '+TransactionListAll[i].type
    //   newObjects[i].name = oldObjects[i].firstName + ' ' + oldObjects[i].lastName;
     	}

      const fileContents = DataforTextFile;
      const FilepathAnd = Context.getFilesDir();
      console.log(FilepathAnd);

      FileSystem.writeToFile('mSupplyData.txt', fileContents);
      console.log('file is written -  mSupply');


    async function writeToFile() {
    const fileContents = DataforTextFile;
    await FileSystem.writeToFile('mSupplyData.txt', fileContents);
    console.log('file is written');
  }



    Alert.alert(

        // This is Alert Dialog Title
        'Alert Dialog Title',

        // This is Alert Dialog Message.
        'Alert Dialog Message', [
          // Second Cancel Button in Alert Dialog.
          { text: 'Cancel', onPress: () => console.log('Cancel Button Pressed'), style: 'cancel' },

          // Third OK Button in Alert Dialog
          { text: 'OK', onPress: () => console.log('OK ButtonPressed') }]
      );
  }




  renderHeader() {
    const headerCells = [];
    if (this.state.data && this.state.data.length > 0) {
      const firstObject = this.state.data[0];
      for (const [key] of Object.entries(firstObject)) {
        headerCells.push(
          <HeaderCell
            key={key}
            style={globalStyles.headerCell}
            textStyle={globalStyles.text}
            width={1}
            text={key}
          />
        );
      }
    }
    return (
      <Header style={globalStyles.header}>
        {headerCells}
      </Header>
    );
  }

  renderRow(item) {
    const cells = [];
    if (this.state.data && this.state.data.length > 0) {
      const firstObject = this.state.data[0];
      for (const [key] of Object.entries(firstObject)) {
        let itemString = item[key]
          && ((typeof item[key] === 'string')
          || (typeof item[key] === 'number')
          || (typeof item[key].getMonth === 'function'))
          && String(item[key]);
        if (!itemString && item[key] && item[key].length) itemString = item[key].length;
        if (typeof item[key] === 'boolean') itemString = item[key] ? 'True' : 'False';
        if (!itemString && item[key] && item[key].id) itemString = item[key].id;
        cells.push(
          <Cell
            key={key}
            style={globalStyles.cell}
            textStyle={globalStyles.text}
            width={1}
          >
            {itemString}
          </Cell>
        );
      }
    }
    return (
      <Row style={globalStyles.row}>
        {cells}
      </Row>
    );
  }

  render() {
    return (
      <View style={[globalStyles.container]}>
        <SearchBar onChange={this.onSearchChange} placeholder="Table Name" />
        <SearchBar onChange={this.onFilterChange} placeholder="Filter" />
        <PageButton text="Email Data" onPress={this.EmailData} />

        <DataTable
          style={globalStyles.container}
          listViewStyle={globalStyles.container}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
        />
      </View>
    );
  }
}

RealmExplorer.propTypes = {
  database: PropTypes.object.isRequired,
};
