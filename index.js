import R from 'ramda';
import moment from 'moment';
import React from 'react';
import {
  Text, View, Image, Platform,
} from 'react-native';
import { Font } from 'expo';
import TogglePeriod from './src/TogglePeriod';
import ToggleCurrency from './src/ToggleCurrency';
import Chart from './src/Chart';
import { currencyKeys } from './src/currencyHelpers';
import SavlLogo from './src/SavlLogo';
import quickFuseFont from './QuickFuse.otf';
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

    return R.filter(
      item => item.x >= min && item.x <= max,
      data,
    );
  }
  return [];
}

class ChartPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      period: 'all',
      page: 0,
      pickedCurrency: '',
    };
  }

  componentDidMount() {
    Font.loadAsync({
      'quick-fuse': quickFuseFont,
    });
  }

  setPeriod = (period) => {
    this.setState({ period });
  }

  setCurrency = (pickedCurrency) => {
    this.setState({ pickedCurrency });
  }

  render() {
    const {
      period, page, pickedCurrency,
    } = this.state;
    const { data } = this.props;
    if (!data) return <Text>Loading...</Text>;

    const currencies = prepareCurrencies(R.keys(data));
    const currency = data[pickedCurrency] ? pickedCurrency : currencies[0];
    const currencyData = R.path([currency, 'usd', 'ratesData'], data);

    const filteredData = filterData(currencyData, period, page);
    const isDeclining = filteredData.length >= 2 && filteredData[0].y > filteredData[filteredData.length - 1].y;

    return (
      <View style={{ width: '100%', height: '100%', backgroundColor: 'black' }}>
        {Platform.OS === 'ios' && <Image style={{ width: '100%', height: '100%' }} source={backgroundImage} />}
        <View style={{
          flex: 1, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        }}
        >
          <Chart
            data={filteredData}
            period={period}
            currency={currency}
            contentInset={{
              left: 0, right: 0, top: 80, bottom: 80,
            }}
          />
          <View style={{
            position: 'absolute', top: 40, height: 80, width: '100%',
          }}
          >
            <SavlLogo />
            <ToggleCurrency
              value={currency}
              setValue={this.setCurrency}
              currencies={currencies}
            />
          </View>
          <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
            <TogglePeriod value={period} setValue={this.setPeriod} isDeclining={isDeclining} />
          </View>
        </View>
      </View>
    );
  }
}

export default ChartPage;
