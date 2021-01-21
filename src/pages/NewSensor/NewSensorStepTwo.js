import React from 'react';
import { View } from 'react-native';

import { TabContainer } from './TabContainer';
import { PaperSection } from '../../widgets';
import { BreachConfigRow } from './BreachConfigRow';

import { vaccineStrings } from '../../localization';

export const NewSensorStepTwo = () => (
  <TabContainer>
    <PaperSection height={310} headerText={vaccineStrings.new_sensor_step_two_title}>
      <View style={{ height: 360 }}>
        <BreachConfigRow type="HOT_CONSECUTIVE" />
        <BreachConfigRow type="COLD_CONSECUTIVE" />
        <BreachConfigRow type="HOT_CUMULATIVE" />
        <BreachConfigRow type="COLD_CUMULATIVE" />
      </View>
    </PaperSection>
  </TabContainer>
);
