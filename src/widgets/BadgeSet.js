import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { Badge } from 'react-native-elements';
import { SUSSOL_ORANGE } from '../globalStyles';

export function BadgeSet(props) {
  const {
    MainElement,
    finalizeValue,
  } = props;

  const finalizeTxt = (finalizeValue > 99) ? '99+' : finalizeValue;
  return (
    <View style={{ position: 'relative' }}>
    {MainElement}
    {(finalizeValue !== 0) && (
      <Badge
        value={finalizeTxt}
        wrapperStyle={[localStyles.badgeWrapper, localStyles.finalize]}
        containerStyle={localStyles.finalizeContainer}
        textStyle={localStyles.badgeFont}
      />
    )}
    </View>
  );
}

BadgeSet.propTypes = {
  MainElement: PropTypes.element.isRequired,
  finalizeValue: PropTypes.number,
};

BadgeSet.defaultProps = {
  MainViewStyle: {},
  finalizeValue: 0,
};

const localStyles = StyleSheet.create({
  badgeWrapper: {
    position: 'absolute',
    top: 0,
    right: 8,
    width: 45,
  },
  badgeFont: {
    fontSize: 10,
    color: '#FFF',
  },
  finalize: {
  },
  finalizeContainer: {
    backgroundColor: SUSSOL_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
