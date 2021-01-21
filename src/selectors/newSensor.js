export const selectNewSensor = ({ newSensor }) => {
  const { macAddress = '' } = newSensor || {};
  return macAddress;
};

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

export const selectConfigTemperatureThresholds = state => {
  const coldCumulativeConfigTempThreshold = selectColdCumulativeTemperatureThreshold(state);
  const hotCumulativeConfigTempThreshold = selectHotCumulativeTemperatureThreshold(state);

  const coldConsecutiveConfigTempThreshold = selectColdConsecutiveTemperatureThreshold(state);
  const hotConsecutiveConfigTempThreshold = selectHotConsecutiveTemperatureThreshold(state);

  return {
    COLD_CUMULATIVE: coldCumulativeConfigTempThreshold,
    HOT_CUMULATIVE: hotCumulativeConfigTempThreshold,
    COLD_CONSECUTIVE: coldConsecutiveConfigTempThreshold,

    HOT_CONSECUTIVE: hotConsecutiveConfigTempThreshold,
  };
};
