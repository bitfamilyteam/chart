import R from 'ramda';
import React from 'react';
import {
  Text, View, Image, Platform, StyleSheet,
} from 'react-native';
import { moment, changeMomentLocale } from './src/config';
import TogglePeriod from './src/TogglePeriod';
import ToggleCurrency from './src/ToggleCurrency';
import Chart from './src/Chart';
import SavlLogo from './src/SavlLogo';
import backgroundImage from './resources/background.jpg';

function getTimeLimit(time, period) {
  switch (period) {
    case 'live':
      return moment(time).subtract(1, 'hour');

    case 'day':
      return moment(time).startOf('day');

    case 'week':
      return moment(time).subtract(7, 'day');

    case 'month':
      return moment(time).subtract(1, 'month');

    case 'year':
      return moment(time).subtract(1, 'year');

    default:
      return null;
  }
}

function filterData(data, period, page) {
  if (data && data.length) {
    const lastTime = moment(data[data.length - 1].x);
    lastTime.subtract(page, 'day');
    const timeLimit = getTimeLimit(lastTime, period);
    if (!timeLimit) return data;

    const min = timeLimit.valueOf();
    const max = lastTime.valueOf();

    return R.filter(({ x }) => x >= min && x <= max, data);
  }
  return [];
}

const stretch = {
  width: '100%',
  height: '100%',
};
const stylesPrepared = bottomOffset =>
  StyleSheet.create({
    container: {
      ...stretch,
      backgroundColor: 'black',
    },
    bg: stretch,
    chartWrapper: {
      flex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      ...stretch,
    },
    chart: {
      left: 8,
      right: 8,
      top: 80,
      bottom: 60 + bottomOffset,
    },
    top: {
      position: 'absolute',
      top: 40,
      width: '100%',
      zIndex: 10,
    },
    bottom: {
      position: 'absolute',
      bottom: bottomOffset,
      width: '100%',
    },
  });

class ChartPage extends React.Component {
  constructor(props) {
    super(props);
    changeMomentLocale(props.locale);
    this.state = {
      period: 'year',
      page: 0,
      pickedCurrency: props.initialCurrency || '',
    };
  }

  setPeriod = period => this.setState({ period });

  setCurrency = pickedCurrency =>
    this.setState({ pickedCurrency }, () => this.props.onCurrencyChange && this.props.onCurrencyChange(pickedCurrency));

  render() {
    const {
      props: {
        data, bottomOffset, currencies, periods, fiat,
      },
      state: { period, page, pickedCurrency },
    } = this;
    const styles = stylesPrepared(bottomOffset);
    if (!data) return <Text>Loading...</Text>;

    const currency = data[pickedCurrency] ? pickedCurrency : currencies[0];
    const currencyData = R.path([currency, fiat.slug, 'ratesData'], data);

    const filteredData = filterData(currencyData, period, page);
    const isDeclining = filteredData.length >= 2 && filteredData[0].y > filteredData[filteredData.length - 1].y;
    return (
      <View style={styles.container}>
        <Image style={styles.bg} source={backgroundImage} />
        <View style={styles.chartWrapper}>
          <Chart
            data={filteredData}
            period={period}
            currency={currency}
            fiatSign={fiat.sign}
            contentInset={styles.chart}
          />
          <View style={styles.bottom}>
            <TogglePeriod value={period} setValue={this.setPeriod} isDeclining={isDeclining} periods={periods} />
          </View>
          <View style={styles.top}>
            <SavlLogo />
            <ToggleCurrency value={currency} setValue={this.setCurrency} currencies={currencies} />
          </View>
        </View>
      </View>
    );
  }
}

export default ChartPage;
