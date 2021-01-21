import React from 'react';
import { View } from 'react-native';

import { Wizard } from '../../widgets';

import { NewSensorStepOne } from './NewSensorStepOne';
import { NewSensorStepTwo } from './NewSensorStepTwo';

const TabThree = () => (
  <View style={{ backgroundColor: 'blue', flex: 1, width: 500, height: 500 }} />
);

const tabs = [
  { component: NewSensorStepOne, name: 'newSensorStepThree', title: '' },
  { component: NewSensorStepTwo, name: 'newSensorStepTwo', title: '' },
  { component: TabThree, name: 'prescription', title: '' },
];

export const NewSensorPage = () => (
  <Wizard captureUncaughtGestures={false} tabs={tabs} useNewStepper />
);
