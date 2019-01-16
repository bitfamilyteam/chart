// @flow

import R from 'ramda';
import React, { Component, type ElementRef } from 'react';
import {
  TouchableHighlight, Text, StyleSheet, Dimensions, FlatList,
} from 'react-native';

const activeColor = '#ffffff';
const inactiveColor = `${activeColor}66`;
const { width } = Dimensions.get('window');
const styleSheet = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 17,
    color: inactiveColor,
  },
  activeText: {
    fontSize: 17,
    color: activeColor,
  },
  buttonsView: {
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});

type TogglePeriodProps = {
  value: string,
  setValue: string => void,
  currencies: {
    [string]: string,
  },
};

type TogglePeriodState = {
  currenciesList: Array<{ slug: string, label: string }>,
  selected: string,
  checkWidth: number,
};

class ToggleCurrency extends Component<TogglePeriodProps, TogglePeriodState> {
  constructor(props) {
    super(props);
    this.state = {
      currenciesList: R.pipe(
        R.mapObjIndexed((label, slug) => ({ slug, label })),
        R.values,
      )(props.currencies),
      selected: props.value,
      checkWidth: 0,
    };
  }

  flatList: ElementRef<FlatList>;

  componentDidMount() {
    const {
      props: { value },
      state: { currenciesList },
    } = this;
    const index = R.findIndex(R.propEq('slug', value))(currenciesList);
    const length = R.length(currenciesList);
    if (this.flatList && index > length / 2) {
      setTimeout(() => this.flatList.scrollToEnd(), 100);
    }
  }

  changeCurrency = (slug) => {
    this.props.setValue(slug);
    this.setState({ selected: slug });
  };

  render() {
    const {
      state: { currenciesList, selected, checkWidth },
    } = this;
    const isWithMargins = checkWidth > width;
    return (
      <FlatList
        data={currenciesList}
        extraData={selected}
        horizontal
        keyExtractor={R.prop('slug')}
        ref={ref => (this.flatList = ref)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styleSheet.buttonsView, !isWithMargins && { flex: 1 }]}
        onLayout={({ nativeEvent }) => console.log({ nativeEvent })}
        scrollEnabled={isWithMargins}
        renderItem={({ item: { label, slug } }) => (
          <TouchableHighlight
            style={[styleSheet.button, isWithMargins && { marginHorizontal: 10 }]}
            color="transparent"
            underlayColor="transparent"
            onPress={() => this.changeCurrency(slug)}
            onLayout={({
              nativeEvent: {
                layout: { width: w },
              },
            }) => {
              this.setState(({ checkWidth: cw }) => ({ checkWidth: cw + w + 20 }));
            }}
          >
            <Text style={selected === slug ? styleSheet.activeText : styleSheet.text}>{label}</Text>
          </TouchableHighlight>
        )}
      />
    );
  }
}

export default ToggleCurrency;
