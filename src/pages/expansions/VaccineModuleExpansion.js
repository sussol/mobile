/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { View, NativeModules } from 'react-native';
import PropTypes from 'prop-types';
import { Expansion } from 'react-native-data-table';
import globalStyles, { dataTableStyles, expansionPageStyles } from '../../globalStyles';
import { PageButton, PageInfo } from '../../widgets';
import { GenericPage } from '../GenericPage';
import {
  getFormatedPeriod,
  parseDownloadedData,
  calculateNewLogs,
  updateSensors,
} from '../../utilities';

/**
 * Renders page to be displayed in StocktakeEditPage -> expansion.
 * @prop   {Realm}               database        App wide database.
 * @prop   {Realm.object}        stocktakeItem   The stocktakeItem, a parent of
 *                                               StocktakeBatches in this expansion
 */
export class VaccineModuleExpansion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onRowPress = vaccineBatch => {
    const { sensor } = vaccineBatch.location;
    const sensorLogs = sensor ? sensor.sensorLogs : [];
    this.props.navigateTo('vaccineBatch', vaccineBatch.item.name, {
      vaccineBatch,
      sensorLogs,
    });
  };

  assignVaccineBatch = () => this.props.openModal('addVaccineBatch', this.props.location);

  downloadLog = async () => {
    const { address } = this.props.location.sensor;
    let downloadedData = {};
    let foundSensors = false;
    await this.props.runWithLoadingIndicator(async () => {
      try {
        const sensors = await NativeModules.bleTempoDisc.getDevices(51, 20000, address);

        foundSensors = Object.entries(sensors).length > 0;
        if (foundSensors) {
          updateSensors(sensors, this.props.database);
          downloadedData = await NativeModules.bleTempoDisc.getUARTCommandResults(
            address,
            '*logall',
          );
          this.porcessDownloadedData(downloadedData, this.props.location.sensor);
        } else console.log('cant find senor');
      } catch (e) {
        console.log('rejected ', e);
      }
    }, true);
    // Refresh expansion and parent page
    if (foundSensors) {
      this.props.database.write(() => {
        this.props.database.save('Sensor', this.props.location.sensor);
      });
    }
  };

  porcessDownloadedData = (downloadedData, sensor) => {
    console.log(downloadedData);
    const resultLog = parseDownloadedData(downloadedData);
    const { database } = this.props;

    if (resultLog.failedParsing) return; // TODO Notify of problems

    const newLogData = calculateNewLogs({
      sensor,
      currentDate: new Date(),
      lastSensorLog: sensor.sensorLogs.length > 0 && sensor.sensorLogs.sorted('timestamp', true)[0],
      ...resultLog,
    });

    database.write(() => {
      newLogData.logsToAdd.forEach(log => {
        const newLog = database.create('SensorLog', { ...log });
        sensor.sensorLogs.push(newLog);
      });
      sensor.latestDownloadDate = new Date();
    });
  };

  openSensorSelector = () => this.props.openModal('sensorSelect', this.props.location);

  refreshData = () => {
    const data = this.props.database
      .objects('ItemBatch')
      .filtered('numberOfPacks > 0 and location.id = $0', this.props.location.id)
      .slice();
    this.setState({ data });
  };

  renderButtons = () => {
    const { sensor } = this.props.location;
    return (
      <View style={globalStyles.pageTopRightSectionContainer}>
        <View style={globalStyles.verticalContainer}>
          <PageButton
            style={globalStyles.leftButton}
            text={'Download Sensor Log'}
            isDisabled={!sensor}
            onPress={this.downloadLog}
          />
        </View>
        <View style={globalStyles.verticalContainer}>
          <PageButton
            style={globalStyles.topButton}
            text={'Assign Sensor to Fridge'}
            onPress={this.openSensorSelector}
          />
          <PageButton text={'Assign Vaccine Batch to Fridge'} onPress={this.assignVaccineBatch} />
        </View>
      </View>
    );
  };

  renderPageInfo = () => {
    const sensor = this.props.location.sensor;
    if (typeof sensor === 'undefined' || sensor === null) {
      return (
        <PageInfo
          columns={[
            [
              {
                title: 'No Assigned Sensor',
              },
            ],
          ]}
        />
      );
    }

    let lastLogDownload = 'No downloaded logs';

    if (sensor.latestDownloadDate && sensor.latestDownloadDate.getFullYear() > 2000) {
      lastLogDownload = getFormatedPeriod(new Date() - sensor.latestDownloadDate);
    }

    const infoColumns = [
      [
        {
          title: 'Sensor:',
          info: sensor.name,
        },
        {
          title: 'Battery Level:',
          info: `${sensor.latestBatteryLevel}%`,
        },
        {
          title: 'Last Log Download:',
          info: lastLogDownload,
        },
      ],
    ];
    return <PageInfo columns={infoColumns} />;
  };

  renderCell = (key, vaccineBatch) => vaccineBatch[key];

  render() {
    return (
      <Expansion style={dataTableStyles.expansionWithInnerPage}>
        <GenericPage
          data={this.state.data}
          renderCell={this.renderCell}
          refreshData={this.refreshData}
          hideSearchBar={true}
          renderDataTableFooter={() => null} // overrides default generc pages footer
          renderTopLeftComponent={this.renderPageInfo}
          onRowPress={this.onRowPress}
          renderTopRightComponent={this.renderButtons}
          columns={[
            {
              key: 'itemCode',
              width: 1,
              title: 'ITEM CODE',
              alignText: 'center',
            },
            {
              key: 'itemName',
              width: 2,
              title: 'ITEM NAME',
              alignText: 'center',
            },
            {
              key: 'batch',
              width: 1,
              title: 'BATCH',
              alignText: 'center',
            },
            {
              key: 'totalQuantity',
              width: 1,
              title: 'QUANTITY',
              alignText: 'center',
            },
            {
              key: 'thresholdTemperature',
              width: 1,
              title: 'THRESHOLD\nTEMPERATURE',
              alignText: 'center',
            },
            ...(this.props.location.sensor !== null
              ? [
                  {
                    key: 'temperatureExposure',
                    width: 1,
                    title: 'TEMPERATURE\nEXPOSURE',
                    alignText: 'center',
                  },
                ]
              : []),
          ]}
          dataTypesLinked={['Location', 'Sensor', 'ItemBatch']}
          database={this.props.database}
          {...this.props.genericTablePageStyles}
          pageStyles={expansionPageStyles}
        />
      </Expansion>
    );
  }
}

VaccineModuleExpansion.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  openModal: PropTypes.func.isRequired,
  location: PropTypes.object,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  navigateTo: PropTypes.func.isRequired,
};
