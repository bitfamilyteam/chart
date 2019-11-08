// @flow

import R from 'ramda';
import React, { Component, type ElementRef } from 'react';
import {
  TouchableHighlight, Text, StyleSheet, Dimensions, FlatList,
} from 'react-native';

const activeColor = '#ffffff';
const inactiveColor = `${activeColor}66`;
const { width: windowWidth } = Dimensions.get('window');
const fontSize = 17;

const styleSheet = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    transform: [
      {
        translateY: -15,
      },
    ],
  },
  text: {
    fontSize,
    color: inactiveColor,
  },
  activeText: {
    fontSize,
    color: activeColor,
  },
  buttonsView: {
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stretchedContainer: {
    flex: 1,
  },
  spaceAroundLabels: {
    marginHorizontal: 10,
  },
});

type TogglePeriodProps = {
  value: string,
  setValue: string => void,
  currencies: Array<{ slug: string, label: string }>,
};

type TogglePeriodState = {
  currenciesList: Array<{ slug: string, label: string }>,
  selected: string,
  isWithScroll: boolean,
};

class ToggleCurrency extends Component<TogglePeriodProps, TogglePeriodState> {
  constructor(props) {
    super(props);
    const { currencies, value } = this.props;
    const labelsWidth = currencies.reduce((accumulator, { symbol }) => accumulator + symbol.length * fontSize, 0);
    const isWithScroll = labelsWidth > windowWidth;

    this.state = {
      currenciesList: currencies,
      selected: value,
      isWithScroll,
    };
  }

  flatList: ElementRef<FlatList>;

  componentDidMount() {
    const {
      props: { value },
      state: { currenciesList },
    } = this;

    const index = R.findIndex(({ slug }) => slug === value)(currenciesList);
    const halfLength = currenciesList.length / 2;

    if (this.flatList && index > halfLength) {
      setTimeout(() => this.flatList.scrollToEnd(), 100);
    }
  }

  changeCurrency = (slug) => {
    this.props.setValue(slug);
    this.setState({ selected: slug });
  };

  renderCurrency = ({ item: { symbol, slug } }) => {
    const { selected, isWithScroll } = this.state;
    return (
      <TouchableHighlight
        style={[styleSheet.button, isWithScroll && styleSheet.spaceAroundLabels]}
        color="transparent"
        underlayColor="transparent"
        onPress={() => this.changeCurrency(slug)}
        hitSlop={{
          top: 20,
          right: 10,
          bottom: 20,
          left: 10,
        }}
      >
        <Text style={selected === slug ? styleSheet.activeText : styleSheet.text}>{symbol}</Text>
      </TouchableHighlight>
    );
  };

  render() {
    const {
      state: { currenciesList, selected, isWithScroll },
    } = this;
    return (
      <FlatList
        data={currenciesList}
        extraData={selected}
        horizontal
        keyExtractor={R.prop('slug')}
        renderItem={this.renderCurrency}
        ref={ref => (this.flatList = ref)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styleSheet.buttonsView, !isWithScroll && styleSheet.stretchedContainer]}
        scrollEnabled={isWithScroll}
      />
    );
  }
}

export default ToggleCurrency;
