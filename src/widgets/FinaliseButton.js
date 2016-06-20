import React from 'react';

import {
  Text,
  TouchableOpacity,
} from 'react-native';

export function FinaliseButton(props) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <Text>
        {props.isFinalised ? 'Finalised' : 'Finalise'}
      </Text>
    </TouchableOpacity>
  );
}

FinaliseButton.propTypes = {
  isFinalised: React.PropTypes.bool.isRequired,
  onPress: React.PropTypes.func,
};
FinaliseButton.defaultProps = {
  isFinalised: false,
};
