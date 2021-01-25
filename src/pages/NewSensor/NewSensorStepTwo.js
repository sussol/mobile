import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { TabContainer } from './TabContainer';
import { BreachConfigRow } from './BreachConfigRow';
import { PaperSection, FlexRow, PageButton, Spacer } from '../../widgets';

import { SUSSOL_ORANGE, WHITE } from '../../globalStyles';
import { buttonStrings, vaccineStrings } from '../../localization';
import { WizardActions } from '../../actions/WizardActions';
import { goBack } from '../../navigation/actions';

export const NewSensorStepTwoComponent = ({ nextTab, previousTab, exit }) => (
  <TabContainer>
    <PaperSection height={320} headerText={vaccineStrings.new_sensor_step_two_title}>
      <BreachConfigRow type="HOT_CONSECUTIVE" />
      <BreachConfigRow type="COLD_CONSECUTIVE" />
      <BreachConfigRow type="HOT_CUMULATIVE" />
      <BreachConfigRow type="COLD_CUMULATIVE" />
    </PaperSection>

    <FlexRow flex={1} justifyContent="flex-end" alignItems="flex-end">
      <View style={{ marginRight: 'auto' }}>
        <PageButton text={buttonStrings.back} onPress={previousTab} />
      </View>

      <PageButton text={buttonStrings.cancel} onPress={exit} />
      <Spacer space={20} />
      <PageButton
        text={buttonStrings.next}
        style={{ backgroundColor: SUSSOL_ORANGE }}
        textStyle={{ color: WHITE }}
        onPress={nextTab}
      />
    </FlexRow>
  </TabContainer>
);

const dispatchToProps = dispatch => {
  const nextTab = () => dispatch(WizardActions.nextTab());
  const previousTab = () => dispatch(WizardActions.previousTab());
  const exit = () => dispatch(goBack());

  return { nextTab, previousTab, exit };
};

NewSensorStepTwoComponent.propTypes = {
  nextTab: PropTypes.func.isRequired,
  previousTab: PropTypes.func.isRequired,
  exit: PropTypes.func.isRequired,
};

export const NewSensorStepTwo = connect(null, dispatchToProps)(NewSensorStepTwoComponent);
