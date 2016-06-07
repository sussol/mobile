import {
  PropTypes,
} from 'react';

import {
  Text,
} from 'react-native';

export default function Icon() {
  return (
    null
  );
}

Icon.propTypes = {
  size: PropTypes.number,
  name: PropTypes.string,
  color: PropTypes.string,
  style: Text.propTypes.style,
};
