/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import globalStyles, {
  SUSSOL_ORANGE,
  WARM_GREY,
  LIGHT_GREY,
  COMPONENT_HEIGHT,
} from '../globalStyles';

import {
  Cell,
  CheckableCell,
  DataTable,
  EditableCell,
  Header,
  HeaderCell,
  Row,
} from '../widgets/DataTable';

import Icon from 'react-native-vector-icons/Ionicons';
import { ListView } from 'realm/react-native';
import { SearchBar } from '../widgets';
import { tableStrings } from '../localization';

/**
 * Provides a generic implementation of a standard page in mSupply Mobile, which
 * contains a searchable table. Should always be overridden, in particular the
 * following methods and instance variables (fields):
 * @method getUpdatedData(searchTerm, sortBy, isAscending) Should return updated data
 * @method renderCell(key, record) Should define what to render in a cell with the
 *         											 given column key and database record
 * @method onRowPress(key, rowData) Should define behaviour when a row is pressed,
 *         											 don't override if row should not be pressable
 * @method onEndEditing(key, rowData, newValue) Handles user input to an editable cell
 *         											 don't override if row should not be pressable
 * @field  {array}  cellRefsMap  Stores references to TextInputs in editableCells so next button
 *                               on native keyboard focuses the next cell. Order is left to
 *                               right within a row, then next row.
 * @field  {array}  columns      An array of objects defining each of the columns.
 *         											 Each column must contain: key, width, titleKey. Each
 *         											 may optionally also contain a boolean 'sortable'.
 * @field  {array}  dataTypesSynchronised      Data types visible in the table displayed
 *         																		 on this page, that should therefore cause
 *         																		 an update if changed by sync
 * @field  {string} finalisableDataType        The data type that can be finalised on this
 *         																		 page, that should therefore cause an update
 *         																		 if changed by being finalised
 * @state  {ListView.DataSource} dataSource    DataTable input, used to update rows
 *         																		 being rendered
 * @state  {string}              searchTerm    Current term user has entered in search bar
 * @state  {string}              sortBy        The property to sort by (is selected
 *                                             by column press).
 * @state  {boolean}             isAscending   Direction sortBy should sort
 *                                             (ascending/descending:true/false).
 * N.B. Take care to call parent method if overriding any of the react life cycle methods.
 */
export class GenericTablePage extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource: dataSource,
      searchTerm: '',
      sortBy: '',
      isAscending: true,
      selection: [],
      expandedRows: [],
      modalKey: null,
      pageContentModalIsOpen: false,
    };
    this.cellRefsMap = {}; // { rowId: reference, rowId: reference, ...}
    this.columns = null;
    this.dataTableRef = null;
    this.dataTypesSynchronised = [];
    this.databaseListenerId = null;
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onColumnSort = this.onColumnSort.bind(this);
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.focusNextField = this.focusNextField.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.renderCell = this.renderCell.bind(this);
    this.refreshData = this.refreshData.bind(this);
  }


  /**
   * If overridden, first line of this method should be duplicated. May need to be overridden to
   * populate selection in state if CheckableCells are used and need to
   * remember their selected state.
   */
  componentWillMount() {
    this.databaseListenerId = this.props.database.addListener(this.onDatabaseEvent);
    this.refreshData();
  }

  /**
   * Refresh data every time the page becomes the top route, so that changes will show
   * when a user returns to the page using the back button.
   */
  componentWillReceiveProps(props) {
    if (!this.props.topRoute && props.topRoute) this.refreshData();
  }

  componentWillUnmount() {
    this.props.database.removeListener(this.databaseListenerId);
  }

  // Refetch data and render the list any time sync changes data displayed, or the
  // record is finalised
  onDatabaseEvent(changeType, recordType, record, causedBy) {
    // Ensure sync updates are immediately visible
    if (causedBy === 'sync' &&
        this.dataTypesSynchronised.indexOf(recordType) >= 0) this.refreshData();
    // Ensure finalising updates data for the primary data type
    else if (recordType === this.finalisableDataType && record.isFinalised) this.refreshData();
  }

  onSearchChange(event) {
    const term = event.nativeEvent.text;
    this.setState({ searchTerm: term }, () => {
      this.refreshData();
      if (this.dataTableRef) this.dataTableRef.scrollTo({ y: 0, animated: false });
    });
  }

  onColumnSort(sortBy) {
    if (this.state.sortBy === sortBy) { // Changed column sort direction
      this.setState({ isAscending: !this.state.isAscending }, this.refreshData);
    } else { // Changed sorting column
      this.setState({
        sortBy: sortBy,
        isAscending: true,
      }, this.refreshData);
    }
  }

  /**
   * Adds/removes rowData.id to/from the selection array in state. Must call this within any
   * overrides. i.e. super.onCheckablePress(rowData);
   */
  onCheckablePress(rowData) {
    const newSelection = [...this.state.selection];
    if (newSelection.indexOf(rowData.id) >= 0) {
      newSelection.splice(newSelection.indexOf(rowData.id), 1);
    } else {
      newSelection.push(rowData.id);
    }
    this.setState({ selection: newSelection });
  }

  /**
   * Adds/removes rowData.id to/from the expandedRows array in state. Must call this within any
   * overrides i.e. super.onExpandablePress(rowData);
   */
  onExpandablePress(rowData) {
    const newExpandedRows = [...this.state.expandedRows];
    if (newExpandedRows.indexOf(rowData.id) >= 0) {
      newExpandedRows.splice(newExpandedRows.indexOf(rowData.id), 1);
    } else {
      newExpandedRows.push(rowData.id);
    }
    this.setState({ expandedRows: newExpandedRows });
  }

  openModal(key) {
    this.setState({ modalKey: key, pageContentModalIsOpen: true });
  }

  closeModal() {
    this.setState({ pageContentModalIsOpen: false });
  }

  scrollTableToRow(rowId) {
    // Scrolls to row of rowId with a couple rows above it, unless the rowId is of the top 3 rows,
    // where it just scrolls to the top.
    const yValue = Math.max((rowId - 2) * COMPONENT_HEIGHT, 0);
    if (this.dataTableRef) this.dataTableRef.scrollTo({ y: yValue });
  }

  focusNextField(currentCellRef) {
    const nextCellRef = currentCellRef + 1;
    if (this.cellRefsMap[nextCellRef]) {
      this.scrollTableToRow(nextCellRef);
      this.cellRefsMap[nextCellRef].focus();
    } else {
      // Protect against crash from null being in the Map.
      if (this.cellRefsMap[currentCellRef]) this.cellRefsMap[currentCellRef].blur();
    }
  }

  refreshData() {
    this.cellRefsMap = {};
    const { dataSource, searchTerm, sortBy, isAscending } = this.state;
    const data = this.getUpdatedData(searchTerm, sortBy, isAscending);
    this.setState({ dataSource: dataSource.cloneWithRows(data) });
  }

