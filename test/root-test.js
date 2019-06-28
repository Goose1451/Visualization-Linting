import tape from 'tape';
// import SeattleWeather from '../seattle-weather.json';
import {lint} from '../src';
import {BAR_CHART_SPEC, HISTOGRAM, COLORED_SCATTERPLOT} from './vega-examples';

tape('initial test', t => {
  Promise.all([
    lint(BAR_CHART_SPEC)
      .then(result => {
        t.deepEqual(
          result,
          [{name: 'shuffleInputData', passed: true}],
          'BAR CHART: should find basic results'
        );
      }),

    lint(HISTOGRAM)
      .then(result => {
        t.deepEqual(
          result,
          [{name: 'shuffleInputData', passed: true}],
          'HISTOGRAM: should find basic results'
        );
      }),

    lint(COLORED_SCATTERPLOT)
      .then(result => {
        t.deepEqual(
          result,
          [{name: 'shuffleInputData', passed: false}],
          'COLORED_SCATTERPLOT: should find basic results'
        );
      })
  ])
  .then(() => t.end());
});
