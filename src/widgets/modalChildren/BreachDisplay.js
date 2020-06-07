/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { connect } from 'react-redux';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';

import { getPageInfoColumns } from '../../pages/dataTableUtilities';
import { chunk } from '../../utilities/chunk';

import { BreachChart } from '../BreachChart';
import { PageInfo } from '../PageInfo';

import { WHITE, SUSSOL_ORANGE } from '../../globalStyles';

const Breach = ({ breach, getInfoColumns }) => {
  const { temperatureLogs } = breach;

  const [chartData, setChartData] = React.useState({ lineData: [], render: false });
  const { render, lineData } = chartData;

  React.useEffect(() => {
    const { length: numberOfLogs } = temperatureLogs;
    setTimeout(() => {
      const chunkSize = Math.ceil(numberOfLogs / Math.min(numberOfLogs, 30));
      const chunkedLogs = chunk(temperatureLogs, chunkSize);
      const mappedLineData = chunkedLogs.map(chunkOfLogs => ({
        temperature: Math.max(...chunkOfLogs.map(({ temperature }) => temperature)),
        timestamp: Math.max(...chunkOfLogs.map(({ timestamp }) => timestamp)),
      }));

      setChartData({ lineData: mappedLineData, render: true });
    }, 1000);
  }, []);

  const pageInfoColumns = React.useMemo(() => getInfoColumns(breach), [breach]);

  const Display = React.useCallback(
    () =>
      render ? (
        <BreachChart breach={breach} lineData={lineData} />
      ) : (
        <ActivityIndicator color={SUSSOL_ORANGE} size="small" />
      ),
    [render]
  );

  return (
    <View style={localStyles.container}>
      <PageInfo columns={pageInfoColumns} />
      <Display />
    </View>
  );
};

Breach.propTypes = {
  breach: PropTypes.object.isRequired,
  getInfoColumns: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { breach } = state;
  const { breaches } = breach;

  return { breaches };
};

const BreachDisplayComponent = ({ breaches }) => {
  const getBreachPageInfoColumns = React.useMemo(() => getPageInfoColumns('breach'), []);

  const renderItem = React.useCallback(
    ({ item }) => <Breach getInfoColumns={getBreachPageInfoColumns} breach={item} />,
    [breaches]
  );

  return <FlatList data={breaches} renderItem={renderItem} />;
};

BreachDisplayComponent.propTypes = {
  breaches: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
};

export const BreachDisplay = connect(mapStateToProps)(BreachDisplayComponent);

const localStyles = StyleSheet.create({
  container: {
    height: 400,
    elevation: 3,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: WHITE,
  },
});