/**
 * Accepted Cell formats:
 * 1. <Cell style={styles.cell} width={3}/> // Or any other react component. Must be styled within
 *                                          // the extending class.
 * 2. item.name;
 * 3. {
 *      type: 'text',
 *      cellContents: item.name,
 *    };
 * 4. {
 *      type: 'editable',
 *      cellContents: transactionItem.totalQuantity,
 *    };
 * 4. {
 *      type: 'editable',
 *      cellContents: item.countedTotalQuantity,
 *      keyboardType: numeric,
 *      returnKeyType: 'next',
 *      placeholder: 'No change',
 *    };
 * 6. {
 *      type: 'checkable',
 *      isDisabled: false,
 *    };
 * 7. {
 *      type: 'checkable',
 *      icon: 'md-remove-circle', // will use for both Checked and NotChecked, only colour changes
 *      isDisabled: false,
 *    };
 * 8. {
 *      type: 'checkable',
 *      iconChecked: 'md-radio-button-on',
 *      iconNotChecked: 'md-radio-button-off',
 *      isDisabled: false,
 *    };
 */
  renderCell() {
    return 'DEFAULT CELL';
  }

  renderHeader() {
    const headerCells = [];
    this.columns.forEach((column, index, columns) => {
      let textStyle;
      let cellStyle = index !== columns.length - 1 ?
        globalStyles.dataTableHeaderCell :
        [globalStyles.dataTableHeaderCell, globalStyles.dataTableRightMostCell];

      switch (column.alignText) {
        case 'left':
        default:
          textStyle = [globalStyles.dataTableText, localStyles.alignTextLeft];
          break;
        case 'center':
          textStyle = [globalStyles.dataTableText, localStyles.alignTextCenter];
          cellStyle = [cellStyle, { justifyContent: 'center' }];
          break;
        case 'right':
          textStyle = [globalStyles.dataTableText, localStyles.alignTextRight];
          cellStyle = [cellStyle, { justifyContent: 'flex-end' }];
          break;
      }

      const sortFunction = column.sortable ? () => this.onColumnSort(column.key) : null;
      headerCells.push(
        <HeaderCell
          key={column.key}
          style={cellStyle}
          textStyle={textStyle}
          width={column.width}
          onPress={sortFunction}
          isAscending={this.state.isAscending}
          isSelected={this.state.sortBy === column.key}
          text={tableStrings[column.titleKey]}
        />
      );
    });
    return (
      <Header style={globalStyles.header}>
        {headerCells}
      </Header>
    );
  }

  renderRow(rowData, sectionId, rowId) {
    if (!rowData.isValid()) return null; // Don't render if the row's data has been deleted
    const cells = [];
    const isExpanded = this.state.expandedRows.includes(rowData.id);
    // Make rows alternate background colour
    const rowStyle = rowId % 2 === 1 ?
      globalStyles.dataTableRow : [globalStyles.dataTableRow, { backgroundColor: 'white' }];

    this.columns.forEach((column, index, columns) => {
      let textStyle;
      switch (column.alignText) {
        case 'left':
        default:
          textStyle = [globalStyles.dataTableText, localStyles.alignTextLeft];
          break;
        case 'center':
          textStyle = [globalStyles.dataTableText, localStyles.alignTextCenter];
          break;
        case 'right':
          textStyle = [globalStyles.dataTableText, localStyles.alignTextRight];
          break;
      }

      const cellStyle = index !== columns.length - 1 ?
        globalStyles.dataTableCell :
        [globalStyles.dataTableCell, globalStyles.dataTableRightMostCell];
      const renderedCell = this.renderCell(column.key, rowData);

      let cell;
      switch (renderedCell.type) {
        case 'custom':
          cell = renderedCell.cell;
          break;
        case 'checkable': {
          // if provided, use isChecked prop, else set isChecked according to rowData.id
          // being in selection array.
          const isChecked = renderedCell.isChecked ?
            renderedCell.isChecked : this.state.selection.indexOf(rowData.id) >= 0;
          let iconChecked;
          let iconNotChecked;
          if (renderedCell.iconChecked && renderedCell.iconNotChecked) {
            iconChecked = renderedCell.iconChecked;
            iconNotChecked = renderedCell.iconNotChecked;
          } else if (renderedCell.icon) {
            iconChecked = renderedCell.icon;
            iconNotChecked = renderedCell.icon;
          } else {
            iconChecked = 'md-radio-button-on';
            iconNotChecked = 'md-radio-button-off';
          }
          cell = (
            <CheckableCell
              key={column.key}
              style={[
                cellStyle,
                globalStyles.dataTableCheckableCell,
              ]}
              width={column.width}
              onPress={() => this.onCheckablePress(rowData)}
              renderDisabled={() => <Icon name={iconNotChecked} size={15} color={LIGHT_GREY} />}
              renderIsChecked={() => <Icon name={iconChecked} size={15} color={SUSSOL_ORANGE} />}
              renderIsNotChecked={() => <Icon name={iconNotChecked} size={15} color={WARM_GREY} />}
              isChecked={isChecked}
              isDisabled={renderedCell.isDisabled}
            />
          );
          break;
        }
        case 'editable':
          cell = (
            <EditableCell
              key={column.key}
              refCallback={(reference) => { this.cellRefsMap[rowId] = reference; }}
              style={cellStyle}
              textStyle={textStyle}
              width={column.width}
              returnKeyType={renderedCell.returnKeyType || 'next'}
              selectTextOnFocus={true}
              placeholder={renderedCell.placeholder}
              keyboardType={renderedCell.keyboardType || 'numeric'}
              onEndEditing={(target, value) => {
                if (!this.onEndEditing) return;
                this.onEndEditing(column.key, target, value);
                this.refreshData();
              }}
              onSubmitEditing={() => this.focusNextField(parseInt(rowId, 10))}
              target={rowData}
              value={renderedCell.cellContents}
            />
          );
          break;
        case 'text':
        default:
          cell = (
            <Cell
              key={column.key}
              style={cellStyle}
              textStyle={textStyle}
              width={column.width}
              numberOfLines={renderedCell.lines}
            >
              {renderedCell.hasOwnProperty('cellContents') ?
                renderedCell.cellContents :
                renderedCell}
            </Cell>
          );
      }
      cells.push(cell);
    });
    return (
      <Row
        style={rowStyle}
        renderExpansion={this.renderExpansion && (() => this.renderExpansion(rowData))}
        isExpanded={isExpanded}
        onPress={
          this.renderExpansion && (() => this.onExpandablePress(rowData))
            || this.onRowPress && (() => this.onRowPress(rowData))
        }
      >
        {cells}
      </Row>
    );
  }

  renderSearchBar() {
    return (
      <SearchBar
        onChange={(event) => this.onSearchChange(event)}
      />);
  }

  renderDataTable() {
    return (
      <DataTable
        refCallback={(reference) => (this.dataTableRef = reference)}
        style={globalStyles.dataTable}
        listViewStyle={localStyles.listView}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        renderHeader={this.renderHeader}
      />);
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={globalStyles.pageTopLeftSectionContainer}>
              {this.renderSearchBar()}
            </View>
          </View>
          {this.renderDataTable()}
        </View>
      </View>
    );
  }
}

GenericTablePage.propTypes = {
  database: React.PropTypes.object,
  topRoute: React.PropTypes.bool,
};

const localStyles = StyleSheet.create({
  listView: {
    flex: 1,
  },
  alignTextLeft: {
    marginLeft: 20,
    textAlign: 'left',
  },
  alignTextCenter: {
    textAlign: 'center',
  },
  alignTextRight: {
    marginRight: 20,
    textAlign: 'right',
  },
});
