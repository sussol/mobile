import React from 'react';
import { View } from 'react-native';

import { Wizard } from '../../widgets/index';

import { NewSensorStepOne } from './NewSensorStepOne';

const TabTwo = () => (
  <View style={{ backgroundColor: 'green', flex: 1, width: 500, height: 500 }} />
);
const TabThree = () => (
  <View style={{ backgroundColor: 'blue', flex: 1, width: 500, height: 500 }} />
);

const tabs = [
  { component: NewSensorStepOne, name: 'prescription', title: '' },
  { component: TabTwo, name: 'prescription', title: '' },
  { component: TabThree, name: 'prescription', title: '' },
];

export const NewSensorPage = () => <Wizard tabs={tabs} useNewStepper />;
