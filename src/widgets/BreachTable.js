/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { GenericTablePage } from 'react-native-generic-table-page';

import { StyleSheet, View } from 'react-native';

import { VaccineChart, StackedTables } from '.';

import { SHADOW_BORDER } from '../globalStyles/index';
import { formattedDifferenceBetweenDates, formatExposureRange } from '../utilities/formatters';

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
  { key: 'duration', title: LOCALIZATION.columns.breach.duration, width: 0.8, alignText: 'center' },
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
  { key: 'expiry', title: LOCALIZATION.columns.batch.expiry, width: 0.8 },
  { key: 'quantity', title: LOCALIZATION.columns.batch.quantity, width: 0.8 },
  { key: 'duration', title: LOCALIZATION.columns.batch.duration, width: 1 },
];

/**
 * Component to be used within a PageContentModal
 *
 * Renders a table of breaches with expandable rows which display
 * sub tables of item batches grouped by item, as well as a table
 * of temperatures for that breach.
 *
 *
 * Props are intended to be made by calling methods in utilities/modules/vaccines
 * -- extractBreaches : Getting the sensorLogs/breaches for a location, item or batch.
 * -- sensorLogsExtractBatches : Called on each breach to extract item data for sub tables.
 * -- getBreachData : Creates the data needed for the main table.
 * -- aggregateLogs : Creates the data needed for the chart component.
 * @prop {Array}  data     Array of data for both breach table and sub tables - example below
 * @prop {Object} database Realm database **Not used, required for main table**
 * @prop {Object} genericTablePageStyles Main table styles
 *
 * [
 *    {
 *      breach: [ array of sensorLogs ]
 *      items: [ { item, batches: [ { code, expiry, totalQuantity, duration }, ... ] }, .. ]
 *      chartData: [ {temp, date}, .. ]
 *    },
 *    .....
 * ]
 */
export class BreachTable extends React.PureComponent {
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
      case 'location':
        return { type: 'text', cellContents: (value && value.description) || 'Not available' };
      case 'temperatureExposure':
        return {
          type: 'text',
          cellContents: formatExposureRange(value),
        };
      case 'duration':
        return {
          type: 'text',
          cellContents: formattedDifferenceBetweenDates(value),
        };
      default:
        return { type: 'text', cellContents: value[key] };
    }
  };

  render() {
    const { database, genericTablePageStyles, data } = this.props;
    return (
      <GenericTablePage
        {...genericTablePageStyles}
        database={database}
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

BreachTable.defaultProps = {};
BreachTable.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
};

export default BreachTable;
