import { createSelector } from 'reselect';

export const selectSensorDetail = ({ sensorDetail }) => sensorDetail;

export const selectHotConsecutiveConfig = createSelector(
  [selectSensorDetail],
  sensorDetail => sensorDetail.HOT_CONSECUTIVE
);

export const selectColdConsecutiveConfig = createSelector(
  [selectSensorDetail],
  sensorDetail => sensorDetail.COLD_CONSECUTIVE
);

export const selectHotCumulativeConfig = createSelector(
  [selectSensorDetail],
  sensorDetail => sensorDetail.HOT_CUMULATIVE
);

export const selectColdCumulativeConfig = createSelector(
  [selectSensorDetail],
  sensorDetail => sensorDetail.COLD_CUMULATIVE
);

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

export const selectHotConsecutiveTemperatureThreshold = ({ sensorDetail }) => {
  const { COLD_CONSECUTIVE: coldConfig } = sensorDetail;
  const { temperature: coldConfigTemp } = coldConfig;

  const hotConfigTempThreshold = coldConfigTemp + 0.1;

  return hotConfigTempThreshold;
};

export const selectHotCumulativeTemperatureThreshold = ({ sensorDetail }) => {
  const { COLD_CUMULATIVE: coldConfig } = sensorDetail;
  const { temperature: coldConfigTemp } = coldConfig;

  const hotConfigTempThreshold = coldConfigTemp + 0.1;

  return hotConfigTempThreshold;
};

export const selectColdConsecutiveTemperatureThreshold = ({ sensorDetail }) => {
  const { HOT_CONSECUTIVE: hotConfig } = sensorDetail;
  const { temperature: hotConfigTemp } = hotConfig;

  const coldConfigTempThreshold = hotConfigTemp - 0.1;

  return coldConfigTempThreshold;
};

export const selectColdCumulativeTemperatureThreshold = ({ sensorDetail }) => {
  const { HOT_CUMULATIVE: hotConfig } = sensorDetail;
  const { temperature: hotConfigTemp } = hotConfig;

  const coldConfigTempThreshold = hotConfigTemp - 0.1;

  return coldConfigTempThreshold;
};
