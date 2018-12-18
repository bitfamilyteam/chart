// @flow

import R from 'ramda';
import React from 'react';
import { Text } from 'react-native';
import formatTooltipText from './formatTooltipText';
import type { Point } from '../types';

type TooltipTextProps = {
  fontFamily: string,
  period?: string,
  width: number,
  data: Array<Point>,
};

type TooltipTextState = {
  text: string,
  markerPosition: number,
};

const measureText = (text: string): number => (text.length - 1) * 8;

class TooltipText extends React.PureComponent<TooltipTextProps, TooltipTextState> {
  constructor(props: any) {
    super(props);
    this.state = { text: '', markerPosition: 0 };
  }

  setPosition(position: number): void {
    const { data, width } = this.props;
    const head = R.head(data);
    const last = R.last(data);
    if (position && head && last) {
      const markerPosition = ((position - head.x) / (last.x - head.x)) * width;
      this.setState({ text: formatTooltipText(position, this.props.period), markerPosition });
    } else {
      this.setState({ text: '' });
    }
  }

  calculateTextPosition = () => {
    const { text, markerPosition } = this.state;
    const limit = measureText(text) / 2 + 5;

    if (markerPosition < limit) {
      return { left: 5, textAlign: 'left' };
    }

    const { width } = this.props;
    if (markerPosition > width - limit) {
      return { left: -5, textAlign: 'right' };
    }
    return { left: markerPosition - width / 2, textAlign: 'center' };
  };

  render() {
    const { width, fontFamily } = this.props;
    return (
      <Text
        style={{
          color: 'white',
          fontFamily,
          fontSize: 15,
          width,
          ...this.calculateTextPosition(),
        }}
      >
        {this.state.text}
      </Text>
    );
  }
}

export default TooltipText;
