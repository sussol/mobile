/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { View, StyleSheet, Text } from 'react-native';
import { SearchBar } from 'react-native-ui-components';

import { GenericPage } from './GenericPage';
import { MiniToggleBar, IconCell, PageInfo } from '../widgets/index';
import { SUSSOL_ORANGE } from '../globalStyles/index';
import { PageContentModal } from '../widgets/modals/index';

import { formatExposureRange } from '../utilities';
import GenericChooseModal from '../widgets/modals/GenericChooseModal';

/**
 * CONSTANTS
 */

const MODAL_KEYS = {
  BREACH: 'breach',
  FRIDGE_SELECT: 'fridgeSelect',
};

const LOCALIZATION = {
  pageInfo: {
    filter: 'Filter by Location',
  },
  headers: {},
  misc: {
    allLocations: 'All locations',
  },
};

const PAGE_INFO_COLUMNS = {
  filter: {
    title: LOCALIZATION.pageInfo.filter,
    editableType: 'selectable',
  },
};

const TABLE_COLUMNS = {
  name: { key: 'name', width: 1.5, title: 'ITEM NAME', alignText: 'left' },
  totalBatchesInStock: {
    key: 'totalBatchesInStock',
    width: 0.8,
    title: 'NUMBER OF\nBATCHES',
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

/**
 * HELPER METHODS
 */

const getColumns = () => VACCINE_COLUMN_KEYS.map(key => TABLE_COLUMNS[key]);

/**
 * Page for managing items. Used for vaccine items currently.
 * TODO: Expand when more clarification on this component.
 */
export class ManageItemsPage extends React.Component {
  constructor(props) {
    super(props);

    this.LOCATION_FILTERS = null;
    this.ITEMS = null;

    this.state = {
      modalKey: null,
      isModalOpen: false,
      locationFilter: null,
      searchTerm: '',
    };
  }

  /**
   * HELPER METHODS
   */

  locationFilter = (location, item) =>
    // const { id = -1 } = location;
    // if (id === -1) return true;
    // return item.hasBatchInFridge(location);
    item;

  nameAndCodeFilter = (searchTerm, { name, code } = {}) =>
    name.toLowerCase().startsWith(searchTerm) || code.toLowerCase().startsWith(searchTerm);

  getData = () => {
    const { locationFilter, searchTerm } = this.state;
    if (!locationFilter) return [];
    return this.ITEMS.filter(item => this.nameAndCodeFilter(searchTerm, item));
  };

  /**
   * COMPONENT METHODS
   */
  componentDidMount = () => {
    // TODO: If passed props e.g. initialFilterStatus
    // set locationFilter in state and filter before setting data. This is bad as
    // is makes this component controlled and uncontrolled?
    const { database, initialLocation } = this.props;
    console.log(this.props);
    const fridges = database.objects('Location').filter(location => location.isFridge);
    // TODO: No fridges?
    fridges.unshift({ id: -1, description: LOCALIZATION.misc.allLocations });
    this.LOCATION_FILTERS = fridges;
    this.ITEMS = database.objects('Item').filter(item => item.isVaccine);
    const locationFilter = initialLocation || fridges[0];
    this.setState({ locationFilter });
  };

  /**
   * EVENT HANDLERS
   */

  onNavigateToItem = ({ item } = {}) => {
    // TODO: Navigate to Vaccine Manage Item Page
    // linter complaining about empty stuff
    if (item) setTimeout();
  };

  // Handler for opening and closing modals
  onModalUpdate = ({ modalKey } = {}) => () => {
    if (!modalKey) this.setState({ isModalOpen: false, modalKey: null });
    else this.setState({ isModalOpen: true, modalKey });
  };

  /**
   * RENDER HELPERS
   */
  renderModal = () => {
    const { modalKey } = this.state;
    const { BREACH, FRIDGE_SELECT } = MODAL_KEYS;
    switch (modalKey) {
      case BREACH:
        return <Text>BREACH MODAL HERE</Text>;
      case FRIDGE_SELECT:
        return (
          <GenericChooseModal
            data={this.LOCATION_FILTERS}
            keyToDisplay="description"
            onPress={({ item: locationFilter } = {}) =>
              this.setState({ locationFilter, isModalOpen: false })
            }
          />
        );
      default:
        return null;
    }
  };

  renderCell = (key, item) => {
    const { BREACH } = MODAL_KEYS;
    console.log(key);
    console.log(item[key]);
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
            icon="angle-double-right"
            iconSize={20}
            iconColor={SUSSOL_ORANGE}
            onPress={this.onNavigateToItem}
          />
        );
      case 'quantityInBreach':
        return item.getQuantityInBreach();
      case 'temperatureExposure':
        return formatExposureRange(item[key]);
    }
  };

  renderPageInfo = () => {
    const { locationFilter } = this.state;
    if (!locationFilter) return null;

    const { filter } = PAGE_INFO_COLUMNS;
    const { FRIDGE_SELECT } = MODAL_KEYS;
    const { description } = locationFilter;

    const filterColumn = {
      ...filter,
      onPress: this.onModalUpdate({ modalKey: FRIDGE_SELECT }),
      info: description,
    };

    return <PageInfo columns={[[filterColumn]]} isEditingDisabled={false} />;
  };

  renderTopRight = () => <View style={{ width: 200, height: 1 }} />;

  render() {
    const { genericTablePageStyles, database, topRoute } = this.props;
    const { isModalOpen } = this.state;

    return (
      <GenericPage
        database={database}
        topRoute={topRoute}
        columns={getColumns()}
        data={this.getData()}
        renderCell={this.renderCell}
        renderTopRightComponent={this.renderTopRight}
        refreshData={searchTerm => this.setState({ searchTerm })}
        renderTopLeftComponent={this.renderPageInfo}
        {...genericTablePageStyles}
      >
        {isModalOpen && (
          <PageContentModal isOpen={isModalOpen} onClose={this.onModalUpdate()}>
            <View>{this.renderModal()}</View>
          </PageContentModal>
        )}
      </GenericPage>
    );
  }
}

// const localStyles = StyleSheet.create({});

ManageItemsPage.defaultProps = {};
ManageItemsPage.propTypes = {
  genericTablePageStyles: PropTypes.object.isRequired,
  database: PropTypes.object.isRequired,
  topRoute: PropTypes.object.isRequired,
};

export default ManageItemsPage;
// renderSearchBar = () => <SearchBar color={SUSSOL_ORANGE} onChange={this.onFilterData} />;

// onToggle = () => {
//   const { filterStatus } = this.state;
//   this.setState({ filterStatus: !filterStatus });
// };

// renderFilterToggle = () => {
//   const { filterStatus } = this.state;
//   const { toggle } = LOCALIZATION;
//   return (
//     <View style={{ height: 80 }}>
//       <MiniToggleBar
//         leftText={toggle.location}
//         rightText={toggle.name}
//         onPress={this.onToggle}
//         currentState={filterStatus}
//       />
//     </View>
//   );
// };
