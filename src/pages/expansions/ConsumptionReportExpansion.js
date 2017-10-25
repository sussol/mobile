/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { Expansion } from 'react-native-data-table';
import { dataTableStyles, expansionPageStyles } from '../../globalStyles';
import { PageButton, ExpiryTextInput, PageInfo } from '../../widgets';
import { GenericPage } from '../GenericPage';
import { parsePositiveInteger } from '../../utilities';
import { tableStrings, buttonStrings } from '../../localization';

/**
* Renders page to be displayed in StocktakeEditPage -> expansion.
* @prop   {Realm}               database      App wide database.
* @state  {Realm.Results}       items         the stocktakeItems of props.stocktake.
*/
export class ConsumptionReportExpansion extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [] };
    autobind(this);
  }

  refreshData() {
    this.setState({ data: this.props.data });
  }

  renderCell(key, dataRow) {
    switch (key) {
      default:
        return dataRow[key];
    }
  }

  renderFooter() {
    return null;
  }

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
          columns={[
            {
              key: 'customerName',
              width: 3,
              title: '',
            },
            ...['','','',''].map((dateRange, index) => ({
              key: index,
              width: 2,
              title: dateRange.header,
              alignText: 'center',
            })),
          ]}
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
  data: PropTypes.object.isRequired,
  refreshParent: PropTypes.func.isRequired,
};
