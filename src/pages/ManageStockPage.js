/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { View, Text } from 'react-native';

import { GenericPage } from './GenericPage';
import { IconCell, PageInfo, PageContentModal, GenericChoiceList } from '../widgets';
import { SUSSOL_ORANGE } from '../globalStyles';

import { formatExposureRange } from '../utilities';

/**
 * CONSTANTS
 */
const MODAL_KEYS = {
  BREACH: 'breach',
  FRIDGE_SELECT: 'fridgeSelect',
};

// TODO: Localizatiopn
const LOCALIZATION = {
  pageInfo: {
    filter: 'Filter by Location',
  },
  headers: {
    name: 'ITEM NAME',
    code: 'ITEM CODE',
    totalBatchesInStock: 'NUMBER OF BATCHES',
    totalQuantity: 'QUANTITY',
    hasBreach: 'BREACH',
    navigation: 'MANAGE',
    quantityInBreach: 'QUANTITY IN BREACH',
    temperatureExposure: 'TEMPERATURE EXPOSURE',
  },
  misc: {
    allLocations: 'All locations',
  },
};

const TABLE_COLUMNS = {
  name: { key: 'name', width: 1.5, title: LOCALIZATION.headers.name, alignText: 'left' },
  code: { key: 'code', width: 0.6, title: LOCALIZATION.headers.code, alignText: 'left' },
  totalBatchesInStock: {
    key: 'totalBatchesInStock',
    width: 0.8,
    title: LOCALIZATION.headers.totalBatchesInStock,
    alignText: 'right',
  },
  totalQuantity: {
    key: 'totalQuantity',
    width: 0.5,
    title: LOCALIZATION.headers.totalQuantity,
    alignText: 'right',
  },
  hasBreach: {
    key: 'hasBreach',
    width: 0.5,
    title: LOCALIZATION.headers.hasBreach,
    alignText: 'left',
  },
  navigation: {
    key: 'navigation',
    width: 0.5,
    title: LOCALIZATION.headers.navigation,
    alignText: 'left',
  },
  quantityInBreach: {
    key: 'quantityInBreach',
    width: 0.8,
    title: LOCALIZATION.headers.quantityInBreach,
    alignText: 'right',
  },
  temperatureExposure: {
    key: 'temperatureExposure',
    width: 1,
    title: LOCALIZATION.headers.temperatureExposure,
    alignText: 'center',
  },
};

const KEY_TO_FUNCTION_MAPPINGS = {
  totalBatchesInStock: 'getNumberOfBatches',
  hasBreach: 'getHasBreachedBatches',
  quantityInBreach: 'getQuantityInBreach',
  temperatureExposure: 'getTemperatureExposure',
  totalQuantity: 'getQuantityInLocation',
};

const VACCINE_COLUMN_KEYS = [
  'code',
  'name',
  'totalBatchesInStock',
  'totalQuantity',
  'quantityInBreach',
  'temperatureExposure',
  'hasBreach',
  'navigation',
];

/**
 * HELPER METHODS
 */
const getColumns = () => VACCINE_COLUMN_KEYS.map(key => TABLE_COLUMNS[key]);

/**
 * Page for managing items. Used for vaccine items currently.
 * Renders a table, searchable by Item.code or Item.name. Can
 * apply a location filter showing items for that location and
 * altering the data within the table to be values for that
 * location only.
 * Only props required are acquired through redux.
 * Optional prop of initialLocation, pre-filtering the list of
 * items.
 */
export class ManageStockPage extends React.Component {
  constructor(props) {
    super(props);

    // List of location objects populated in ComponentDidMount.
    // Has a special object for 'No Location' to be selected,
    // which has no ID
    this.LOCATION_FILTERS = null;
    // Store for all items. Is used to apply location and searchTerm
    // filters and derive the next GenericDataTable data prop.
    this.ITEMS = null;

    this.state = {
      // Key determining which modal should be rendered. Uses
      // MODAL_KEYS constant.
      modalKey: null,
      isModalOpen: false,
      // Filter variables: Location object from this.LOCATION_FILTERS.
      // and searchTerm key from the search bar in GenericDataTable.
      locationFilter: null,
      searchTerm: '',
    };
  }

