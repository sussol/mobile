/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Expansion } from 'react-native-data-table';
import { dataTableStyles, expansionPageStyles } from '../../globalStyles';
import { GenericPage } from '../GenericPage';

/**
* Renders page to be displayed in StocktakeEditPage -> expansion.
* @prop   {Realm}               database      App wide database.
* @state  {Realm.Results}       items         the stocktakeItems of props.stocktake.
*/
export class ConsumptionReportExpansion extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [], columns: this.getColumns() };
  }

  getColumns = () => (
    [
      {
        key: 'customerName',
        width: 3,
        title: '',
      },
      ...this.props.dateRanges.map((dateRange) => ({
        key: dateRange.formatedDate,
        width: 2,
      })),
    ]
  )

  refreshData = () =>
    this.setState({ data: this.props.data, dateRanges: this.props.dateRanges });

  renderCell = (key, dataRow) => dataRow[key];

  render() {
    return (
      <Expansion style={dataTableStyles.expansionWithInnerPage}>
        <GenericPage
          data={this.state.data}
          renderCell={this.renderCell}
          refreshData={this.refreshData}
          hideSearchBar={true}
          renderDataTableFooter={() => null} // overrides default generc pages footer
          dontRenderSearchBar={true}
          onEndEditing={this.onEndEditing}
          renderTopLeftComponent={this.renderPageInfo}
          renderTopRightComponent={this.renderAddBatchButton}
          columns={this.state.columns}
          database={this.props.database}
          {...this.props.genericTablePageStyles}
          pageStyles={expansionPageStyles}
        />
      </Expansion>
    );
  }
}

ConsumptionReportExpansion.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  data: PropTypes.array.isRequired,
  dateRanges: PropTypes.array,
  refreshParent: PropTypes.func.isRequired,
};
