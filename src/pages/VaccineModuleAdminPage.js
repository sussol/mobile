/* eslint-disable import/prefer-default-export, react/require-default-props  */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { NativeModules, TouchableOpacity, Text } from 'react-native';
import PropTypes from 'prop-types';
// import { generateUUID } from 'react-native-database';
// import { VaccineModuleAdminExpansion } from './expansions/VaccineModuleAdminExpansion';
import { GenericPage } from './GenericPage';
// import { PageButton, PageContentModal, AutocompleteSelector } from '../widgets';
import { IconCell, PageButton, GenericChoiceList, PageContentModal } from '../widgets';
import { updateSensors, parseDownloadedData } from '../utilities/modules/temperatureSensorHelpers';

import { SUSSOL_ORANGE } from '../globalStyles/index';
import { generateUUID } from '../database';

export class VaccineModuleAdminPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      fridges: [],
    };
  }

  componentDidMount() {
    this.refresh();
  }

  refresh = () => {
    const { database } = this.props;
    const fridges = database.objects('Location').filter(({ isFridge }) => isFridge);
    const sensors = database.objects('Sensor');
    this.setState({ fridges: { ...fridges }, sensors });
  };

  selectSensor = fridge => {
    this.setState({ currentFridge: fridge, modalKey: 'selectSensor', isModalOpen: true });
  };

  onSensorSelection = ({ item: sensor }) => {
    const { database } = this.props;
    const { currentFridge } = this.state;
    database.write(() => {
      database.update('Sensor', { id: sensor.id, location: currentFridge });
    });
    this.setState({ currentFridge: null, isModalOpen: false }, this.refresh);
  };

  renderModal = () => {
    const { modalKey, sensors } = this.state;
    switch (modalKey) {
      case 'selectSensor': {
        return (
          <GenericChoiceList
            data={sensors}
            keyToDisplay="macAddress"
            onPress={this.onSensorSelection}
          />
        );
      }
      default: {
        return null;
      }
    }
  };

  renderNewFridgeButton = () => {
    const { database } = this.props;

    // TODO check here that location type with === fridge exists, otherwise warn
    return (
      <PageButton
        text="Add Fridge"
        onPress={() => {
          database.write(() => {
            const locationType = database.objects('LocationType')[0];
            database.update('Location', {
              id: generateUUID(),
              locationType,
              description: 'newFridge',
              code: 'abcdefg', // TODO code should increment code (based on store code)
            });
          });
          this.refresh();
        }}
      />
    );
  };

  refreshSensors = async () => {
    const { runWithLoadingIndicator, database } = this.props;

    await runWithLoadingIndicator(async () => {
      let sensors = [];
      try {
        sensors = await NativeModules.bleTempoDisc.getDevices(51, 20000, '');
        console.log('recevied results ', sensors);
      } catch (e) {
        console.log('rejected ', e.code, e.message);
      }
      updateSensors(sensors, database);
      this.refresh();
    }, true);
  };

  syncSensor = async sensor => {
    const { macAddress } = sensor;
    const { database, runWithLoadingIndicator } = this.props;
    let lastLogTimeStamp = null;
    let pointer = 0;

    if (sensor.sensorLogs.length !== 0) {
      lastLogTimeStamp = sensor.sensorLogs.max('timestamp');
      const lastSensorLog = sensor.sensorLogs.filtered('timestamp == $0', lastLogTimeStamp)[0];
      // eslint-disable-next-line prefer-destructuring
      pointer = lastSensorLog.pointer;
    }

    let downloadedData = {};
    let foundSensors = false;
    await runWithLoadingIndicator(async () => {
      try {
        const sensors = await NativeModules.bleTempoDisc.getDevices(51, 20000, macAddress);

        foundSensors = Object.entries(sensors).length > 0;
        if (foundSensors) {
          updateSensors(sensors, database);
          // TODO: check here if sensor has been reset (i.e. pointer > number of logs)
          downloadedData = await NativeModules.bleTempoDisc.getUARTCommandResults(
            macAddress,
            `*logprt${pointer}`
          );
          console.log(downloadedData);

          this.integrateLogs(downloadedData, lastLogTimeStamp, pointer, sensor);
        } else console.log('cant find senor');
      } catch (e) {
        console.log('rejected ', e);
      }
    }, true);
  };

  integrateLogs = (downloadedData, lastLogTimeStamp, pointer, sensor) => {
    const { database } = this.props;
    // logInterval is in seconds
    const { logInterval, location } = sensor;

    const parsedLogs = parseDownloadedData(downloadedData).temperatureReadings;
    const logIntervalMillisecods = logInterval * 1000;

    if (!lastLogTimeStamp) {
      lastLogTimeStamp = new Date(new Date() - logIntervalMillisecods * parsedLogs.length);
    }
    database.write(() => {
      for (let i = 0; i < parsedLogs.length; i += 1) {
        const currentLog = parsedLogs[i];
        // TODO add to itemBatch and itemBatch sensorLogJoin
        // Also have to think about not creating sync out records until logs are aggregated
        const sensorLog = database.update('SensorLog', {
          id: generateUUID(),
          temperature: currentLog / 10,
          timestamp: new Date(lastLogTimeStamp.getTime() + logIntervalMillisecods * i),
          location,
          sensor,
          logInterval,
          pointer: pointer + i,
        });
        sensor.sensorLogs.push(sensorLog);
      }
    });
  };

  renderRefreshSensors = () => <PageButton text="Refresh Sensors" onPress={this.refreshSensors} />;

  renderCell = (key, fridge) => {
    const { sensors } = this.state;
    const { database } = this.props;
    const hasSensors = sensors.length > 0;
    const fridgeSensor = fridge.getSensor(database);

    const sensorName = () => {
      if (!hasSensors) return 'no sensors';
      if (!fridgeSensor) return 'no sensor attached';
      return fridgeSensor.macAddress;
    };
    switch (key) {
      case 'sensorMacAddress': {
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
      case 'refresh': {
        if (!fridgeSensor) return '';
        return (
          <TouchableOpacity
            style={{ alignSelf: 'center' }}
            onPress={() => this.syncSensor(fridgeSensor)}
          >
            <Text>Sync Sensor</Text>
          </TouchableOpacity>
        );
      }
      default:
        return fridge[key];
    }
  };

  onEndEditing = (key, fridge, description) => {
    const { database } = this.props;

    if (key !== 'description') return;

    database.write(() => {
      database.update('Location', { id: fridge.id, description });
    });
    this.refresh();
  };

  // Needs this otherwise break after onEndEditing
  refreshData = () => {
    /* empty */
  };

  render() {
    const { fridges, isModalOpen } = this.state;
    const { database, topRoute, genericTablePageStyles } = this.props;
    return (
      <GenericPage
        data={fridges}
        renderCell={this.renderCell}
        refreshData={this.refreshData}
        renderTopLeftComponent={this.renderNewFridgeButton}
        renderTopRightComponent={this.renderRefreshSensors}
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
            key: 'sensorMacAddress',
            width: 1,
            title: 'Sensor Mac Address',
            alignText: 'center',
          },
          {
            key: 'refresh',
            width: 1,
            title: '',
            alignText: 'center',
          },
        ]}
        hideSearchBar={true}
        database={database}
        {...genericTablePageStyles}
        topRoute={topRoute}
      >
        {isModalOpen && (
          <PageContentModal isOpen={isModalOpen} title="Select Sensor">
            {this.renderModal()}
          </PageContentModal>
        )}
      </GenericPage>
    );
  }
}

VaccineModuleAdminPage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  navigateTo: PropTypes.func.isRequired,
};
