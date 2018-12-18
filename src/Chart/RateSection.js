// @flow

import R from 'ramda';
import React from 'react';
import { View, Text } from 'react-native';
import type { Point } from './types';

type RateSectionProps = {
  data: Array<Point>,
  period?: string,
  height?: number,
  fontFamily: string,
};

type RateSectionState = { position?: number };

function prepareValue(value: number): string {
  const str = Math.abs(value).toFixed(2);
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function preparePercents(value: number): string {
  return `${Math.floor(Math.abs(value) * 100) / 100}`;
}

function getRateStrings(props: RateSectionProps, position?: number) {
  const { data, period } = props;
  if (data && data.length <= 1) {
    return { mainString: '', subString: '' };
  }

  const start = R.head(data).y;
  let end = R.last(data).y;
  if (position) {
    const limit: number = position;
    const index = R.findLastIndex(({ x }) => x <= limit, data);
    if (index >= 0 && data && index < data.length - 1) {
      const left = data[index];
      const right = data[index + 1];
      const phase = (position - left.x) / (right.x - left.x);
      end = left.y + phase * (right.y - left.y);
    }
  }

  const mainString = prepareValue(end);
  const value = prepareValue(end - start);
  const deltaString = `${start > end ? '-' : '+'} $${value}`;

  if (period === 'all') {
    return { mainString, subString: deltaString };
  }

  const percents = preparePercents(((end - start) / start) * 100);
  return { mainString, subString: `${deltaString}(${percents}%)` };
}

class RateSection extends React.PureComponent<RateSectionProps, RateSectionState> {
  constructor(props: RateSectionProps) {
    super(props);
    this.state = {};
  }

  setPosition(position?: number) {
    this.setState({ position });
  }

  render() {
    const { fontFamily } = this.props;
    const { mainString, subString } = getRateStrings(this.props, this.state.position);

    const [wholeSum, partSum] = mainString.split('.');
    const textStyle = { color: 'white', fontSize: 17, fontFamily: 'QuickFuse' };

    return (
      <View style={{ height: this.props.height || 60, width: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' }}>
          <Text style={textStyle}>$</Text>
          <Text
            style={{
              ...textStyle,
              fontSize: 36,
              position: 'relative',
              top: 2,
            }}
          >
            {wholeSum}.
          </Text>
          <Text style={textStyle}>{partSum}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ ...textStyle, fontFamily }}>{subString}</Text>
        </View>
      </View>
    );
  }
}

export default RateSection;
