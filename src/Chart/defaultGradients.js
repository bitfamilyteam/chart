// @flow

export default {
  areaChart: {
    coords: {
      x1: '0%',
      x2: '0%',
      y1: '0%',
      y2: '100%',
    },
    stops: [
      {
        offset: '0%',
        color: 'rgb(255, 255, 255)',
        opacity: 1,
      },
      {
        offset: '100%',
        color: 'rgb(255, 255, 255)',
        opacity: 1,
      },
    ],
  },
  backgroundGrow: {
    coords: {
      x1: `${108.216 / 375 * 100}%`,
      y1: `${462.846 / 812 * 100}%`,
      x2: `${581.544 / 375 * 100}%`,
      y2: `${135.35 / 812 * 100}%`,
    },
    stops: [
      {
        offset: '0%',
        color: '#5e71f7',
        opacity: 0.17,
      },
      {
        offset: '100%',
        color: '#5b69ff',
        opacity: 0,
      },
    ],
  },
  backgroundDecline: {
    coords: {
      x1: `${(591.262 - 454) / 375 * 100}%`,
      y1: `${498.132 / 812 * 100}%`,
      x2: `${(1134.256 - 454) / 375 * 100}%`,
      y2: `${323.792 / 812 * 100}%`,
    },
    stops: [
      {
        offset: '0%',
        color: '#f7b15e',
        opacity: 0.17,
      },
      {
        offset: '100%',
        color: '#f96083',
        opacity: 1,
      },
    ],
  },
  areaChartFill: {
    coords: {
      x1: '0%',
      x2: '0%',
      y1: '0%',
      y2: '100%',
    },
    stops: [
      {
        offset: '0%',
        color: 'rgb(255, 255, 255)',
        opacity: 0.3,
      },
      {
        offset: '100%',
        color: 'rgb(255, 255, 255)',
        opacity: 0,
      },
    ],
  },
};
