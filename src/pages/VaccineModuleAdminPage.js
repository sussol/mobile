/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';

import { GenericPage } from './GenericPage';

import { refreshAndUpdateSensors } from '../utilities/modules/temperatureSensorHelpers';
import { IconCell, PageButton, GenericChoiceList, PageContentModal } from '../widgets';

import { SUSSOL_ORANGE } from '../globalStyles/index';
import { generateUUID } from '../database';

export class VaccineModuleAdminPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      fridges: [],
      sensors: [],
      currentFridge: null,
      hasSensors: false,
    };
  }

  componentDidMount() {
    this.refresh();
  }

  refresh = () => {
    const { database } = this.props;
    const locationTypes = database.objects('FridgeLocationType');
    // TODO Warn here that there are not location types of fridge
    this.locationType = locationTypes.length > 0 ? locationTypes[0] : null;
    const fridges = database.objects('Fridge');
    const sensors = database.objects('Sensor');
    const hasSensors = sensors.length > 0;
    this.setState({ fridges, sensors, hasSensors });
  };

  selectSensor = fridge => {
    this.setState({ currentFridge: fridge, isModalOpen: true });
  };

  onSensorSelection = ({ item: sensor }) => {
    const { database } = this.props;
    const { currentFridge: location, sensors } = this.state;
    const { id } = sensor;
    const sensorsAssignedToFridge = sensors.filtered('location.id = $0', location.id);

    database.write(() => {
      sensorsAssignedToFridge.forEach(currentSensor => {
        database.update('Sensor', { id: currentSensor.id, location: null });
      });
      database.update('Sensor', { id, location });
    });
    this.setState({ currentFridge: null, isModalOpen: false }, this.refresh);
  };

  renderSelectSensorModal = () => {
    const { database } = this.props;
    const { sensors, currentFridge } = this.state;
    const fridgeSensor = currentFridge.getSensor(database);
    const highlightValue = fridgeSensor || (fridgeSensor && fridgeSensor.toString());

    return (
      <GenericChoiceList
        data={sensors}
        keyToDisplay="toString"
        onPress={this.onSensorSelection}
        highlightValue={highlightValue}
      />
    );
  };

  onNewFridgeButtonPress = () => {
    const { database } = this.props;
    const { locationType } = this;
    const { fridges } = this.state;
    database.write(() => {
      database.update('Location', {
        id: generateUUID(),
        locationType,
        description: 'newFridge',
        code: `${fridges.length + 1}`, // TODO code should increment code (based on store code)
      });
    });
    this.refresh();
  };

  onRefreshSensorsPress = async () => {
    const { runWithLoadingIndicator, database } = this.props;

    await runWithLoadingIndicator(async () => {
      await refreshAndUpdateSensors(runWithLoadingIndicator, database);
    }, true);
    this.refresh();
  };

  renderCell = (key, fridge) => {
    const { hasSensors } = this.state;
    const { database } = this.props;
    const fridgeSensor = fridge.getSensor(database);

    const sensorName = () => {
      if (!hasSensors) return 'no sensors';
      if (!fridgeSensor) return 'no sensor attached';
      return fridgeSensor.toString;
    };
    switch (key) {
      case 'sensorInfo': {
        return (
          <IconCell
            text={sensorName()}
            disabled={!hasSensors}
            icon={hasSensors ? 'caret-up' : 'times'}
            iconColour={SUSSOL_ORANGE}
            onPress={() => this.selectSensor(fridge)}
          />
        );
      }
      case 'description':
        return {
          type: 'editable',
          cellContents: fridge.description,
          keyboardType: 'default',
        };
      default:
        return fridge[key];
    }
  };

  onEndEditing = (key, fridge, description) => {
    if (key !== 'description') return;

    const { database } = this.props;

    database.write(() => {
      database.update('Location', { id: fridge.id, description });
    });
    this.refresh();
  };

  render() {
    const { fridges, isModalOpen } = this.state;
    const { locationType } = this;
    const { database, topRoute, genericTablePageStyles } = this.props;
    return (
      <GenericPage
        data={fridges}
        renderCell={this.renderCell}
        refreshData={() => {
          /* need this otherwithe error after onEndEditing */
        }}
        renderTopLeftComponent={() => (
          <PageButton
            text="Add Fridge"
            isDisabled={!locationType}
            onPress={this.onNewFridgeButtonPress}
          />
        )}
        renderTopRightComponent={() => (
          <PageButton text="Refresh Sensors" onPress={this.onRefreshSensorsPress} />
        )}
        onEndEditing={this.onEndEditing}
        columns={[
          {
            key: 'description',
            width: 1,
            title: 'Fridge Name',
            alignText: 'right',
          },
          {
            key: 'code',
            width: 1,
            title: 'Fridge Code',
            alignText: 'center',
          },
          {
            key: 'sensorInfo',
            width: 1,
            title: 'Sensor Mac Address',
            alignText: 'center',
          },
        ]}
        hideSearchBar={true}
        database={database}
        {...genericTablePageStyles}
        topRoute={topRoute}
      >
        {isModalOpen && (
          <PageContentModal
            isOpen={isModalOpen}
            onClose={() => this.setState({ isModalOpen: false })}
            title="Select Sensor"
          >
            {this.renderSelectSensorModal()}
          </PageContentModal>
        )}
      </GenericPage>
    );
  }
}

VaccineModuleAdminPage.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object.isRequired,
  topRoute: PropTypes.bool.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,
};

export default VaccineModuleAdminPage;
