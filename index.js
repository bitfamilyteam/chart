
import * as R from 'ramda';
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import ms from 'ms';
import { changeMomentLocale } from './src/config';
import TogglePeriod from './src/TogglePeriod';
import ToggleCurrency from './src/ToggleCurrency';
import Chart from './src/Chart';
import SavlLogo from './src/SavlLogo';
import backgroundImage from './resources/background.jpg';
import { removeExtraPoints } from './src/Chart/helpers';

const timePeriods = {
  live: '2 hour',
  day: '1 day',
  week: '1 week',
  month: '31 days',
  year: '1 year',
  all: 'all',
};

function filterData(data, period) {
  return removeExtraPoints([timePeriods[period]], data, 60, ms('2 week'));
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

class ChartPage extends React.PureComponent {
  constructor(props) {
    super(props);
    const { locale, initialCurrency } = this.props;
    changeMomentLocale(locale);
    this.state = {
      period: 'year',
      pickedCurrency: initialCurrency || '',
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
      state: { period, pickedCurrency },
    } = this;

    if (!data) {
      return <Text>Loading...</Text>;
    }

    const styles = stylesPrepared(bottomOffset);
    const currency = data[pickedCurrency] ? pickedCurrency : currencies[0];
    const currencyData = R.path([currency, fiat.slug, 'ratesData'], data);

    const filteredData = filterData(currencyData, period);
    const isDeclining = filteredData.length >= 2 && filteredData[0].y > filteredData[filteredData.length - 1].y;

    return (
      <View style={styles.container}>
        <FastImage style={styles.bg} source={backgroundImage} />
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
