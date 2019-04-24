/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, View } from 'react-native';
import { GenericTablePage } from 'react-native-generic-table-page';

import { VaccineChart, StackedTables } from '.';

import { formattedDifferenceBetweenDates, formatExposureRange } from '../utilities/formatters';
import { extractDataForBreachModal } from '../utilities/modules/vaccines';

import { SHADOW_BORDER } from '../globalStyles';

/**
 * CONSTANTS
 */

// TODO: Localization
const LOCALIZATION = {
  columns: {
    breach: {
      date: 'DATE',
      location: 'LOCATION',
      duration: 'DURATION',
      exposureRange: 'EXPOSURE RANGE',
      affectedQuantity: 'AFFECTED QUANTITY',
      numberOfAffectedBatches: 'NO. OF AFFECTED BATCHES',
    },
    batch: {
      code: 'CODE',
      expiry: 'EXPIRY',
      quantity: 'QUANTITY',
      duration: 'DURATION',
    },
  },
};

const BREACH_COLUMNS = [
  { key: 'date', title: LOCALIZATION.columns.breach.date, width: 0.8, alignText: 'center' },
  { key: 'location', title: LOCALIZATION.columns.breach.location, width: 0.8, alignText: 'center' },
  {
    key: 'breachDuration',
    title: LOCALIZATION.columns.breach.duration,
    width: 0.8,
    alignText: 'center',
  },
  {
    key: 'exposureRange',
    title: LOCALIZATION.columns.breach.exposureRange,
    width: 0.8,
    alignText: 'center',
  },
  {
    key: 'affectedQuantity',
    title: LOCALIZATION.columns.breach.affectedQuantity,
    width: 0.8,
    alignText: 'center',
  },
  {
    key: 'numberOfAffectedBatches',
    title: LOCALIZATION.columns.breach.numberOfAffectedBatches,
    width: 1,
    alignText: 'center',
  },
];

const BATCH_COLUMNS = [
  { key: 'code', title: LOCALIZATION.columns.batch.code, width: 0.8 },
  { key: 'expiryDate', title: LOCALIZATION.columns.batch.expiry, width: 0.8 },
  { key: 'totalQuantity', title: LOCALIZATION.columns.batch.quantity, width: 0.8 },
  { key: 'duration', title: LOCALIZATION.columns.batch.duration, width: 1 },
];

/**
 * Component to be used within a PageContentModal
 *
 * Renders a table of breaches with expandable rows which display
 * sub tables of item batches grouped by item, as well as a table
 * of temperatures for that breach.
 *
 * Breaches prop is intended to be made by calling extractBreaches in
 * utilities/modules/vaccines.
 *
 * @prop {Array}     breaches 2D array of breaches - array of SensorLog arrays
 * @prop {Realm}     database App-wide database reference
 * @prop {Object}    genericTablePageStyles Main table styles
 * @prop {Item}      itemFilter item to filter data by
 * @prop {ItemBatch} itemBatchFilter ItemBatch to filter data by
 * @prop {Func}      runWithLoadingIndicator app-wide wrapping function to display a spinner
 * breaches: [[ [sensorLog1, sensorLog2, sensorLog3], [sensorLog1, sensorLog2, .. , ], ..]
 */
export class BreachTable extends React.PureComponent {
  constructor(props) {
    super(props);

    // Data is set through componentDidMount after
    // generating the required data from the breaches
    // prop.
    this.state = {
      data: null,
    };
  }

  /**
   * COMPONENT METHODS
   */

  // Takes the breaches passed in through props and generates the required
  // data to display the main table and each expansion while displaying
  // a loading indicator spinner to the user.
  componentDidMount = async () => {
    const { runWithLoadingIndicator, database, breaches, itemFilter, itemBatchFilter } = this.props;
    await runWithLoadingIndicator(() => {
      this.setState({
        data: extractDataForBreachModal({
          itemFilter,
          itemBatchFilter,
          database,
          breaches,
        }),
      });
    });
  };

  /**
   * RENDER HELPERS
   */

  // Returns an expansion for a row.
  // Creates the required array for the StackTables component. See
  // that component for an example.
  renderExpansion = rowData => {
    const { expansionContainer, chartContainer, tablesContainer } = localStyles;
    const { chartData, items } = rowData;
    const tableProps = items.map(itemGroup => ({
      data: itemGroup.batches,
      title: itemGroup.item.name,
      columns: BATCH_COLUMNS,
    }));

    return (
      <View style={expansionContainer}>
        <View style={chartContainer}>
          <VaccineChart {...chartData} />
        </View>

        <View style={tablesContainer}>
          <StackedTables data={tableProps} />
        </View>
      </View>
    );
  };

  // Simple cell renderer to display non-editable data
  // for the main table.
  renderCell = (key, value) => {
    switch (key) {
      case 'date':
        return {
          type: 'text',
          cellContents: value[key].toLocaleDateString(),
        };
      case 'location':
        return {
          type: 'text',
          cellContents: (value[key] && value[key].description) || 'Not available',
        };
      case 'exposureRange':
        return {
          type: 'text',
          cellContents: formatExposureRange(value[key]),
        };
      case 'breachDuration':
        return {
          type: 'text',
          cellContents: formattedDifferenceBetweenDates(value[key]),
        };
      default:
        return { type: 'text', cellContents: value[key] };
    }
  };

  render() {
    const { genericTablePageStyles } = this.props;
    const { data } = this.state;
    if (!data) return null;
    return (
      <GenericTablePage
        {...genericTablePageStyles}
        data={data}
        columns={BREACH_COLUMNS}
        renderExpansion={this.renderExpansion}
        renderCell={this.renderCell}
      />
    );
  }
}

const localStyles = StyleSheet.create({
  tablesContainer: { width: '47%', margin: 30 },
  chartContainer: {
    width: '47%',
    justifyContent: 'center',
    height: 300,
    backgroundColor: 'white',
    margin: 20,
  },
  expansionContainer: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#ecf3fc',
    margin: 10,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: SHADOW_BORDER,
    borderBottomWidth: 0,
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
    marginHorizontal: 5,
    marginTop: 10,
  },
});

BreachTable.defaultProps = {
  itemFilter: null,
  itemBatchFilter: null,
};
BreachTable.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object.isRequired,
  breaches: PropTypes.array.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  itemFilter: PropTypes.object,
  itemBatchFilter: PropTypes.object,
};

export default BreachTable;
