// @flow

import R from 'ramda';
import moment from 'moment';
import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import renderer from 'react-test-renderer';
import Svg, { G, Path, Rect } from 'react-native-svg';
import AreaChart from './AreaChart';
import AnimatedChart from './AnimatedChart';
import Background from './Background';
import Gradient from './Gradient';
import defaultGradients from './defaultGradients';
import type { Point } from './types';
import Tooltip from './Tooltip';
import TooltipText from './Tooltip/TooltipText';
import EndDot from './EndDot';
import RateSection from './RateSection';
import { screenToDataPosition } from './helpers';
import Chart from './index';

declare var expect: any;

const data = [
  {
    x: 1529927077000,
    y: 6219.01,
  },
  {
    x: 1529927617000,
    y: 6225.17,
  },
  {
    x: 1529927677000,
    y: 6227.08,
  },
  {
    x: 1529927737000,
    y: 6232.47,
  },
  {
    x: 1529927747000,
    y: 6232.25,
  },
];

function renderChartAndInitLayout(props) {
  const rendered = renderer.create(<Chart {...props} />);
  const onLayout = R.path(['children', '1', 'children', '0', 'props', 'onLayout'], rendered.toJSON());
  const chartOnLayout = rendered.root.instance.onLayout;

  chartOnLayout({
    nativeEvent: {
      layout: {
        width: 300,
        height: 200,
      },
    },
  });
  if (onLayout) {
    onLayout({
      nativeEvent: {
        layout: {
          width: 300,
          height: 200,
        },
      },
    });
  }

  return rendered;
}

it('renders without crashing', () => {
  const rendered = renderer.create(<Chart data={[]} />).toJSON();
  expect(rendered).toBeTruthy();
});

it('works on empty data', () => {
  const rendered = renderer.create(<Chart data={[]} />).toJSON();
  expect(rendered).toBeTruthy();
});

it('works on single point', () => {
  const singlePointData = [
    {
      x: 1529853864000,
      y: 5894.84,
    },
  ];
  const rendered = renderer.create(<Chart data={singlePointData} />).toJSON();
  expect(rendered).toBeTruthy();
});

it('handles touch', (done) => {
  const rendered = renderChartAndInitLayout({ data });

  const tooltip = rendered.root.findByType(Tooltip);
  expect(tooltip).toBeTruthy();

  const rootSpy = jest.fn();
  const markSpy = jest.fn();
  tooltip.instance.onRootRef({ setNativeProps: rootSpy });
  tooltip.instance.onMarkRef({ setNativeProps: markSpy });

  rendered.root.instance.onStartTouch({
    nativeEvent: {
      locationX: 10,
      locationY: 15,
    },
  });

  expect(rootSpy).toHaveBeenCalledTimes(2);
  expect(rootSpy.mock.calls[1][0]).toBeDeepCloseTo({ matrix: [1, 0, 0, 1, 9.9999999635611, 0] });

  expect(markSpy).toHaveBeenCalledTimes(2);
  expect(markSpy.mock.calls[1][0]).toBeDeepCloseTo({ matrix: [1, 0, 0, 1, 0, 100] });

  const tooltipText = rendered.root.findByType(TooltipText);
  expect(tooltipText).toBeTruthy();
  if (tooltipText) {
    const text = tooltipText.findByType(Text);
    expect(text).toBeTruthy();
    if (text) {
      expect(text.props.children).toBe('Jun 25, 2018');
    }
  }

  expect(tooltip.instance.state.visible).toBe(true);
  rendered.root.instance.onEndTouch();

  setTimeout(
    () => {
      expect(tooltip.instance.state.visible).toBe(false);
      expect(tooltip.findByType(G).props.opacity).toBe(0);
      done();
    },
    60,
  );
});

describe('rendered custom strokeWidth', () => {
  it('with default strokeWidth', () => {
    const rendered = renderer.create(<Chart data={data} />);
    const areaChart = rendered.root.findByType(AreaChart);
    const strokeWidth = R.path(['props', 'svg', 'strokeWidth'], areaChart);
    expect(strokeWidth).toBe(2);
  });
  it('with custom strokeWidth', () => {
    const rendered = renderer.create(<Chart data={data} strokeWidth={5} />);
    const areaChart = rendered.root.findByType(AreaChart);
    const strokeWidth = R.path(['props', 'svg', 'strokeWidth'], areaChart);
    expect(strokeWidth).toBe(5);
  });
});

it('rendered with custom style', () => {
  const customStyle = { width: 1000, height: 1200 };
  const rendered = renderer.create(<Chart data={data} style={customStyle} />);
  const rootView = rendered.root.findByType(View);
  expect(rootView.instance.props.style).toBe(customStyle);
});

