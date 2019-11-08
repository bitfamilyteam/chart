// @flow

import R from 'ramda';
import React from 'react';
import type { Node } from 'react';
import * as shape from 'd3-shape';
import { View, StyleSheet, PanResponder } from 'react-native';
import { moment } from '../config';
import AnimatedChart from './AnimatedChart';
import type { PressEvent, LayoutEvent, Point } from './types';
import { handleSingleDataPoint } from './helpers';
import Gradient from './Gradient';
import type { GradientOptions } from './Gradient';
import RateSection from './RateSection';
import TooltipText from './Tooltip/TooltipText';
import defaultGradients from './defaultGradients';

type ContentInset = {
  left: number,
  right: number,
  bottom: number,
  top: number,
};

type ChartProps = {
  data: Array<Point>,
  strokeWidth: number,
  period?: string,
  currency?: string,
  fiatSign: string,
  gradientOptions?: { [key: string]: GradientOptions },
  tooltip?: any,
  style?: StyleSheet.Styles,
  contentInset?: ContentInset,
  fontFamily?: string,
};

type ChartState = {
  width: number,
  height: number,
};

const getDefaultFontFamily = (): string => 'System';

const addInset = (first: ContentInset, second?: ContentInset): ContentInset => ({
  left: first.left + R.propOr(0, ['left'], second),
  right: first.right + R.propOr(0, ['right'], second),
  top: first.top + R.propOr(0, ['top'], second),
  bottom: first.bottom + R.propOr(0, ['bottom'], second),
});

const RATE_SECTION_HEIGHT = 60;

function generateGradients(gradientOptions: { [key: string]: GradientOptions }): Array<Node> {
  const keys = R.keys(gradientOptions);
  return R.map(key => <Gradient key={`gradient_${key}`} id={key} options={gradientOptions[key]} />, keys);
}

function calculateRightInset(period?: string, width: number, data: Array<Point>): number {
  if (period === 'live') return 30;
  if (period !== 'day' || !data || data.length === 0) return 0;

  const currentTime = R.last(data).x;
  const startOfDayTime = moment(currentTime)
    .startOf('day')
    .valueOf();
  const endOfDayTime = moment(startOfDayTime)
    .add(1, 'day')
    .valueOf();
  const part = (endOfDayTime - currentTime) / (endOfDayTime - startOfDayTime);

  return 30 + (width - 30) * part;
}
class Chart extends React.PureComponent<ChartProps, ChartState> {
  static defaultProps = { strokeWidth: 2 };

  constructor(props: ChartProps) {
    super(props);
    this.state = { width: 0, height: 0 };

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: R.T,
      onStartShouldSetPanResponderCapture: R.T,
      onMoveShouldSetPanResponder: R.T,
      onMoveShouldSetPanResponderCapture: R.T,
      onPanResponderGrant: this.onStartTouch,
      onPanResponderMove: this.onTouch,
      onPanResponderRelease: this.onEndTouch,
      onPanResponderTerminationRequest: R.T,
      onPanResponderTerminate: R.T,
    });
  }

  panResponder: PanResponder;
  tooltip: any;
  tooltipText: any;
  rateSection: any;

  onTooltipRef = (tooltip: any) => (this.tooltip = tooltip);

  onTooltipTextRef = (tooltipText: any) => (this.tooltipText = tooltipText);

  onRateSectionRef = (rateSection: any) => (this.rateSection = rateSection);

  onStartTouch = (event: PressEvent) => this.onTouch(event);

  onEndTouch = () => this.setPosition();

  onTouch = (event: PressEvent) => {
    const { data, period } = this.props;
    if ((data && data.length < 2) || !this.tooltip) return;
    if (period === 'live') return;

    const { width } = this.state;
    const { locationX } = event.nativeEvent;
    const { left, right } = this.getContentInset();
    const part = Math.min(1, (locationX - left) / (width - left - right));

    const min = R.head(data).x;
    const max = R.last(data).x;
    const position = min + part * (max - min);
    this.setPosition(position);
  };

  setPosition(position?: number) {
    this.tooltip.setPosition(position);
    this.tooltipText.setPosition(position);
    this.rateSection.setPosition(position);
  }

  onLayout = (event: LayoutEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    this.setState({ width, height });
  };

  getContentInset(): ContentInset {
    const { width, height } = this.state;
    const { data, period } = this.props;
    if (data && data.length === 1) {
      return {
        left: 0,
        right: 0,
        bottom: parseInt(height) / 2,
        top: parseInt(height) / 2,
      };
    }

    return {
      left: 0,
      bottom: 40,
      top: 100,
      right: calculateRightInset(period, width, data),
    };
  }

  render() {
    const {
      data, strokeWidth, tooltip, period, currency, fiatSign, fontFamily = getDefaultFontFamily(),
    } = this.props;
    if (!(data && data.length)) return <View />;
    const { width, height } = this.state;
    const newData = handleSingleDataPoint(data);
    const gradientOptions = R.mergeDeepRight(defaultGradients, this.props.gradientOptions || {});

    return (
      <View style={this.props.style || { flex: 1 }} onLayout={this.onLayout} {...this.panResponder.panHandlers}>
        <View style={{ top: 130 }}>
          <RateSection
            ref={this.onRateSectionRef}
            height={RATE_SECTION_HEIGHT}
            data={data}
            period={period}
            fontFamily={fontFamily}
            fiatSign={fiatSign}
          />
        </View>
        <View style={{ position: 'absolute', top: 210 }}>
          <TooltipText ref={this.onTooltipTextRef} fontFamily="QuickFuse" period={period} width={width} data={data} />
        </View>
        <AnimatedChart
          onTooltipRef={this.onTooltipRef}
          style={{ flex: 1 }}
          data={newData}
          curve={shape.curveLinear}
          contentInset={addInset(this.getContentInset(), this.props.contentInset)}
          width={width}
          height={height - RATE_SECTION_HEIGHT}
          tooltip={tooltip}
          period={period}
          currency={currency}
          fontFamily={fontFamily}
          svg={{
            strokeWidth,
            strokeLinejoin: 'round',
            stroke: 'url(#areaChart)',
            fill: 'url(#areaChartFill)',
          }}
        >
          {generateGradients(R.pick(['areaChart', 'areaChartFill'], gradientOptions))}
        </AnimatedChart>
      </View>
    );
  }
}

export default Chart;
export { Gradient };
