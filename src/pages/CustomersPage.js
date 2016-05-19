/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Text,
  View,
} from 'react-native';

import {
  Cell,
  DataTable,
  Header,
  HeaderCell,
  Row,
} from '../widgets/DataTable';

import { ListView } from 'realm/react-native';

import globalStyles from '../globalStyles';
import { Button } from '../widgets';

export class CustomersPage extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource: dataSource,
    };
  }

  componentWillMount() {
    const data = this.props.database.objects('SyncOut');
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
  }

  renderHeader() {
    return (
      <Header style={globalStyles.header}>
        <HeaderCell
          style={globalStyles.headerCell}
          textStyle={globalStyles.text}
          width={1}
          text={'Change Type'}
        />
        <HeaderCell
          style={globalStyles.headerCell}
          textStyle={globalStyles.text}
          width={1}
          text={'Record Type'}
        />
        <HeaderCell
          style={globalStyles.headerCell}
          textStyle={globalStyles.text}
          width={1}
          text={'Record Id'}
        />
        <HeaderCell
          style={globalStyles.headerCell}
          textStyle={globalStyles.text}
          width={1}
          text={'Change Time'}
        />
      </Header>
    );
  }

  renderRow(item) {
    return (
      <Row style={globalStyles.row} renderExpansion={() => this.renderExpansion(item)}>
        <Cell
          style={globalStyles.cell}
          textStyle={globalStyles.text}
          width={1}
        >
          {item.changeType}
        </Cell>
        <Cell
          style={globalStyles.cell}
          textStyle={globalStyles.text}
          width={1}
        >
          {item.recordType}
        </Cell>
        <Cell
          style={globalStyles.cell}
          textStyle={globalStyles.text}
          width={1}
        >
          {item.recordId}
        </Cell>
        <Cell
          style={globalStyles.cell}
          textStyle={globalStyles.text}
          width={1}
        >
          {item.changeTime}
        </Cell>
      </Row>
    );
  }

  render() {
    return (
      <View style={this.props.style}>
        <DataTable
          style={globalStyles.container}
          listViewStyle={globalStyles.container}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
          searchBar={this.onSearchChange}
          searchBarStyle={globalStyles.searchBar}
        />
          <Button
            text="Specific Customer"
            onPress={() => this.props.navigateTo('customer', 'Customer Name')}
          />
          <Button
            text="New Customer Invoice"
            onPress={() => this.props.navigateTo('customerInvoice', 'Invoice Num')}
          />
      </View>
    );
  }
}

CustomersPage.propTypes = {
  database: React.PropTypes.object.isRequired,
  navigateTo: React.PropTypes.func.isRequired,
  style: View.propTypes.style,
};