it('single point to line', () => {
  const rendered = renderChartAndInitLayout({ data: [{ x: 0, y: 900 }] });
  const areaChart = rendered.root.findByType(AreaChart);

  const chartData = areaChart.instance.props.data;
  const firstPointY = chartData[0].y;

  expect(chartData.length).toBe(2);
  expect(chartData[1].y).toEqual(firstPointY);
  expect(chartData[1].y).toBe(900);
});

it('check gradients', () => {
  const gradientOptions = R.clone(defaultGradients);
  const rendered = renderChartAndInitLayout({ data, gradientOptions });

  const background = rendered.root.findByType(Background);
  const backgroundRect = background.findByType(Rect);
  expect(backgroundRect.props.fill).toBe('url(#background)');

  const backgroundGradient = background.findByType(Gradient);
  expect(backgroundGradient.props.id).toBe('background');
  expect(backgroundGradient.props.options).toEqual(gradientOptions.backgroundGrow);

  const areaChart = rendered.root.findByType(AreaChart);
  const svg = areaChart.findByType(Svg);
  const areaPath = svg.props.children[0];
  expect(areaPath.props.fill).toBe('url(#areaChartFill)');
  const shadowPath = svg.props.children[1];
  expect(shadowPath.props.fill).toBe('url(#areaChart)');
  const linePath = R.find(child => child.props.strokeLinejoin === 'round', svg.props.children);
  expect(linePath).toBeTruthy();
  if (linePath) {
    expect(linePath.props.stroke).toBe('url(#areaChart)');
  }

  const gradients = rendered.root.findByType(AnimatedChart).findAllByType(Gradient);
  expect(gradients.length).toBe(2);
  expect(gradients[0].props.id).toBe('areaChart');
  expect(gradients[0].props.options).toEqual(gradientOptions.areaChart);
  expect(gradients[1].props.id).toBe('areaChartFill');
  expect(gradients[1].props.options).toEqual(gradientOptions.areaChartFill);
});

describe('render different amount of data', () => {
  const times = [3, 10, 100, 1000];
  R.forEach((time) => {
    const testData = [{ x: 0, y: 910 }, { x: 1, y: 1720 }];
    const newData = testData;
    let index = 1;
    while (newData.length < time) {
      const { x } = testData[testData.length - 1];
      const point = {
        x: x + index,
        y: testData[testData.length - 1].y,
      };
      newData.push(point);
      index += 1;
    }
    it(`render ${time} data`, () => {
      const rendered = renderer.create(<Chart data={newData} />);
      const areaChart = rendered.root.findByType(AreaChart);
      const chartDataLength = areaChart.instance.props.data.length;
      expect(chartDataLength).toBe(time);
    });
  }, times);
});

type PseudoComponentState = {
  data: Array<Point>
};

class WrappedChart extends PureComponent<any, PseudoComponentState> {
  constructor(props: any) {
    super(props);
    this.state = {
      data,
    };
  }

  render() {
    return (
      <View>
        <Chart {...this.props} data={this.state.data} tooltip={Tooltip} />
      </View>
    );
  }
}

function renderWrappedChart(props = {}) {
  const rendered = renderer.create(<WrappedChart {...props} />);

  const chart = rendered.root.findByType(Chart);
  expect(chart.instance.onLayout).toBeTruthy();
  if (chart.instance.onLayout) {
    chart.instance.onLayout({
      nativeEvent: {
        layout: {
          width: 300,
          height: 200,
        },
      },
    });
  }

  return rendered;
}

it('tooltip removed from render if not in data', () => {
  const rendered = renderWrappedChart();

  const tooltip = rendered.root.findByType(Tooltip);
  const rootTooltipSpy = jest.fn();
  tooltip.instance.onRootRef({ setNativeProps: rootTooltipSpy });
  tooltip.instance.onMarkRef({ setNativeProps: jest.fn() });

  const chart = rendered.root.findByType(Chart);
  expect(chart.instance.onTouch).toBeTruthy();
  if (chart.instance.onTouch) {
    chart.instance.onTouch({
      nativeEvent: {
        locationX: 1,
        locationY: 2,
      },
    });
  }

  const pathSpy = jest.fn();
  const animatedChart = rendered.root.findByType(AnimatedChart);
  animatedChart.instance.onPathRef({
    setNativeProps: pathSpy,
  });

  expect(tooltip.findByType(G).props.opacity).toBe(1);

  rendered.root.instance.setState({
    data: [
      {
        x: 1529927747000 + 1000000,
        y: 6219.01,
      },
      {
        x: 1529927747000 + 2000000,
        y: 6225.17,
      },
    ],
  });

  expect(tooltip.findByType(G).props.opacity).toBe(0);
  expect(pathSpy).not.toBeCalled();
});

