// @flow

import R from 'ramda';
import * as array from 'd3-array';
import * as ease from 'd3-ease';
import React from 'react';
import type { Node } from 'react';
import extractTransform from 'react-native-svg/lib/extract/extractTransform';
import AreaChart from './AreaChart';
import Tooltip from './Tooltip';
import EndDot from './EndDot';
import type { Point } from './types';

type Range = {
  min: number,
  max: number,
};

function getTimeRange(data: Array<Point>): Range {
  return {
    min: R.path(['0', 'x'], data) || 0,
    max: R.path([data.length - 1, 'x'], data) || 0,
  };
}

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

function interpolate(from: number, to: number, phase: number): number {
  return from + (to - from) * phase;
}

type AnimatedChartProps = any;
type AnimatedChartState = {
  oldData: Array<Point>,
  gridMin?: number,
  gridMax?: number,
};

const ANIMATION_DURATION_MS = 500;

class AnimatedChart extends React.PureComponent<AnimatedChartProps, AnimatedChartState> {
  path: any;
  tooltip: any;

  constructor(props: AnimatedChartProps) {
    super(props);
    this.state = {
      oldData: [],
    };
  }

  onPathRef = (path: any) => {
    this.path = path;
  };

  extent: Array<number>;
  oldExtent: Array<number>;
  startX: number;
  startTime: number;

  getCurrentTimeMS = () => new Date().getTime();

  componentWillReceiveProps(nextProps: AnimatedChartProps) {
    const { data } = this.props;
    if (nextProps.data === data) return;

    const nextRange = getTimeRange(nextProps.data);
    const range = getTimeRange(data);

    const sameCurrency = this.props.currency === nextProps.currency;
    if (sameCurrency && !R.equals(nextRange, range) && shouldAnimate(nextRange, range)) {
      this.startX = range.min;
      this.startTime = this.getCurrentTimeMS();
      this.oldExtent = array.extent(data, R.prop('y'));
      this.extent = array.extent(nextProps.data, R.prop('y'));
      this.setState({ oldData: this.props.data }, this.update);
    } else {
      this.stopAnimation();
      this.setState({ oldData: [] });
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
    if (oldData.length) {
      props.gridMin = gridMin;
      props.gridMax = gridMax;
    }

    const { data } = this.props;
    const dotVisible = R.contains(this.props.period, ['live', 'day']);

    return (
      <AreaChart {...props} animating oldData={oldData}>
        {this.props.children}
        {this.renderTooltip(this.props.data)}
        <EndDot data={data} dotVisible={dotVisible} />
      </AreaChart>
    );
  }
}

export default AnimatedChart;
export { AreaChart };
