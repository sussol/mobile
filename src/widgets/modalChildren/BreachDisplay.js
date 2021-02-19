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
import { AfterInteractions } from '../AfterInteractions';

const Breach = ({ breach, getInfoColumns }) => {
  const { temperatureLogs } = breach;
  const lineData = temperatureLogs.map(log => {
    const { timestamp, temperature } = log;
    return { timestamp, temperature };
  });

  return (
    <AfterInteractions>
      <View style={localStyles.container}>
        <PageInfo columns={getInfoColumns(breach)} />
        <BreachChart breach={breach} lineData={lineData} />
      </View>
    </AfterInteractions>
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

  return (
    <AfterInteractions>
      <FlatList data={breaches} renderItem={renderItem} />
    </AfterInteractions>
  );
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
