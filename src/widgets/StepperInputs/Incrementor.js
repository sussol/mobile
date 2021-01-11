/* eslint-disable react/jsx-wrap-multilines */
import React from 'react';
import PropTypes from 'prop-types';

import { useRepeatCallbackPress } from '../../hooks';

import { StepperInputWithLabel } from './StepperInputWithLabel';
import { BaseStepperButton } from './BaseStepperButton';
import { MinusCircle } from '../icons';

export const Incrementor = ({ Content, onIncrement, onDecrement, label }) => {
  const [onLongIncrement, onStopIncrement] = useRepeatCallbackPress(onIncrement);
  const [onLongDecrement, onStopDecrement] = useRepeatCallbackPress(onDecrement);

  return (
    <StepperInputWithLabel
      label={label}
      LeftButton={
        <BaseStepperButton
          onLongPress={onLongDecrement}
          onPressOut={onStopDecrement}
          onPress={onDecrement}
          Content={<MinusCircle />}
        />
      }
      RightButton={
        <BaseStepperButton
          onLongPress={onLongIncrement}
          onPressOut={onStopIncrement}
          onPress={onIncrement}
        />
      }
      TextInput={Content}
    />
  );
};

Incrementor.defaultProps = {
  label: '',
};

Incrementor.propTypes = {
  Content: PropTypes.node.isRequired,
  onIncrement: PropTypes.func.isRequired,
  onDecrement: PropTypes.func.isRequired,
  label: PropTypes.string,
};
