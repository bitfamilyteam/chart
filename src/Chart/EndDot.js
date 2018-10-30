// @flow

import React from 'react';
import { G, Circle } from 'react-native-svg';
import * as ease from 'd3-ease';
import extractTransform from 'react-native-svg/lib/extract/extractTransform';
import type { Point } from './types';

type EndDotProps = {
  data: Array<Point>,
  convertX?: number => number,
  convertY?: number => number
};

const ANIMATION_PERIOD_MS = 3000;
const ANIMATION_DURATION_MS = 800;
const ANIMATION_MAX_SCALE_RADIUS = 4.5;

function interpolate(from: number, to: number, phase: number): number {
  return from + (to - from) * phase;
}

class EndDot extends React.PureComponent<EndDotProps> {
  circle: Circle;
  animationTimeoutId: any;
  requestId: any;
  startTime: number;

  onCircleRef = (circle: Circle) => {
    this.circle = circle;
  }

  getCurrentTimeMS = () => new Date().getTime()

  update = () => {
    if (this.circle) {
      const currentTime = this.getCurrentTimeMS();
      const phase = (currentTime - this.startTime) / ANIMATION_DURATION_MS;

      const scalePhase = Math.min(1, phase / 0.9);
      const scale = interpolate(0, ANIMATION_MAX_SCALE_RADIUS, scalePhase);
      const opacity = interpolate(1, 0, Math.max(0, ease.easeCubic(3 * (phase - 2 / 3))));

      const position = this.getPosition();
      if (position) {
        const matrix = extractTransform({ scale });
        this.circle.setNativeProps({ matrix, opacity });
      }

      if (phase >= 1) {
        this.requestId = null;
        return;
      }
    }

    this.scheduleUpdate();
  }

  scheduleUpdate = () => {
    this.requestId = requestAnimationFrame(this.update);
  }

  startAnimation = () => {
    this.stopAnimation();
    this.startTime = this.getCurrentTimeMS();
    this.scheduleUpdate();
  }

  stopAnimation = () => {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
  }

  scheduleAnimation = () => {
    this.animationTimeoutId = setTimeout(
      () => {
        this.startAnimation();
        this.scheduleAnimation();
      },
      ANIMATION_PERIOD_MS,
    );
  }

  componentDidMount() {
    this.scheduleAnimation();
  }

  componentWillUnmount() {
    this.stopAnimation();
    clearTimeout(this.animationTimeoutId);
  }

  getPosition = () : ?Point => {
    const { data, convertX, convertY } = this.props;
    const endPoint = data[data.length - 1];

    if (!convertX || !convertY) return null;

    return { x: convertX(endPoint.x), y: convertY(endPoint.y) };
  }

  render() {
    const position = this.getPosition();
    if (!position) return null;
    return (
      <G x={position.x} y={position.y}>
        <Circle
          ref={this.onCircleRef}
          cx={0}
          cy={0}
          stroke="rgba(255, 255, 255, 1)"
          strokeWidth={0.5}
          fill="none"
          r={7}
        />
        <Circle
          cx={0}
          cy={0}
          fill="white"
          r={7}
        />
      </G>
    );
  }
}

export default EndDot;