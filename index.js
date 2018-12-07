import R from 'ramda';
import moment from 'moment';
import React from 'react';
import { Text, View, Image, Platform, StyleSheet } from 'react-native';
import TogglePeriod from './src/TogglePeriod';
import ToggleCurrency from './src/ToggleCurrency';
import Chart from './src/Chart';
import { currencyKeys } from './src/currencyHelpers';
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

function prepareCurrencies(currencies) {
  return R.filter(key => R.contains(key, currencies), currencyKeys);
}

function filterData(data, period, page) {
  if (data.length) {
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
      bottom: 80 + bottomOffset,
    },
    top: {
      position: 'absolute',
      top: 40,
      height: 80,
      width: '100%',
    },
    bottom: {
      position: 'absolute',
      bottom: 20 + bottomOffset,
      width: '100%',
    },
  });

class ChartPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      period: 'year',
      page: 0,
      pickedCurrency: props.initialCurrency || '',
    };
  }

  setPeriod = period => {
    this.setState({ period });
  };

  setCurrency = pickedCurrency => {
    this.setState({ pickedCurrency });

    const { onCurrencyChange } = this.props;
    if (onCurrencyChange) {
      onCurrencyChange(pickedCurrency);
    }
  };

  render() {
    const {
      props: { data, bottomOffset },
      state: { period, page, pickedCurrency, showChart },
    } = this;
    const styles = stylesPrepared(bottomOffset);
    if (!data) return <Text>Loading...</Text>;

    const currencies = prepareCurrencies(R.keys(data));
    const currency = data[pickedCurrency] ? pickedCurrency : currencies[0];
    const currencyData = R.path([currency, 'usd', 'ratesData'], data);

    const filteredData = filterData(currencyData, period, page);
    const isDeclining = filteredData.length >= 2 && filteredData[0].y > filteredData[filteredData.length - 1].y;
    return (
      <View style={styles.container}>
        {Platform.OS === 'ios' && <Image style={styles.bg} source={backgroundImage} />}
        <View style={styles.chartWrapper}>
          <Chart data={filteredData} period={period} currency={currency} contentInset={styles.chart} />
          <View style={styles.bottom}>
            <TogglePeriod value={period} setValue={this.setPeriod} isDeclining={isDeclining} />
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
