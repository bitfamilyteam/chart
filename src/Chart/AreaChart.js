// @flow

import R from 'ramda';
import * as scale from 'd3-scale';
import * as shape from 'd3-shape';
import * as array from 'd3-array';
import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { Point } from './types';

function combineData(left: Array<Point>, right: Array<Point>): Array<Point> {
  const diff = R.differenceWith(R.eqProps('x'), left, right);
  return R.concat(...R.sortBy(part => part[0] && part[0].x, [diff, right]));
}

type CreatePathsParams = {
  data: Array<Point>,
  convertX: number => number,
  convertY: number => number,
  yMin: number,
};

type AreaChartType = {
  width: number,
  height: number,
  animating: boolean,
  data: Array<Point>,
  oldData: Array<Point>,
  gridMin: number,
  gridMax: number,
  svg: any,
  contentInset: {
    top?: number,
    bottom?: number,
    left?: number,
    right?: number,
  },
  shadowHeight?: number,
  children: any,
};

class AreaChart extends React.PureComponent<AreaChartType> {
  static defaultProps = {
    svg: {},
    contentInset: {},
  };

  createPaths(params: CreatePathsParams) {
    const {
      data, convertX, convertY, yMin,
    } = params;
    const { oldData } = this.props;
    const fullData = combineData(data, oldData);

    const shadowHeight = this.props.shadowHeight || 1.5 * this.props.svg.strokeWidth;
    const shadowPoints = [...fullData, ...R.map(({ x, y }) => ({ x, y, shadowHeight }), R.reverse(fullData))];
    const shadow = shape
      .area()
      .x(point => convertX(point.x))
      .y0(convertY(0))
      .y1(point => convertY(point.y) + (point.shadowHeight || 0))
      .defined(item => typeof item.y === 'number')
      .curve(shape.curveLinear)(shadowPoints);

    const areaData = [{ x: fullData[0].x, y: yMin }, ...fullData, { x: fullData[fullData.length - 1].x, y: yMin }];
    const area = shape
      .area()
      .x(point => convertX(point.x))
      .y0(convertY(0))
      .y1(point => convertY(point.y))
      .defined(item => typeof item.y === 'number')
      .curve(shape.curveLinear)(areaData);

    const path = shape
      .line()
      .x(point => convertX(point.x))
      .y(point => convertY(point.y))
      .defined(item => typeof item.y === 'number')
      .curve(shape.curveLinear)(fullData);

    return {
      path,
      shadow,
      area,
    };
  }

  render() {
    const {
      data,
      contentInset: {
        top = 0, bottom = 0, left = 0, right = 0,
      },
      gridMax,
      gridMin,
      svg,
      children,
    } = this.props;

    const { width, height } = this.props;

    if (data.length === 0) {
      return <View />;
    }

    const yValues = data.map(item => item.y);
    const xValues = data.map(item => item.x);

    const yExtent = array.extent([...yValues, gridMin, gridMax]);
    const xExtent = array.extent([...xValues]);

    const yMin = yExtent[0];
    const yMax = yExtent[1];
    const xMin = xExtent[0];
    const xMax = xExtent[1];

    const convertY = scale
      .scaleLinear()
      .domain([yMin, yMax])
      .range([height - bottom, top]);

    const convertX = scale
      .scaleLinear()
      .domain([xMin, xMax])
      .range([left, width - right]);

    const paths = this.createPaths({
      data,
      convertX,
      convertY,
      yMin,
    });

    return (
      <View>
        {height > 0 && width > 0 && (
          <Svg style={{ height, width }}>
            <Path fill={svg.fill} d={paths.area} />
            <Path fill={svg.stroke} stroke="none" opacity="0.3" d={paths.shadow} />
            <Path
              strokeWidth={svg.strokeWidth}
              stroke={svg.stroke}
              opacity="0.8"
              strokeLinejoin="round"
              fill="none"
              d={paths.path}
            />
            {React.Children.map(children, (child) => {
              if (child) {
                return React.cloneElement(child, { convertX, convertY });
              }
              return null;
            })}
          </Svg>
        )}
      </View>
    );
  }
}

export default AreaChart;
