import React, { useEffect } from 'react';
import { Animated, Text } from 'react-native';
import PropTypes from 'prop-types';

import { FlexRow } from './FlexRow';
import { FlexView } from './FlexView';
import { HotBreachIcon } from './HotBreachIcon';
import { ColdBreachIcon } from './ColdBreachIcon';
import { LowBatteryIcon, TemperatureIcon } from './icons';

import { DARKER_GREY, APP_FONT_FAMILY, COLD_BREACH_BLUE, WHITE, DANGER_RED } from '../globalStyles';
import { MILLISECONDS } from '../utilities';
import { Rectangle } from './Rectangle';
import temperature from '../utilities/temperature';

const BigText = ({ children, colour }) => (
  <Text style={{ ...styles.bigText, color: colour }}>{children}</Text>
);

BigText.defaultProps = { colour: WHITE };
BigText.propTypes = { children: PropTypes.node.isRequired, colour: PropTypes.string };

export const SensorStatus = ({ isInHotBreach, isInColdBreach, isLowBattery, currentTemp }) => {
  const fadeAnim1 = React.useRef(new Animated.Value(0)).current;
  const fadeAnim2 = React.useRef(new Animated.Value(0)).current;
  const fadeAnim3 = React.useRef(new Animated.Value(0)).current;
  const animRef = React.useRef(null);

  const conditions = [isInHotBreach, isInColdBreach, isLowBattery];
  const animationValues = [fadeAnim1, fadeAnim2, fadeAnim3].filter((_, i) => conditions[i]);
  const isInDanger = isInHotBreach || isInColdBreach || isLowBattery;

  const stopAnimating = () => animRef?.current?.stop();

  const startAnimating = () => {
    // If there is a ref to an animation, stop it before starting
    // a new one.
    stopAnimating();

    // Start an infinite looping sequence of animations.
    animRef.current = Animated.loop(
      // Sequence is a a sequence of sequences - each sub sequence being
      // for a specific icon which should be shown. i.e. if the fridge is
      // low battery and has a hot breach, there is a sequence of sequences
      // for each icon.
      Animated.sequence(
        // Map each animation value (which can be thought of as an icon)
        // to a sequence which will increase the opacity of the icon to full
        // over one second, then reduce the opacity to zero over one second.
        animationValues.map(value =>
          Animated.sequence([
            Animated.delay(MILLISECONDS.ONE_SECOND / 4),
            Animated.timing(value, {
              toValue: 1,
              duration: MILLISECONDS.ONE_SECOND,
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: MILLISECONDS.ONE_SECOND,
              useNativeDriver: true,
            }),
          ])
        )
      )
    );

    animRef.current.start();
  };

  useEffect(() => {
    if (isInDanger) startAnimating();
    if (!isInDanger) stopAnimating();
  }, [isInDanger, isInHotBreach, isInColdBreach, isLowBattery]);

  return !isInDanger ? (
    <Rectangle colour={WHITE}>
      <FlexRow alignItems="center">
        <BigText colour={DARKER_GREY}>{temperature(currentTemp).format()}</BigText>
        <TemperatureIcon />
      </FlexRow>
    </Rectangle>
  ) : (
    <Rectangle colour={isInColdBreach ? COLD_BREACH_BLUE : DANGER_RED}>
      <FlexRow flex={1}>
        <FlexView flex={2} alignItems="center" justifyContent="center">
          <BigText>{temperature(currentTemp).format()}</BigText>
        </FlexView>

        <FlexView alignItems="center" justifyContent="center">
          <Animated.View style={styles.icon} opacity={fadeAnim1}>
            <HotBreachIcon />
          </Animated.View>

          <Animated.View style={styles.icon} opacity={fadeAnim2}>
            <ColdBreachIcon />
          </Animated.View>

          <Animated.View style={{ ...styles.icon, paddingRight: 5 }} opacity={fadeAnim3}>
            <LowBatteryIcon size={20} />
          </Animated.View>
        </FlexView>
      </FlexRow>
    </Rectangle>
  );
};

const styles = {
  icon: { position: 'absolute', alignSelf: 'flex-end' },
  bigText: { fontSize: 24, fontFamily: APP_FONT_FAMILY },
};

SensorStatus.defaultProps = {
  isInHotBreach: false,
  isInColdBreach: false,
  isLowBattery: false,
  currentTemp: 0,
};

SensorStatus.propTypes = {
  isInHotBreach: PropTypes.bool,
  isInColdBreach: PropTypes.bool,
  isLowBattery: PropTypes.bool,
  currentTemp: PropTypes.number,
};
