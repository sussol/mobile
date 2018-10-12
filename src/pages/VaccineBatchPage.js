/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { sortDataBy, getFormatedPeriod, formatDate } from '../utilities';
import { GenericPage } from './GenericPage';
import globalStyles from '../globalStyles';
import { ToggleBar, PageInfo } from '../widgets';

// TODO: Localise strings, group table output

export class VaccineBatchPage extends React.Component {
  constructor(props) {
    super(props);
    this.dataFilters = {
      searchKey: '',
      sortBy: 'timestamp',
      isAscending: true,
    };

    this.state = {
      data: [],
      showAll: true,
      ...this.calculateBreachSummary(),
    };
  }

  onToggleFilter = showAll => this.setState({ showAll }, this.refreshData);

  updateDataFilters = (newSortBy, newIsAscending) => {
    // We use != null, which checks for both null or undefined (undefined coerces to null)
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  };

  calculateBreachSummary = () => {
    const { vaccineBatch, sensorLogs } = this.props;

    const arrivalDate = vaccineBatch.addedDate;

    const {
      minTemperature: thresholdMinTemperature,
      maxTemperature: thresholdMaxTemperature,
    } = vaccineBatch.item.locationType;

    const returnInfo = {
      arrivalDate,
    };

    if (sensorLogs.length === 0) return returnInfo;

    const temperatures = sensorLogs.filtered('timestamp > $0', arrivalDate);

    if (temperatures.length === 0) return returnInfo;

    const breaches = temperatures.filtered(
      'value < $0 or $1 < value',
      thresholdMinTemperature,
      thresholdMaxTemperature,
    );

    if (breaches.length === 0) return returnInfo;

    const sortedBreaches = breaches.sorted('timestamp');

    const possibleBreachTemperatures = temperatures
      .filtered(
        '$0 <= timestamp and timestamp <= $1',
        sortedBreaches[0].timestamp,
        sortedBreaches[sortedBreaches.length - 1].timestamp,
      )
      .sorted('timestamp');

    const breachDurations = [0];
    let count = 0;
    let expectedNextDate;
    let previousDate;
    expectedNextDate = previousDate = possibleBreachTemperatures[0].timestamp;

    const incremeantBreachCount = () => {
      if (breachDurations[count] !== 0) breachDurations[++count] = 0;
    };
    const resetDates = temperatureReading => {
      expectedNextDate = new Date(temperatureReading.timestamp);
      previousDate = new Date(temperatureReading.timestamp);
      expectedNextDate.setSeconds(expectedNextDate.getSeconds() + temperatureReading.logInterval);
    };

    possibleBreachTemperatures.forEach(temperatureReading => {
      if (
        expectedNextDate > temperatureReading.timestamp ||
        (temperatureReading.value >= thresholdMinTemperature &&
          thresholdMaxTemperature >= temperatureReading.value)
      ) {
        incremeantBreachCount();
      } else breachDurations[count] += (temperatureReading.timestamp - previousDate) / 1000;

      resetDates(temperatureReading);
    });

    const breachDurationsSorted = breachDurations.sort((a, b) => b - a);
    returnInfo.breachCount = breachDurations.length;
    returnInfo.longestBreachDuration = breachDurationsSorted[0];

    return returnInfo;
  };

  refreshData = (newSearchTerm, newSortBy, newIsAscending) => {
    if (this.props.sensorLogs.length === 0) {
      this.setState({
        data: [],
      });
      return;
    }

    this.updateDataFilters(newSortBy, newIsAscending);
    const { sortBy, isAscending } = this.dataFilters;
    const { minTemperature, maxTemperature } = this.props.vaccineBatch.item.locationType;
    let filteredData = this.props.sensorLogs.filtered('timestamp >= $0', this.state.arrivalDate);

    if (!this.state.showAll) {
      filteredData = filteredData.filtered(
        'value < $0 or value > $1',
        minTemperature,
        maxTemperature,
      );
    }

    this.setState({
      data: sortDataBy(filteredData, sortBy, 'realm', isAscending),
    });
  };

  renderToggleBar = () => (
    <ToggleBar
      style={globalStyles.toggleBar}
      textOffStyle={globalStyles.toggleText}
      textOnStyle={globalStyles.toggleTextSelected}
      toggleOffStyle={globalStyles.toggleOption}
      toggleOnStyle={globalStyles.toggleOptionSelected}
      toggles={[
        {
          text: 'SHOW ALL',
          onPress: () => this.onToggleFilter(true),
          isOn: this.state.showAll,
        },
        {
          text: 'SHOW BREACHES',
          onPress: () => this.onToggleFilter(false),
          isOn: !this.state.showAll,
        },
      ]}
    />
  );

  renderPageInfo = () => {
    const { batch, location, temperatureExposure, thresholdTemperature } = this.props.vaccineBatch;
    const { longestBreachDuration, breachCount, arrivalDate } = this.state;

    const undefinedOrNull = variable => typeof variable === 'undefined' || variable === null;

    const infoColumns = [
      [
        {
          title: 'Batch Name:',
          info: batch,
        },
        {
          title: 'Fridge Name:',
          info: location.name === '' ? 'Unnamed Fridge' : location.name,
        },
        {
          title: 'Date Arrived at Facility:',
          info: arrivalDate.toDateString(),
        },
        {
          title: 'Treshold Temperature:',
          info: thresholdTemperature,
        },
        ...(temperatureExposure === ''
          ? []
          : [
              {
                title: 'Temperature Exposure:',
                info: temperatureExposure,
              },
            ]),
        ...(undefinedOrNull(breachCount)
          ? []
          : [
              {
                title: 'Number of Breaches:',
                info: breachCount,
              },
              {
                title: 'Longest Temperature Breach:',
                info: getFormatedPeriod(longestBreachDuration * 1000),
              },
            ]),
      ],
    ];
    return <PageInfo columns={infoColumns} />;
  };

  renderCell = (key, sensorLog) => {
    if (key === 'timestamp') {
      const twoDigit = number => (number < 10 ? `0${number}` : number);
      const timestamp = sensorLog[key];
      return ` ${formatDate(timestamp)} ${twoDigit(timestamp.getHours())}:${twoDigit(
        timestamp.getMinutes(),
      )}`; // eslint-disable-line max-len
    }
    if (key === 'value') return sensorLog[key].toFixed(1);
    return sensorLog[key];
  };

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        hideSearchBar={true}
        onEndEditing={this.onEndEditing}
        onSelectionChange={this.onSelectionChange}
        renderTopLeftComponent={this.renderPageInfo}
        renderTopRightComponent={this.renderToggleBar}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'timestamp',
            width: 1,
            title: 'DATE/TIME',
            sortable: true,
          },
          {
            key: 'value',
            width: 1,
            title: 'TEMPERATURE',
            sortable: true,
          },
          {
            key: 'logInterval',
            width: 1,
            title: 'LOG INTERVAL',
            alignText: 'right',
          },
        ]}
        database={this.props.database}
        {...this.props.genericTablePageStyles}
        topRoute={this.props.topRoute}
      />
    );
  }
}

VaccineBatchPage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  vaccineBatch: PropTypes.object,
  sensorLogs: PropTypes.object,
  topRoute: PropTypes.bool,
  navigateTo: PropTypes.func.isRequired,
};