it('changing layout wont cause changing tooltip position', () => {
  const rendered = renderChartAndInitLayout({ data });
  const tooltip = rendered.root.findByType(Tooltip);
  expect(tooltip).toBeTruthy();

  tooltip.instance.onRootRef({ setNativeProps: jest.fn() });
  tooltip.instance.onMarkRef({ setNativeProps: jest.fn() });

  const event = { nativeEvent: { locationX: 10, locationY: 15 } };
  const { locationX, locationY } = event.nativeEvent;
  const { width, height } = rendered.root.instance.state;
  const expectedPosition = screenToDataPosition({
    data, locationX, locationY, width, height,
  });
  const { onTouch } = rendered.root.instance;
  onTouch(event);

  const newLayout = { width: 200, height: 500 };
  const chartOnLayout = rendered.root.instance.onLayout;
  const onLayout = R.path(['children', '1', 'children', '0', 'props', 'onLayout'], rendered.toJSON());
  const { width: newWidth, height: newHeight } = rendered.root.instance.state;

  chartOnLayout({ nativeEvent: { layout: newLayout } });
  if (onLayout) {
    onLayout({ nativeEvent: { layout: newLayout } });
  }

  const nextPosition = screenToDataPosition({
    data, locationX, locationY, width: newWidth, height: newHeight,
  });
  expect(nextPosition).toEqual(expectedPosition);
});

it('animated transition', () => {
  const rendered = renderWrappedChart();

  const tooltip = rendered.root.findByType(Tooltip);
  const rootTooltipSpy = jest.fn();
  tooltip.instance.onRootRef({ setNativeProps: rootTooltipSpy });
  tooltip.instance.onMarkRef({ setNativeProps: jest.fn() });

  const pathSpy = jest.fn();
  const animatedChart = rendered.root.findByType(AnimatedChart);
  animatedChart.instance.onPathRef({
    setNativeProps: pathSpy,
  });

  let mockedTime = 0;
  animatedChart.instance.getCurrentTimeMS = () => mockedTime;

  const oldRequestAnimationFrame = global.requestAnimationFrame;
  const updater = jest.fn();
  global.requestAnimationFrame = updater;

  rendered.root.instance.setState({
    data: [
      ...R.takeLast(4, data),
      {
        x: 1529927747000 + 600000,
        y: 6232.25,
      },
    ],
  });

  expect(tooltip.findByType(G).props.opacity).toBe(0);

  expect(pathSpy).toHaveBeenCalledTimes(1);

  expect(updater).toHaveBeenCalledTimes(1);
  expect(pathSpy.mock.calls[0]).toBeDeepCloseTo([
    {
      matrix: [1, 0, 0, 1, 221.91780821917808, 0],
    },
  ]);

  mockedTime = 250;
  updater.mock.calls[0][0]();
  expect(updater).toHaveBeenCalledTimes(2);
  expect(pathSpy).toHaveBeenCalledTimes(2);
  expect(pathSpy.mock.calls[1]).toBeDeepCloseTo([
    {
      matrix: [1, 0, 0, 1, 27.73972602739726, 0],
    },
  ]);

  mockedTime = 500;
  updater.mock.calls[1][0]();
  expect(updater).toHaveBeenCalledTimes(2);
  expect(pathSpy).toHaveBeenCalledTimes(3);
  expect(pathSpy.mock.calls[2]).toBeDeepCloseTo([
    {
      matrix: [1, 0, 0, 1, 0, 0],
    },
  ]);

  global.requestAnimationFrame = oldRequestAnimationFrame;
});

it('end dot animation', () => {
  const rendered = renderChartAndInitLayout({ data, period: 'live' });
  const endDot = rendered.root.findByType(EndDot);

  const animatedChart = rendered.root.findByType(AnimatedChart);
  animatedChart.instance.onPathRef({ setNativeProps: jest.fn() });

  const circleSpy = jest.fn();
  endDot.instance.onCircleRef({
    setNativeProps: circleSpy,
  });

  let mockedTime = 0;
  endDot.instance.getCurrentTimeMS = () => mockedTime;

  const oldRequestAnimationFrame = global.requestAnimationFrame;
  const oldSetTimeout = global.setTimeout;
  const updater = jest.fn();
  const setTimeout = jest.fn();
  global.requestAnimationFrame = updater;
  global.setTimeout = setTimeout;

  endDot.instance.componentDidMount();
  expect(circleSpy).toHaveBeenCalledTimes(0);
  expect(updater).toHaveBeenCalledTimes(0);
  expect(setTimeout).toHaveBeenCalledTimes(1);

  setTimeout.mock.calls[0][0]();
  expect(updater).toHaveBeenCalledTimes(1);

  updater.mock.calls[0][0]();
  expect(circleSpy).toHaveBeenCalledTimes(1);
  expect(circleSpy.mock.calls[0]).toBeDeepCloseTo([
    {
      matrix: [1, 0, 0, 1, 0, 0],
      opacity: 1,
    },
  ]);

  mockedTime = 800;
  updater.mock.calls[1][0]();
  expect(circleSpy).toHaveBeenCalledTimes(2);
  expect(circleSpy.mock.calls[1]).toBeDeepCloseTo([
    {
      matrix: [4.5, 0, 0, 4.5, 0, 0],
      opacity: 0,
    },
  ]);

  global.requestAnimationFrame = oldRequestAnimationFrame;
  global.setTimeout = oldSetTimeout;
});

