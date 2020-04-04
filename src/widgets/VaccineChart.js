/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { VictoryAxis, VictoryChart, VictoryLine, VictoryScatter } from 'victory-native';
import moment from 'moment';
import PropTypes from 'prop-types';

import { useLayoutDimensions } from '../hooks/useLayoutDimensions';
import { SUSSOL_ORANGE, APP_FONT_FAMILY, GREY } from '../globalStyles';
import { HazardPoint } from './HazardPoint';
import { FlexView } from './FlexView';

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
}) => {
  const [width, height, setDimensions] = useLayoutDimensions();

  const maxBoundary = React.useCallback(() => maxDomain, []);
  const minBoundary = React.useCallback(() => minDomain, []);

  const chartMinDomain = React.useMemo(() => ({ y: minDomain - 1 }), [minDomain]);
  const chartMaxDomain = React.useMemo(() => ({ y: maxDomain + 1 }), [maxDomain]);

  return (
    <FlexView onLayout={setDimensions}>
      <VictoryChart
        width={width}
        height={height}
        minDomain={chartMinDomain}
        maxDomain={chartMaxDomain}
      >
        <VictoryAxis offsetX={50} dependentAxis style={chartStyles.axis} tickFormat={yTickFormat} />
        <VictoryAxis offsetY={50} tickFormat={xTickFormat} style={chartStyles.axis} />

        <VictoryLine
          interpolation="natural"
          data={minLine}
          y={y}
          x={x}
          style={chartStyles.minLine}
        />
        <VictoryLine
          interpolation="natural"
          data={maxLine}
          y={y}
          x={x}
          style={chartStyles.maxLine}
        />
        <VictoryLine data={maxLine} y={maxBoundary} x={x} style={chartStyles.maxBoundaryLine} />
        <VictoryLine data={minLine} y={minBoundary} x={x} style={chartStyles.minBoundaryLine} />

        <VictoryScatter data={maxLine} y={y} x={x} style={chartStyles.maxScatterPlot} />
        <VictoryScatter data={minLine} y={y} x={x} style={chartStyles.minScatterPlot} />
        <VictoryScatter
          data={breaches.slice()}
          y={y}
          x={x}
          dataComponent={<HazardPoint onPress={onPressBreach} />}
        />
      </VictoryChart>
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
};

const chartStyles = {
  maxBoundaryLine: { data: { stroke: SUSSOL_ORANGE, opacity: 0.3 } },
  minBoundaryLine: { data: { stroke: '#70b4f0', opacity: 0.3 } },
  minScatterPlot: { data: { fill: 'white', stroke: '#70b4f0', strokeWidth: 2, size: 3 } },
  maxScatterPlot: { data: { fill: 'white', stroke: SUSSOL_ORANGE, strokeWidth: 2, size: 3 } },
  maxLine: { data: { stroke: SUSSOL_ORANGE } },
  minLine: { data: { stroke: '#70b4f0' } },
  axis: { fontSize: 15, fontFamily: APP_FONT_FAMILY, fill: GREY },
};
