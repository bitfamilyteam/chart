// @flow

import R from 'ramda';
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

export { handleSingleDataPoint, getRange, screenToDataPosition };
