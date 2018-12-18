// @flow

import React from 'react';
import R from 'ramda';
import throttle from 'lodash.throttle';
import { G, Line, Circle } from 'react-native-svg';
import bounds from 'binary-search-bounds';
import extractTransform from 'react-native-svg/lib/extract/extractTransform';
import type { Point } from '../types';

type TooltipProps = {
  position: {
    x: number,
    y: number,
  },
  width: number,
  height: number,
  data: Array<Point>,
  period?: string,
  topOffset?: number,
  convertX?: number => number,
  convertY?: number => number,
  fontFamily?: string,
};
class Tooltip extends React.PureComponent<TooltipProps, { visible: boolean }> {
  root: G;
  mark: Circle;
  position: number = 0;

  constructor(props: TooltipProps) {
    super(props);
    this.state = { visible: false };
  }

  onRootRef = (root: G) => (this.root = root);

  onMarkRef = (mark: Circle) => (this.mark = mark);

  interpolateDataPoint = (): ?Point => {
    const { position } = this;
    const { data } = this.props;
    if (!position || !data || !data.length || R.head(data).x > position || R.last(data).x < position) {
      return null;
    }

    const index = bounds.ge(data, { x: position }, (left, right) => left.x - right.x);

    const start = data[index - 1];
    const end = data[index];
    const rate = (position - start.x) / (end.x - start.x);
    return { x: start.x + rate * (end.x - start.x), y: start.y + rate * (end.y - start.y) };
  };

  updatePosition = () => {
    const dataPoint = this.interpolateDataPoint();
    const visible = !!dataPoint;
    this.setState({ visible });
    if (!dataPoint || !visible) return;

    const { convertX, convertY } = this.props;
    if (!convertX || !convertY) return;
    const markerPoint = { x: convertX(dataPoint.x), y: convertY(dataPoint.y) };

    if (markerPoint && this.root) {
      const matrix = extractTransform({ x: markerPoint.x });
      this.root.setNativeProps({ matrix });

      if (this.mark) {
        const markMatrix = extractTransform({ y: markerPoint.y });
        this.mark.setNativeProps({ matrix: markMatrix });
      }
    }
  };

  setPosition = throttle((position: number) => {
    this.position = position;
    this.updatePosition();
  }, 50);

  componentDidUpdate() {
    this.updatePosition();
  }

  render() {
    const { height, period, topOffset = 0 } = this.props;
    const visible = this.state.visible && period !== 'live';

    return (
      <G opacity={visible ? 1 : 0} y={topOffset}>
        <G ref={this.onRootRef} y={0}>
          <Line y1={110} y2={height - 80 - topOffset} stroke="rgb(255, 255, 255)" strokeWidth={1} />
          <Circle
            cy={-topOffset}
            ref={this.onMarkRef}
            r={4.5}
            stroke="rgb(255, 255, 255)"
            strokeWidth={1}
            fill="rgb(255, 255, 255)"
          />
        </G>
      </G>
    );
  }
}

export default Tooltip;
