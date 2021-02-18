export const selectNewSensor = ({ newSensor }) => newSensor;
// TODO
export const selectHotConsecutiveConfig = ({ newSensor }) => newSensor.HOT_CONSECUTIVE;
export const selectColdConsecutiveConfig = ({ newSensor }) => newSensor.COLD_CONSECUTIVE;
export const selectHotCumulativeConfig = ({ newSensor }) => newSensor.HOT_CUMULATIVE;
export const selectColdCumulativeConfig = ({ newSensor }) => newSensor.COLD_CUMULATIVE;

export const selectConfigs = state => ({
  hotConsecutiveConfig: {
    ...selectHotConsecutiveConfig(state),
    threshold: selectHotConsecutiveTemperatureThreshold(state),
  },
  coldConsecutiveConfig: {
    ...selectColdConsecutiveConfig(state),
    threshold: selectColdConsecutiveTemperatureThreshold(state),
  },
  hotCumulativeConfig: {
    ...selectHotCumulativeConfig(state),
    threshold: selectHotCumulativeTemperatureThreshold(state),
  },
  coldCumulativeConfig: {
    ...selectColdCumulativeConfig(state),
    threshold: selectColdCumulativeTemperatureThreshold(state),
  },
});

export const selectHotConsecutiveTemperatureThreshold = ({ newSensor }) => {
  const { COLD_CONSECUTIVE: coldConfig } = newSensor;
  const { temperature: coldConfigTemp } = coldConfig;

  const hotConfigTempThreshold = coldConfigTemp + 0.1;

  return hotConfigTempThreshold;
};

export const selectHotCumulativeTemperatureThreshold = ({ newSensor }) => {
  const { COLD_CUMULATIVE: coldConfig } = newSensor;
  const { temperature: coldConfigTemp } = coldConfig;

  const hotConfigTempThreshold = coldConfigTemp + 0.1;

  return hotConfigTempThreshold;
};

export const selectColdConsecutiveTemperatureThreshold = ({ newSensor }) => {
  const { HOT_CONSECUTIVE: hotConfig } = newSensor;
  const { temperature: hotConfigTemp } = hotConfig;

  const coldConfigTempThreshold = hotConfigTemp - 0.1;

  return coldConfigTempThreshold;
};

export const selectColdCumulativeTemperatureThreshold = ({ newSensor }) => {
  const { HOT_CUMULATIVE: hotConfig } = newSensor;
  const { temperature: hotConfigTemp } = hotConfig;

  const coldConfigTempThreshold = hotConfigTemp - 0.1;

  return coldConfigTempThreshold;
};
