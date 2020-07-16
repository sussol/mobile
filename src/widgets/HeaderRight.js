/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';

import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { selectUsingVaccines } from '../selectors/modules';
import { SyncState } from './SyncState';
import { FlexRow } from './FlexRow';
import { TemperatureSyncState } from './TemperatureSyncState';

const mapStateToProps = state => {
  const usingVaccines = selectUsingVaccines(state);

  return { usingVaccines };
};

const HeaderRightComponent = ({ usingVaccines }) => (
  <FlexRow>
    {usingVaccines && <TemperatureSyncState />}
    <SyncState />
  </FlexRow>
);

HeaderRightComponent.propTypes = {
  usingVaccines: PropTypes.bool.isRequired,
};

export const HeaderRight = connect(mapStateToProps)(HeaderRightComponent);
