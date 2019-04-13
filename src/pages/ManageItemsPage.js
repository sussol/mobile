/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { View, StyleSheet } from 'react-native';

import { GenericPage } from './GenericPage';
import { MiniToggleBar } from '../widgets/index';

/**
 * CONSTANTS
 */

const COLUMNS = {
  itemName: { key: 'itemName', width: 1, title: 'Item', alignText: 'left' },
  batchesCount: { key: 'batchesCount', width: 1, title: 'Number of batches', alignText: 'left' },
  totalQuantity: { key: 'totalQuantity', width: 1, title: 'Quantity', alignText: 'left' },
  breach: { key: 'breach', width: 1, title: 'Breach', alignText: 'left' },
  navigation: { key: 'navigation', width: 1, title: '', alignText: 'left' },
  quantityInBreach: {
    key: 'quantityInBreach',
    width: 1,
    title: 'Quantity in breach',
    alignText: 'left',
  },
  exposureRange: {
    key: 'exposureRange',
    width: 1,
    title: 'Temperature exposure',
    alignText: 'left',
  },
};

const VACCINE_COLUMN_KEYS = [
  'itemName',
  'batchesCount',
  'totalQuantity',
  'quantityInBreach',
  'exposureRange',
  'breach',
  'navigation',
];

/**
 * HELPER METHODS
 */

const getColumns = () => VACCINE_COLUMN_KEYS.map(key => COLUMNS[key]);

/**
 * MAnage item age etrc
 */
export class ManageItemsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
    };
  }

  componentDidMount = () => {
    const { database } = this.props;
    const data = database.objects('Item').filter(item => item.isVaccine);
    this.setState({ data });
  };

  renderCell = (key, item) => item.id;

  filteringData = term => {
    const { data } = this.state;
    const { database } = this.props;
    const fridges = database
      .objects('Location')
      .filter(fridge => fridge.description.startsWith(term));

    // rrconst fridges = data.filter(item => item);
  };

  refreshData = (searchTerm, sortBy, isAscending) => {
    const { data } = this.state;
    if (!data) return;
    if (searchTerm) {
    }
    this.setState({
      data: data.filter(item => item.location && item.location.description.startsWith('F')),
    });
  };

  render() {
    const { genericTablePageStyles, database, topRoute } = this.props;
    const { data } = this.state;
    return (
      <GenericPage
        data={data || []}
        renderCell={this.renderCell}
        renderTopRightComponent={() => (
          <View style={{ height: 80 }}>
            <MiniToggleBar leftText="Filter by Location" rightText="Filter by item name" />
          </View>
        )}
        renderTopLeftComponent={() => (
          <View
            style={{
              borderBottomWidth: 10,
              borderBottomColor: 'red',
              minHeight: 200,
              minWidth: 200,
            }}
          />
        )}
        columns={[{ title: 'x', key: 'x', sortable: true }]}
        database={database}
        topRoute={topRoute}
        {...genericTablePageStyles}
      />
    );
  }
}

const localStyles = StyleSheet.create({});

ManageItemsPage.defaultProps = {};
ManageItemsPage.propTypes = {};

export default ManageItemsPage;
