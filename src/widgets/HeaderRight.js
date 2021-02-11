/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';

import { SyncState } from './SyncState';
import { FlexRow } from './FlexRow';

import { SettingsIcon } from './SettingsIcon';

export const HeaderRight = () => (
  <FlexRow style={{ alignItems: 'center' }}>
    <SyncState />
    <SettingsIcon />
  </FlexRow>
);
