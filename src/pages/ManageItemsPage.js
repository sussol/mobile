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
import { MiniToggleBar, IconCell } from '../widgets/index';
import { SUSSOL_ORANGE } from '../globalStyles/index';
import { PageContentModal } from '../widgets/modals/index';

/**
 * CONSTANTS
 */

const MODAL_KEYS = {
  BREACH: 'breach',
};

const COLUMNS = {
  name: { key: 'name', width: 1.5, title: 'ITEM NAME', alignText: 'left' },
  totalBatchesInStock: {
    key: 'totalBatchesInStock',
    width: 0.8,
    title: 'NUMBER OF BATCHES',
    alignText: 'right',
  },
  totalQuantity: { key: 'totalQuantity', width: 0.5, title: 'QUANTITY', alignText: 'right' },
  hasBreach: { key: 'hasBreach', width: 0.5, title: 'BREACH', alignText: 'left' },
  navigation: { key: 'navigation', width: 0.5, title: 'MANAGE', alignText: 'left' },
  quantityInBreach: {
    key: 'quantityInBreach',
    width: 0.8,
    title: 'QUANTITY IN BREACH',
    alignText: 'right',
  },
  exposureRange: {
    key: 'temperatureExposure',
    width: 1,
    title: 'TEMPERATURE EXPOSURE',
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

const formatExposureRange = ({ min, max } = {}) => {
  if (!(min && max)) return null;
  const degree = String.fromCharCode(176);
  return `${min}${degree}C to ${max}${degree}C`;
};

/**
 * MAnage item age etrc
 */
export class ManageItemsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      filterStatus: true,
      modalKey: null,
      isModalOpen: false,
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

  onNavigateToItem = ({ item } = {}) => {
    if (!item) {
      // return here, linter complaining about empty stuff
      setTimeout();
    }
    // TODO: Navigate to Vaccine Manage Item Page
  };

  onModalUpdate = ({ modalKey } = {}) => () => {
    if (!modalKey) this.setState({ isModalOpen: false, modalKey: null });
    else this.setState({ isModalOpen: true, modalKey });
  };

  /**
   * RENDER HELPERS
   */

  renderModal = () => {
    const { modalKey } = this.state;
    const { BREACH } = MODAL_KEYS;
    switch (modalKey) {
      case BREACH:
        return 'BREACH MODAL HERE';
      default:
        return null;
    }
  };

  renderCell = (key, item) => {
    const { BREACH } = MODAL_KEYS;
    const emptyCell = { type: 'text', cellContents: '' };
    switch (key) {
      default:
        return item[key];
      case 'hasBreach':
        if (!item[key]) return emptyCell;
        return (
          <IconCell
            icon="warning"
            iconColor="red"
            iconSize={30}
            onPress={this.onModalUpdate({ modalKey: BREACH })}
          />
        );
      case 'navigation':
        return (
          <IconCell
            icon="angle-double-up"
            iconSize={20}
            iconColor={SUSSOL_ORANGE}
            onPress={this.onNavigateToItem}
          />
        );
      case 'temperatureExposure':
        return formatExposureRange(item[key]);
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
    const { data, isModalOpen } = this.state;

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
      >
        {isModalOpen && (
          <PageContentModal isOpen={isModalOpen} onClose={this.onModalUpdate}>
            <View>{this.renderModal()}</View>
          </PageContentModal>
        )}
      </GenericPage>
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
