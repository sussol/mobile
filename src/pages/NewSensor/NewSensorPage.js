import React from 'react';

import { Wizard } from '../../widgets';

import { NewSensorStepOne } from './NewSensorStepOne';
import { NewSensorStepThree } from './NewSensorStepThree';
import { NewSensorStepTwo } from './NewSensorStepTwo';

const tabs = [
  { component: NewSensorStepOne, name: 'newSensorStepOne', title: '' },
  { component: NewSensorStepTwo, name: 'newSensorStepTwo', title: '' },
  { component: NewSensorStepThree, name: 'newSensorStepThree', title: '' },
];

export const NewSensorPage = () => (
  <Wizard captureUncaughtGestures={false} tabs={tabs} useNewStepper />
);
