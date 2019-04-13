/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { View, StyleSheet } from 'react-native';
import { SearchBar } from 'react-native-ui-components';

import { GenericPage } from './GenericPage';
import { MiniToggleBar } from '../widgets/index';
import { SUSSOL_ORANGE } from '../globalStyles/index';

/**
 * CONSTANTS
 */

const COLUMNS = {
  name: { key: 'name', width: 1, title: 'Item', alignText: 'left' },
  totalBatchesInStock: {
    key: 'totalBatchesInStock',
    width: 1,
    title: 'Number of batches',
    alignText: 'right',
  },
  totalQuantity: { key: 'totalQuantity', width: 1, title: 'Quantity', alignText: 'right' },
  hasBreach: { key: 'hasBreach', width: 1, title: 'Breach', alignText: 'left' },
  navigation: { key: 'navigation', width: 1, title: 'Manage', alignText: 'left' },
  quantityInBreach: {
    key: 'quantityInBreach',
    width: 1,
    title: 'Quantity in breach',
    alignText: 'right',
  },
  exposureRange: {
    key: 'exposureRange',
    width: 1,
    title: 'Temperature exposure',
    alignText: 'center',
  },
};

const VACCINE_COLUMN_KEYS = [
  'name',
  'totalBatchesInStock',
  'totalQuantity',
  'quantityInBreach',
  'exposureRange',
  'hasBreach',
  'navigation',
];

const LOCALIZATION = {
  toggle: {
    location: 'Filter by Location',
    name: 'Filter by Item Name',
  },
};

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
      filterStatus: true,
    };
  }

  /**
   * HELPER METHODS
   */
  setData = ({ data } = {}) => {
    const { database } = this.props;
    let dataToSet;
    if (!data) {
      dataToSet = database.objects('Item').filter(item => item.isVaccine);
    } else {
      dataToSet = data;
    }
    this.setState({ data: dataToSet });
  };

  locationFilter = searchTerm => {
    const { database } = this.props;
    const fridges = database
      .objects('Location')
      .filtered('description BEGINSWITH[c] $0', searchTerm);
    return database
      .objects('Item')
      .filter(item => item.isVaccine)
      .filter(item => item.hasBatchInFridges(fridges));
  };

  itemFilter = searchTerm => {
    const { database } = this.props;
    return database
      .objects('Item')
      .filtered('name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0', searchTerm)
      .filter(item => item.isVaccine);
  };

  /**
   * COMPONENT METHODS
   */
  componentDidMount = () => {
    // TODO: If passed props e.g. initialSearchTerm, initialFilterStatus,
    // set these in state and filter before setting data. This is bad.
    //
    this.setData();
  };

  /**
   * EVENT HANDLERS
   */

  onToggle = () => {
    const { filterStatus } = this.state;
    this.setState({ filterStatus: !filterStatus });
  };

  onFilterData = searchTerm => {
    const { filterStatus } = this.state;
    let newData;
    if (searchTerm) {
      newData = filterStatus ? this.locationFilter(searchTerm) : this.itemFilter(searchTerm);
    }
    this.setData({ data: newData });
  };

  /**
   * RENDER HELPERS
   */

  renderCell = (key, item) => {
    switch (key) {
      default:
        return item[key];
      case 'hasBreach':
        return 'BREACHED';
      case 'navigation':
        return 'ICON';
      case 'exposureRange':
        return 'X TO Y';
    }
  };

  renderFilterToggle = () => {
    const { filterStatus } = this.state;
    const { toggle } = LOCALIZATION;
    return (
      <View style={{ height: 80 }}>
        <MiniToggleBar
          leftText={toggle.location}
          rightText={toggle.name}
          onPress={this.onToggle}
          currentState={filterStatus}
        />
      </View>
    );
  };

  renderSearchBar = () => <SearchBar color={SUSSOL_ORANGE} onChange={this.onFilterData} />;

  render() {
    const { genericTablePageStyles, database, topRoute } = this.props;
    const { data } = this.state;

    return (
      <GenericPage
        database={database}
        topRoute={topRoute}
        columns={getColumns()}
        data={data || []}
        renderCell={this.renderCell}
        renderTopRightComponent={this.renderFilterToggle}
        renderTopLeftComponent={this.renderSearchBar}
        {...genericTablePageStyles}
      />
    );
  }
}

const localStyles = StyleSheet.create({});

ManageItemsPage.defaultProps = {};
ManageItemsPage.propTypes = {
  genericTablePageStyles: PropTypes.object.isRequired,
  database: PropTypes.object.isRequired,
  topRoute: PropTypes.object.isRequired,
};

export default ManageItemsPage;
