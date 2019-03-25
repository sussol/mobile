/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Expansion } from 'react-native-data-table';
import { GenericPage } from './GenericPage';
import { PageInfo, VVNToggle } from '../widgets';
import { dataTableStyles } from '../globalStyles';
import { formatExpiryDate, sortDataBy } from '../utilities';
import { tableStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['Item', 'ItemBatch', 'ItemCategory'];

/**
* Renders the page for all Items and their stock, with expansion of further details.
* @prop   {Realm}               database    App wide database.
* @prop   {func}                navigateTo  CallBack for navigation stack.
* @state  {Realm.Results}       items       Contains all Items stored on the local database.
*/
export class StockPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        {
          date: '10/03 09:10',
          duration: '12 hours',
          exposureRange: '8°C to 12°C',
          affectedQuantity: '300',
          numberOfBatches: '2',
        },
        {
          date: '15/03 12:25',
          duration: '6 hours',
          exposureRange: '8°C to 10°C',
          affectedQuantity: '50',
          numberOfBatches: '1',
        },
        {
          date: '07/03 03:20',
          duration: '1 hour 25 minutes',
          exposureRange: '2°C to -0.5°C',
          affectedQuantity: '40',
          numberOfBatches: '7',
        },
      ]
    };
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'date',
      isAscending: true,
    };
  }

  updateDataFilters = (newSearchTerm, newSortBy, newIsAscending) => {
    // We use != null, which checks for both null or undefined (undefined coerces to null)
    if (newSearchTerm != null) this.dataFilters.searchTerm = newSearchTerm;
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  refreshData = (newSearchTerm, newSortBy, newIsAscending) => {
    console.log('here***');
    this.setState({data: [
      {
        item: 'Hepatitis B Vaccine Vial',
        quantity: '300',
        numOfBatches: '3',
        tempExp: '-0.5°C to 12°C',
        breach: '',
        adjust: '',
        quantityBreach: '100'
      },
      {
        item: 'Pentavalent 10/Vial',
        quantity: '100',
        numOfBatches: '2',
        tempExp: '3°C to 7°C',
        breach: '',
        adjust: '',
        quantityBreach: '0'
      },
    ]});
  }

  renderCell = (key, item) => {
    if(key === 'vvm') {
     return ( <VVNToggle
      key={item.batch}
      onEndEditing={() => {}}
      status={item[key]}
      isDisabled={false}
     /> );
    }
    return item[key]
  }

  renderExpansion = (item) => {

    // const batchInfo = item.batchesWithStock.map((ItemBatch) => {
    //   const quantityInfo = `  ${tableStrings.quantity}: ${ItemBatch.numberOfPacks}`;
    //   const expiryInfo = ItemBatch.expiryDate ?
    //     `  ${tableStrings.batch_expiry}: ${formatExpiryDate(ItemBatch.expiryDate)},`
    //     : '';
    //   const nameInfo = ItemBatch.batch ? `  ${ItemBatch.batch},` : '';

    //   return {
    //     title: `${tableStrings.batch}:`,
    //     info: `${nameInfo}${expiryInfo}${quantityInfo}`,
    //   };
    // });
    let infoColumns = [];

    if (item.affectedQuantity === '300') {
    infoColumns = [
      [
      ],
      [
        {
          title: 'BATCH: ',
          info: 'ABCD123, Quantity: 20, Expiry: 31/12/19, Arrival Date: 01/02/19',
        },
        {
          title: 'BATCH: ',
          info: 'DCBA321, Quantity: 100, Expiry: 31/12/19, Arrival Date: 01/02/19',
        },
        {
          title: 'BATCH: ',
          info: 'DCBA321, Quantity: 80, Expiry: 31/12/19, Arrival Date: 01/02/19',
        }
      ],
    ];
  }

    return (
      <Expansion style={dataTableStyles.expansion}>
        <PageInfo columns={infoColumns} />
      </Expansion>
    );
  }

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        hideSearchBar={true}
        renderCell={this.renderCell}
        renderExpansion={this.renderExpansion}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'item',
            width: 2,
            title: 'ITEM',
            alignText: 'center',
          },
          {
            key: 'numOfBatches',
            width: 1,
            title: 'NUMBER OF\nBATCHES',
            alignText: 'center',
          },
          {
            key: 'quantity',
            width: 1,
            title: 'QUANTITY',
            alignText: 'center',
          },
          {
            key: 'quantityBreach',
            width: 1,
            title: 'QUANTITY\nIN BREACH',
            alignText: 'center',
          },
          {
            key: 'tempExp',
            minWidth: 100 ,
            title: 'TEMPERATURE\nEXPOSURE',
            alignText: 'center',
          },
          {
            key: 'breach',
            width: 0.5,
            title: 'BREACH',
            alignText: 'center',
          },
          {
            key: 'adjust',
            width: 0.5,
            title: '',
            alignText: 'center',
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        database={this.props.database}
        {...this.props.genericTablePageStyles}
        topRoute={this.props.topRoute}
      />
    );
  }
}

StockPage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  navigateTo: PropTypes.func.isRequired,
};
