/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { connect } from 'react-redux';
import { View, FlatList, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { getPageInfoColumns } from '../../pages/dataTableUtilities';

import { BreachChart } from '../BreachChart';
import { PageInfo } from '../PageInfo/PageInfo';

import { WHITE } from '../../globalStyles';

const Breach = ({ breach, getInfoColumns }) => {
  const { temperatureLogs } = breach;
  const lineData = temperatureLogs.map(log => {
    const { timestamp, temperature } = log;
    return { timestamp, temperature };
  });

  return (
    <View style={localStyles.container}>
      <PageInfo columns={getInfoColumns(breach)} />
      <BreachChart breach={breach} lineData={lineData} />
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
    padding: 10,
  },
});
