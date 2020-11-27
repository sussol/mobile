/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

/**
 * Class representing a Temperature.
 * Can have a different representation depending on it's options for
 * easy converting between celsius and fahrenheit.
 *
 * @params value   {Number} The temperature
 * @params options {Object} The temperatures options. Shape below.
 *
 * Options shape:
 * {
 *  metric: 'c' or 'f' - the current temperature metric. [Default: 'c']
 *  precision: int - the number of decimal place precision. [Default: 1]
 *  formatWithSymbol: bool - indicator if the metric symbol+symbol should be used.[Default: true]
 *  pattern: A pattern for formatting. # is replaced with temp, * with the symbol. [Default: "#*"]
 *  negativePattern: As above, for negative temperatures. [Default: "-#*"]
 *  symbol: Symbol for formatting- shown between the temp and metric symbol [Default: '\u00B0']
 * }
 */
class Temperature {
  constructor(value = 0, options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.value = value;
  }

  temperature(asMetric) {
    const { options, value } = this;
    const { precision, metric } = options;

    const metricToUse = asMetric || metric;

    if (metricToUse === metric) return Number(value).toFixed(precision);
    if (metricToUse === CELSIUS) return Number(celsiusFromFahrenheit(value)).toFixed(precision);

    return Number(celsiusToFahrenheit(value)).toFixed(precision);
  }

  setMetric(newMetric) {
    if (!(newMetric === CELSIUS || newMetric === FAHRENHEIT)) return this;
    const { metric } = this.options;

    if (newMetric !== metric) {
      if (newMetric === CELSIUS) this.value = celsiusFromFahrenheit(this.value);
      else this.value = celsiusToFahrenheit(this.value);
    }

    this.options.metric = newMetric;

    return this;
  }

  format(asMetric) {
    const {
      pattern,
      metric,
      symbol,
      negativePattern,
      invalidPattern,
      formatWithSymbol,
    } = this.options;

    const formatMetric = asMetric || metric;

    const temperatureValue = this.temperature(formatMetric);
    const isValid = Number.isFinite(Number(temperatureValue));

    let patternToReplace = pattern;
    if (!isValid) patternToReplace = invalidPattern;
    if (temperatureValue < 0) patternToReplace = negativePattern;

    return patternToReplace
      .replace('#', String(temperatureValue))
      .replace('*', formatWithSymbol ? getMetricSymbol(formatMetric, symbol) : '');
  }
}

const CELSIUS = 'c';
const FAHRENHEIT = 'f';
const METRIC_SYMBOLS = { [CELSIUS]: 'C', [FAHRENHEIT]: 'F' };
const DEFAULT_OPTIONS = {
  metric: CELSIUS,
  symbol: '\u00B0',
  precision: 1,
  formatWithSymbol: true,
  pattern: '#*',
  negativePattern: '-#*',
  invalidPattern: 'N/A',
};

const getMetricSymbol = (metric, symbol) => `${symbol}${METRIC_SYMBOLS[metric]}`;
const celsiusToFahrenheit = temperature => (temperature * 9) / 5 + 32;
const celsiusFromFahrenheit = temperature => (temperature - 32) / (9 / 5);

// Exporting a default function to be able to call without `new`
export default (...args) => new Temperature(...args);