it('end dot animation cancel', () => {
  const rendered = renderChartAndInitLayout({ data, period: 'live' });
  const endDot = rendered.root.findByType(EndDot);

  const animatedChart = rendered.root.findByType(AnimatedChart);
  animatedChart.instance.onPathRef({ setNativeProps: jest.fn() });

  const circleSpy = jest.fn();
  endDot.instance.onCircleRef({
    setNativeProps: circleSpy,
  });

  const oldRequestAnimationFrame = global.requestAnimationFrame;
  const oldCancelAnimationFrame = global.cancelAnimationFrame;
  const oldSetTimeout = global.setTimeout;
  const oldClearTimeout = global.clearTimeout;
  const updater = jest.fn();
  const cancelUpdate = jest.fn();
  const setTimeout = jest.fn();
  const clearTimeout = jest.fn();
  global.requestAnimationFrame = updater;
  global.cancelAnimationFrame = cancelUpdate;
  global.setTimeout = setTimeout;
  global.clearTimeout = clearTimeout;

  endDot.instance.componentDidMount();

  updater.mockReturnValueOnce(111);
  setTimeout.mockReturnValueOnce(222);
  setTimeout.mock.calls[0][0]();
  expect(setTimeout).toHaveBeenCalledTimes(2);
  expect(updater).toHaveBeenCalledTimes(1);
  expect(circleSpy).toHaveBeenCalledTimes(0);

  endDot.instance.componentWillUnmount();

  expect(circleSpy).toHaveBeenCalledTimes(0);
  expect(cancelUpdate).toHaveBeenCalledTimes(1);
  expect(cancelUpdate.mock.calls[0][0]).toBe(111);
  expect(clearTimeout).toHaveBeenCalledTimes(1);
  expect(clearTimeout.mock.calls[0][0]).toBe(222);

  global.requestAnimationFrame = oldRequestAnimationFrame;
  global.cancelAnimationFrame = oldCancelAnimationFrame;
  global.setTimeout = oldSetTimeout;
  global.clearTimeout = oldClearTimeout;
});

it('day view works', () => {
  const startTime = moment([2018, 0, 1, 0, 0, 0]).valueOf();
  const middleTime = moment([2018, 0, 1, 12, 0, 0]).valueOf();
  const dayData = [{ x: startTime, y: 0 }, { x: middleTime, y: 100 }];
  const rendered = renderChartAndInitLayout({ data: dayData, period: 'day' });

  const areaChart = rendered.root.findByType(AreaChart);
  expect(areaChart).toBeTruthy();

  const svg = areaChart.findByType(Svg);
  expect(svg).toBeTruthy();

  const linePath = R.find(
    path => path.props.strokeLinejoin === 'round' && path.props.strokeWidth === 2,
    svg.findAllByType(Path),
  );

  expect(linePath).toBeTruthy();
  if (linePath) {
    expect(linePath.props.d).toBe('M0,100L135,100');
  }
});

it('rate section works', () => {
  const testData = [
    { x: 100, y: 10000 },
    { x: 150, y: 15000 },
    { x: 200, y: 5000.55 },
  ];
  const gradientOptions = R.clone(defaultGradients);
  const rendered = renderChartAndInitLayout({ data: testData, gradientOptions });

  const background = rendered.root.findByType(Background);
  const backgroundGradient = background.findByType(Gradient);

  const rateSection = rendered.root.findByType(RateSection);
  const texts = rateSection.findAllByType(Text);
  const text = R.last(texts);
  expect(text).toBeTruthy();
  if (text) {
    expect(text.props.children).toBe('- $4 999.45(49.99%)');
  }
  expect(backgroundGradient.props.options).toEqual(gradientOptions.backgroundDecline);

  const tooltip = rendered.root.findByType(Tooltip);
  tooltip.instance.onRootRef({ setNativeProps: jest.fn() });
  tooltip.instance.onMarkRef({ setNativeProps: jest.fn() });
  const chart = rendered.root.findByType(Chart);
  if (chart.instance.onTouch) {
    chart.instance.onTouch({
      nativeEvent: {
        locationX: 100,
        locationY: 2,
      },
    });
  }

  if (text) {
    expect(text.props.children).toBe('+ $3 333.33(33.33%)');
  }
  expect(backgroundGradient.props.options).toEqual(gradientOptions.backgroundDecline);
});
