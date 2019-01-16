// @flow

import R from 'ramda';
import React, { Component, type ElementRef } from 'react';
import {
  TouchableHighlight, Text, StyleSheet, Dimensions, FlatList,
} from 'react-native';

const activeColor = '#ffffff';
const inactiveColor = `${activeColor}66`;
const { width: windowWidth } = Dimensions.get('window');
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
  currencies: {
    [string]: string,
  },
};

type TogglePeriodState = {
  currenciesList: Array<{ slug: string, label: string }>,
  selected: string,
  labelsWidth: number,
};

class ToggleCurrency extends Component<TogglePeriodProps, TogglePeriodState> {
  constructor(props) {
    super(props);

    const currenciesList = R.pipe(
      R.mapObjIndexed((label, slug) => ({ slug, label })),
      R.values,
    )(props.currencies);
    const selected = props.value;

    this.state = {
      currenciesList,
      selected,
      labelsWidth: 0,
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

  render() {
    const {
      state: { currenciesList, selected, labelsWidth },
    } = this;
    const isWithScroll = labelsWidth > windowWidth;
    return (
      <FlatList
        data={currenciesList}
        extraData={selected}
        horizontal
        keyExtractor={R.prop('slug')}
        ref={ref => (this.flatList = ref)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styleSheet.buttonsView, !isWithScroll && styleSheet.stretchedContainer]}
        scrollEnabled={isWithScroll}
        renderItem={({ item: { label, slug } }) => (
          <TouchableHighlight
            style={[styleSheet.button, isWithScroll && styleSheet.spaceAroundLabels]}
            color="transparent"
            underlayColor="transparent"
            onPress={() => this.changeCurrency(slug)}
            onLayout={({
              nativeEvent: {
                layout: { width },
              },
            }) => this.setState(prevState => ({ labelsWidth: prevState.labelsWidth + width + 20 }))}
          >
            <Text style={selected === slug ? styleSheet.activeText : styleSheet.text}>{label}</Text>
          </TouchableHighlight>
        )}
      />
    );
  }
}

export default ToggleCurrency;
