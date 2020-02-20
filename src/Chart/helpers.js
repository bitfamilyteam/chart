// @flow

import R from 'ramda';
import ms from 'ms';
import type { Point, Range } from './types';

type ConvertPosition = {
  data: Array<Point>,
  locationX: number,
  locationY: number,
  width: number,
  height: number,
};

const handleSingleDataPoint = (data: Array<Point>): Array<Point> =>
  data && (data.length === 1 ? [data[0], { ...data[0], x: data[0].x + 1 }] : data);

const getRange = (getter: any => number, data: Array<Point>): Range => ({
  min: getter(R.reduce(R.minBy(getter), data[0], data)),
  max: getter(R.reduce(R.maxBy(getter), data[0], data)),
});

const screenToDataPosition = ({
  data, locationX, locationY, width, height,
}: ConvertPosition): Point => {
  const fixedData = handleSingleDataPoint(data);
  const xRange = getRange(R.prop('x'), fixedData);
  const yRange = getRange(R.prop('y'), fixedData);
  const position = {
    x: (locationX / width) * (xRange.max - xRange.min) + xRange.min,
    y: (locationY / height) * (yRange.max - yRange.min) + yRange.min,
  };
  return position;
};

/**
 * Removes extra points depending on time.
 * @param {array<string>} timeFrames - for example ['1 hour', '1d', '1year', 'all'] (see ms(...))
 * @param {{
 *   x: number,
 *   y: number,
 * }[]} allRates
 * @param {number} numberPointsPerTimeFrame
 * @param {number} maxDistanceBetweenPoints
 * @example removeExtraPoints(['1 hour', '1d'], [{ x: 1, y: 1 }], 60, ms('2 week'))
 * @returns {{
 *   x: number,
 *   y: number,
 * }[]}
 */
function removeExtraPoints(
  timeFrames, allRates, numberPointsPerTimeFrame, maxDistanceBetweenPoints,
) {
  if (allRates.length === 0) {
    return [];
  }
  if (timeFrames.length === 0) {
    return allRates;
  }
  function compareByX(rate1, rate2) {
    if (rate1.x === rate2.x) return 0;
    return rate1.x < rate2.x ? -1 : 1;
  }
  function getUniqSortedRates(allNewRates) {
    const uniqAllRatesMap = allNewRates.reduce((map, rate) => {
      map.set(rate.x, rate);
      return map;
    }, new Map());
    return new Array(...uniqAllRatesMap.values()).sort(compareByX);
  }
  const sortedRates = getUniqSortedRates(allRates);
  const now = Date.now();
  const allNewRates = [];
  timeFrames.forEach((timeFrame) => {
    const fromTimestamp = now - (timeFrame === 'all' ? Infinity : ms(timeFrame));
    const interval = 2 * Math.min(
      (now - fromTimestamp) / numberPointsPerTimeFrame,
      maxDistanceBetweenPoints,
    );
    let minRatePerInterval = sortedRates[sortedRates.length - 1];
    let maxRatePerInterval = sortedRates[sortedRates.length - 1];
    let lastIntervalTimestamp = sortedRates[sortedRates.length - 1].x;
    for (let i = sortedRates.length - 2; i > 0; i -= 1) {
      const rate = sortedRates[i];
      if (rate.x < fromTimestamp) {
        break;
      }
      if ((lastIntervalTimestamp - rate.x) >= interval) {
        lastIntervalTimestamp = rate.x;
        allNewRates.unshift(minRatePerInterval);
        if (minRatePerInterval.x !== maxRatePerInterval.x) {
          allNewRates.unshift(maxRatePerInterval);
        }
        minRatePerInterval = rate;
        maxRatePerInterval = rate;
      } else if (rate.y > maxRatePerInterval.y) {
        maxRatePerInterval = rate;
      } else if (rate.y < minRatePerInterval.y) {
        minRatePerInterval = rate;
      }
    }
  });
  return getUniqSortedRates(allNewRates);
}

export {
  handleSingleDataPoint, getRange, screenToDataPosition, removeExtraPoints,
};