  /**
   * HELPER METHODS
   */

  // Called on every render(). Applies the location filter then
  // searchTerm filter on this.ITEMS.
  getData = () => {
    const { locationFilter, searchTerm } = this.state;
    if (!locationFilter) return [];
    const { id } = locationFilter;
    let data = this.ITEMS;
    if (id) {
      data = data.filtered('batches.numberOfPacks > 0 && batches.location.id = $0', id);
    }
    if (searchTerm) {
      data = data.filtered('code BEGINSWITH[c] $0 OR name BEGINSWITH[c] $0', searchTerm);
    }
    return data;
  };

  /**
   * COMPONENT METHODS
   */

  // On mounting, fetch the data for this.LOCATION_FILTERS and this.ITEMS.
  // Prepend a 'special' location object for all locations with no ID
  // for 'No filter', and to display 'All locations' in the drop down. If
  // there are no locations/fridges only the All locations filter will
  // be available.
  componentDidMount = () => {
    const { database, initialLocation } = this.props;
    const fridges = database.objects('Location').filter(location => location.isFridge);
    fridges.unshift({ description: LOCALIZATION.misc.allLocations });
    this.LOCATION_FILTERS = fridges;
    this.ITEMS = database.objects('Item').filtered('name.category MATCHES[c] $0', 'vaccine');
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

  // Handler for opening and closing modals. Whichever key from
  // MODAL_KEYS is passed will be the modal which is rendered. If
  // no key is passed, the current modal will be closed.
  onModalUpdate = ({ modalKey } = {}) => () => {
    if (!modalKey) this.setState({ isModalOpen: false, modalKey: null });
    else this.setState({ isModalOpen: true, modalKey });
  };

  /**
   * RENDER HELPERS
   */
  renderModal = () => {
    const { modalKey, locationFilter: highlightValue } = this.state;
    const { BREACH, FRIDGE_SELECT } = MODAL_KEYS;

    switch (modalKey) {
      case BREACH:
        return <Text>BREACH MODAL HERE</Text>;
      case FRIDGE_SELECT:
        return (
          <GenericChoiceList
            data={this.LOCATION_FILTERS}
            highlightValue={highlightValue.description}
            keyToDisplay="description"
            onPress={({ item: locationFilter }) =>
              this.setState({ locationFilter, isModalOpen: false })
            }
          />
        );
      default:
        return null;
    }
  };

  // Renders each cell such that the value used to display comes from
  // Item helper methods. If there is a location set as the current
  // locationFilter - the values will come from that particular location.
  renderCell = (key, item) => {
    const { locationFilter } = this.state;
    const { BREACH } = MODAL_KEYS;
    const emptyCell = { type: 'text', cellContents: '' };
    const functionToCall = KEY_TO_FUNCTION_MAPPINGS[key];
    switch (key) {
      default:
        return item[functionToCall](locationFilter);
      case 'name':
      case 'code':
        return item[key];
      case 'hasBreach':
        if (item[functionToCall](locationFilter)) return emptyCell;
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
      case 'temperatureExposure':
        return formatExposureRange(item[functionToCall](locationFilter));
    }
  };

  renderPageInfo = () => {
    const { locationFilter } = this.state;
    if (!locationFilter) return null;

    const filterColumn = {
      title: LOCALIZATION.pageInfo.filter,
      editableType: 'selectable',
      onPress: this.onModalUpdate({ modalKey: MODAL_KEYS.FRIDGE_SELECT }),
      info: locationFilter.description,
    };

    return <PageInfo columns={[[filterColumn]]} isEditingDisabled={false} />;
  };

  // Empty component to reduce the size of the search bar.
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

ManageStockPage.defaultProps = {
  initialLocation: null,
};
ManageStockPage.propTypes = {
  genericTablePageStyles: PropTypes.object.isRequired,
  database: PropTypes.object.isRequired,
  topRoute: PropTypes.object.isRequired,
  initialLocation: PropTypes.object,
};

export default ManageStockPage;
