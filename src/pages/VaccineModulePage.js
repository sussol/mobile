/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { NativeModules } from 'react-native';
import PropTypes from 'prop-types';
import { VaccineModuleExpansion } from './expansions/VaccineModuleExpansion';
import { GenericPage } from './GenericPage';
import { PageButton, PageContentModal, AutocompleteSelector } from '../widgets';
import { generateUUID } from 'react-native-database';
import { sortDataBy, updateSensors, getFormatedPeriod } from '../utilities';

/**
 * Renders the page for all Items and their stock, with expansion of further details.
 * @prop   {Realm}               database    App wide database.
 * @prop   {func}                navigateTo  CallBack for navigation stack.
 * @state  {Realm.Results}       items       Contains all Items stored on the local database.
 */
export class VaccineModulePage extends React.Component {
  constructor(props) {
    super(props);
    this.locations = props.database.objects('Location');
    this.state = {
      modalKey: null,
      modalIsOpen: false,
      selection: [],
    };
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'name',
      isAscending: true,
    };
  }

  onEndEditing = (key, location, newValue) => {
    this.props.database.write(() => {
      location[key] = newValue;
      this.props.database.save('Location', location);
    });
  };

  getModalTitle = () => {
    switch (this.state.modalKey) {
      default:
      case 'sensorSelect':
        return 'Select Sensor';
    }
  };

  updateDataFilters = (newSortBy, newIsAscending) => {
    // We use != null, which checks for both null or undefined (undefined coerces to null)
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  };

  refreshButtonClick = async () => {
    let sensors = {};
    const { database } = this.props;

    await this.props.runWithLoadingIndicator(async () => {
      try {
        sensors = await NativeModules.bleTempoDisc.getDevices(51, 20000, '');
        console.log('recevied results ', sensors);
      } catch (e) {
        console.log('rejected ', e.code, e.message);
      }
      updateSensors(sensors, database);
    }, true);

    if (Object.entries(sensors).length > 0) {
      this.refreshData();
    }
  };

  addFridgeClick = () => {
    this.props.database.write(() => {
      this.props.database.create('Location', {
        id: generateUUID(),
      });
    });
  };

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  refreshData = (newSearchTerm, newSortBy, newIsAscending) => {
    this.updateDataFilters(newSortBy, newIsAscending);
    const { sortBy, isAscending } = this.dataFilters;
    this.setState({ data: sortDataBy(this.locations, sortBy, 'realm', isAscending) });
  };

  openModal = (key, location) => {
    this.expandedLocation = location;
    this.setState({ modalKey: key, modalIsOpen: true });
  };

  closeModal = () => this.setState({ modalIsOpen: false });

  renderAddFridge = () => <PageButton text={'ADD FRIDGE'} onPress={this.addFridgeClick} />;

  renderCell = (key, location) => {
    switch (key) {
      case 'possibleDamagedStock':
      case 'stockCount':
        return location[key](this.props.database);
      case 'latestTemperatureTimestamp': {
        const latestTemperatureTimestamp = location[key];

        return latestTemperatureTimestamp
          ? getFormatedPeriod(new Date() - latestTemperatureTimestamp)
          : '';
      }
      case 'latestTemperature': {
        const latestTemperature = location[key];
        return latestTemperature ? latestTemperature.toFixed(1) : '';
      }
      case 'name':
        return {
          type: 'editable',
          cellContents: location[key] !== '' ? location[key] : 'Unnamed Fridge',
          keyboardType: 'default',
        };
      default:
        if (typeof location[key] !== 'undefined' && location[key] !== null) return location[key];
    }
    return '';
  };

  renderExpansion = location => (
    <VaccineModuleExpansion
      location={location}
      database={this.props.database}
      navigateTo={this.props.navigateTo}
      genericTablePageStyles={this.props.genericTablePageStyles}
      openModal={this.openModal}
      runWithLoadingIndicator={this.props.runWithLoadingIndicator}
    />
  );

  renderRefreshButton = () => (
    <PageButton text={'REFRESH SENSORS'} onPress={this.refreshButtonClick} />
  );

  renderModalContent = () => {
    switch (this.state.modalKey) {
      default:
      case 'sensorSelect': {
        const Sensors = this.props.database.objects('Sensor');

        return (
          <AutocompleteSelector
            hideSearchBar={true}
            options={Sensors}
            sortByString={'name'}
            onSelect={sensor => {
              this.props.database.write(() => {
                this.expandedLocation.sensor = sensor;
              });
              this.props.database.save('Location', this.expandedLocation);
              this.closeModal();
            }}
            renderLeftText={sensor => `${sensor.name}`}
            renderRighText={() => 'blink me'}
          />
        );
      }
      case 'addVaccineBatch': {
        const itemBatchSelection = this.props.database
          .objects('ItemBatch')
          .filtered(
            'item.locationType.id != null and numberOfPacks > 0 and location.id != $0',
            this.expandedLocation.id,
          );

        return (
          <AutocompleteSelector
            options={itemBatchSelection}
            hideSearchBar={true}
            sortByString={'batch'}
            onSelect={itemBatch => {
              this.props.database.write(() => {
                itemBatch.location = this.expandedLocation;
                this.props.database.save('ItemBatch', itemBatch);
              });
              this.closeModal();
            }}
            renderLeftText={itemBatch => `${itemBatch.itemName} batch: ${itemBatch.batch} `}
            renderRightText={itemBatch => `${itemBatch.totalQuantity}`}
          />
        );
      }
    }
  };

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        onEndEditing={this.onEndEditing}
        defaultSortKey={this.dataFilters.sortBy}
        renderExpansion={this.renderExpansion}
        renderTopLeftComponent={this.renderRefreshButton}
        renderTopRightComponent={this.renderAddFridge}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'name',
            width: 1,
            title: 'Fridge Name',
            alignText: 'right',
            sortable: true,
          },
          {
            key: 'latestTemperature',
            width: 1,
            title: 'Latest Temp',
            sortable: true,
            alignText: 'center',
          },
          {
            key: 'latestTemperatureTimestamp',
            width: 1,
            title: 'Last Sensor\nConnection',
            sortable: true,
            alignText: 'center',
          },
          {
            key: 'stockCount',
            width: 1,
            title: 'Stock Count',
            sortable: true,
            alignText: 'center',
          },
          {
            key: 'possibleDamagedStock',
            width: 1,
            title: 'Possible\nDamaged Stock',
            sortable: true,
            alignText: 'center',
          },
        ]}
        dataTypesLinked={['Location', 'Sensor', 'ItemBatch']}
        hideSearchBar={true}
        database={this.props.database}
        {...this.props.genericTablePageStyles}
        topRoute={this.props.topRoute}
      >
        <PageContentModal
          isOpen={this.state.modalIsOpen}
          onClose={this.closeModal}
          title={this.getModalTitle()}
        >
          {this.renderModalContent()}
        </PageContentModal>
      </GenericPage>
    );
  }
}

VaccineModulePage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  navigateTo: PropTypes.func.isRequired,
};
