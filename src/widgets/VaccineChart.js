/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { Svg } from 'react-native-svg';
import { VictoryAxis, VictoryChart, VictoryLine, VictoryScatter, VictoryBar } from 'victory-native';
import moment from 'moment';
import PropTypes from 'prop-types';

import { useLayoutDimensions } from '../hooks/useLayoutDimensions';
import {
  WEARY_TARMAC,
  COLD_BREACH_BLUE,
  SUSSOL_ORANGE,
  APP_FONT_FAMILY,
  GREY,
} from '../globalStyles';
import { HazardPoint } from './HazardPoint';
import { FlexView } from './FlexView';
import { CHART_CONSTANTS } from '../utilities/modules/vaccines';

export const VaccineChart = ({
  minLine,
  maxLine,
  minDomain,
  maxDomain,
  x,
  y,
  xTickFormat,
  yTickFormat,
  breaches,
  onPressBreach,
  breachBoundaries,
}) => {
  const [width, height, setDimensions] = useLayoutDimensions();
  const chartMinDomain = React.useMemo(() => ({ y: minDomain - CHART_CONSTANTS.DOMAIN_OFFSET }), [
    minDomain,
  ]);
  const chartMaxDomain = React.useMemo(() => ({ y: maxDomain + CHART_CONSTANTS.DOMAIN_OFFSET }), [
    maxDomain,
  ]);

  const upperBoundData = maxLine.map(point => ({ x: point.timestamp, y: breachBoundaries.upper }));
  const lowerBoundData = minLine.map(point => ({ x: point.timestamp, y: breachBoundaries.lower }));
  const barData = minLine.map(minPoint => {
    const maxPoint = maxLine.find(max => max.timestamp === minPoint.timestamp);

    const dataPoint = {
      x: minPoint.timestamp,
      hotY: 0,
      hotY0: 0,
      y: 0,
      y0: 0,
      coldY: 0,
      coldY0: 0,
    };

    if (maxPoint && maxPoint.temperature > breachBoundaries.upper) {
      dataPoint.hotY = maxPoint.temperature;
      dataPoint.hotY0 = Math.max(minPoint.temperature, breachBoundaries.upper);
    }

    if (minPoint.temperature < breachBoundaries.lower) {
      dataPoint.coldY = Math.min(breachBoundaries.lower, maxPoint.temperature);
      dataPoint.coldY0 = minPoint.temperature;
    }

    if (
      maxPoint.temperature > breachBoundaries.upper &&
      minPoint.temperature > breachBoundaries.upper
    ) {
      // no mid section to display
      return dataPoint;
    }

    if (
      maxPoint.temperature < breachBoundaries.lower &&
      minPoint.temperature < breachBoundaries.lower
    ) {
      // no mid section to display
      return dataPoint;
    }

    dataPoint.y = Math.min(breachBoundaries.upper, maxPoint.temperature);
    dataPoint.y0 = Math.max(breachBoundaries.lower, minPoint.temperature);

    return dataPoint;
  });

  return (
    <FlexView onLayout={setDimensions}>
      <Svg>
        <VictoryChart
          width={width}
          height={height}
          minDomain={chartMinDomain}
          maxDomain={chartMaxDomain}
          padding={{ top: 0, bottom: 50, right: 10, left: 50 }}
        >
          <VictoryAxis
            offsetX={CHART_CONSTANTS.AXIS_OFFSET}
            dependentAxis
            style={chartStyles.axis}
            tickFormat={yTickFormat}
          />
          <VictoryAxis
            offsetY={CHART_CONSTANTS.AXIS_OFFSET}
            tickFormat={xTickFormat}
            style={chartStyles.axis}
          />

          <VictoryLine data={upperBoundData} style={chartStyles.maxBoundaryLine} />
          <VictoryLine data={lowerBoundData} style={chartStyles.minBoundaryLine} />
          <VictoryBar
            data={barData}
            y="hotY"
            y0="hotY0"
            style={chartStyles.hotBars}
            barWidth={30}
            alignment="start"
          />
          <VictoryBar data={barData} style={chartStyles.midBars} barWidth={30} alignment="start" />
          <VictoryBar
            data={barData}
            y="coldY"
            y0="coldY0"
            style={chartStyles.coldBars}
            barWidth={30}
            alignment="start"
          />

          <VictoryScatter
            data={breaches.slice()}
            y={y}
            x={x}
            dataComponent={<HazardPoint onPress={onPressBreach} />}
          />
        </VictoryChart>
      </Svg>
    </FlexView>
  );
};

VaccineChart.defaultProps = {
  x: 'timestamp',
  y: 'temperature',
  xTickFormat: tick => moment(new Date(tick)).format('DD/MM'),
  yTickFormat: tick => `${tick}\u2103`,
  onPressBreach: null,
  breaches: null,
};

VaccineChart.propTypes = {
  x: PropTypes.string,
  y: PropTypes.string,
  minDomain: PropTypes.number.isRequired,
  maxDomain: PropTypes.number.isRequired,
  minLine: PropTypes.array.isRequired,
  maxLine: PropTypes.array.isRequired,
  xTickFormat: PropTypes.func,
  yTickFormat: PropTypes.func,
  onPressBreach: PropTypes.func,
  breaches: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  breachBoundaries: PropTypes.object.isRequired,
};

const chartStyles = {
  maxBoundaryLine: { data: { stroke: SUSSOL_ORANGE, opacity: 0.75 } },
  minBoundaryLine: { data: { stroke: COLD_BREACH_BLUE, opacity: 0.75 } },
  maxLine: { data: { stroke: SUSSOL_ORANGE } },
  minLine: { data: { stroke: COLD_BREACH_BLUE } },
  axis: { fontSize: 15, fontFamily: APP_FONT_FAMILY, fill: GREY },
  coldBars: { data: { fill: COLD_BREACH_BLUE, opacity: 0.9 } },
  hotBars: { data: { fill: SUSSOL_ORANGE, opacity: 0.9 } },
  midBars: { data: { fill: WEARY_TARMAC, opacity: 0.9 } },
};
