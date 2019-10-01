// @flow

import R from 'ramda';
import * as array from 'd3-array';
import * as ease from 'd3-ease';
import React from 'react';
import type { Node } from 'react';
import extractTransform from 'react-native-svg/lib/commonjs/lib/extract/extractTransform';
import AreaChart from './AreaChart';
import Tooltip from './Tooltip';
import EndDot from './EndDot';
import type { Point } from './types';

type Range = { min: number, max: number };

const getTimeRange = (data: Array<Point>): Range =>
  data
  && data.length && {
    min: R.pathOr(0, ['0', 'x'], data),
    max: R.pathOr(0, [data.length - 1, 'x'], data),
  };

function areRangesOverlap(left: Range, right: Range): boolean {
  const minSize = Math.min(left.max - left.min, right.max - right.min);
  const threshold = minSize / 4;
  return left.min - threshold <= right.max && left.max + threshold >= right.min;
}

function shouldAnimate(left: Range, right: Range): boolean {
  if (!areRangesOverlap(left, right)) return false;

  const leftSize = left.max - left.min;
  const rightSize = right.max - right.min;
  const scale = leftSize / rightSize;

  return scale > 0.8 && scale < 1.2;
}

const interpolate = (from: number, to: number, phase: number): number => from + (to - from) * phase;

type AnimatedChartProps = any;
type AnimatedChartState = {
  oldData: Array<Point>,
  gridMin?: number,
  gridMax?: number,
};

const ANIMATION_DURATION_MS = 500;

const recountValues = (data) => {
  const threshold = Math.min(...R.pluck('y', data));
  return data.map(({ x, y }) => ({ x, y: y - threshold }));
};

class AnimatedChart extends React.PureComponent<AnimatedChartProps, AnimatedChartState> {
  path: any;
  tooltip: any;

  constructor(props: AnimatedChartProps) {
    super(props);
    this.state = { oldData: [] };
  }

  onPathRef = (path: any) => (this.path = path);

  extent: Array<number>;
  oldExtent: Array<number>;
  startX: number;
  startTime: number;

  getCurrentTimeMS = () => new Date().getTime();

  componentDidUpdate(prevProps: AnimatedChartProps) {
    const { data, currency } = this.props;

    if (prevProps.data !== data) {
      const range = getTimeRange(data);
      const prevRange = getTimeRange(prevProps.data);
      const sameCurrency = currency === prevProps.currency;

      if (sameCurrency && !R.equals(prevRange, range) && shouldAnimate(prevRange, range)) {
        this.startX = range.min;
        this.startTime = this.getCurrentTimeMS();
        this.oldExtent = array.extent(prevProps.data, R.prop('y'));
        this.extent = array.extent(data, R.prop('y'));
        this.setState({ oldData: data }, this.update);
      } else {
        this.stopAnimation();
        this.setState({ oldData: [] });
      }
    }
  }

  update = () => {
    const { width, data } = this.props;
    const { min: start, max: end } = getTimeRange(data);

    const currentTime = this.getCurrentTimeMS();
    const phase = (currentTime - this.startTime) / ANIMATION_DURATION_MS;
    if (phase >= 1 && this.path) {
      this.startX = start;
      this.setState({ oldData: [] });
      const matrix = extractTransform({ x: 0 });
      this.path.setNativeProps({ matrix });
      return;
    }

    if (this.path) {
      const scale = width / (end - start);
      const smoothPhase = ease.easeCubicOut(phase);
      const shift = scale * interpolate(this.startX - start, 0, smoothPhase);

      const matrix = extractTransform({ x: -shift });
      this.path.setNativeProps({ matrix });

      this.setState({
        gridMin: interpolate(this.oldExtent[0], this.extent[0], smoothPhase),
        gridMax: interpolate(this.oldExtent[1], this.extent[1], smoothPhase),
      });
    }

    global.requestAnimationFrame(this.update);
  };

  stopAnimation = () => {
    this.startX = getTimeRange(this.props.data).min;
  };

  componentWillUnmount() {
    this.stopAnimation();
  }

  renderTooltip(newData: Array<Point>): Node {
    const {
      tooltip, position, width, height, period, fontFamily,
    } = this.props;
    const TooltipComponent = tooltip || Tooltip;
    return (
      <TooltipComponent
        ref={this.props.onTooltipRef}
        data={newData}
        position={position}
        width={width}
        height={height}
        period={period}
        fontFamily={fontFamily}
        topOffset={60}
      />
    );
  }

  render() {
    const props = {
      ...this.props,
      svg: {
        ...(this.props.svg || {}),
        ref: this.onPathRef,
      },
    };

    const { oldData, gridMin, gridMax } = this.state;
    if (oldData && oldData.length) {
      props.gridMin = gridMin;
      props.gridMax = gridMax;
    }

    const data = recountValues(this.props.data);
    const dotVisible = R.includes(this.props.period, ['live', 'day']);
    props.data = data;

    return (
      <AreaChart {...props} animating oldData={recountValues(oldData)}>
        {this.props.children}
        {this.renderTooltip(data)}
        <EndDot data={data} dotVisible={dotVisible} />
      </AreaChart>
    );
  }
}

export default AnimatedChart;
export { AreaChart };
