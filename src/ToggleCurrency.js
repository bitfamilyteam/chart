// @flow

import R from 'ramda';
import React from 'react';
import {
  View, TouchableHighlight, Text, StyleSheet,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { currencyTitles } from './currencyHelpers';

const inactiveColor = 'rgba(255, 255, 255, 0.4)';

const styleSheet = StyleSheet.create({
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 17,
    color: inactiveColor,
  },
  activeText: {
    fontSize: 17,
    color: 'white',
  },
  buttonsView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

type TogglePeriodProps = {
  value: string,
  setValue: string => void,
  currencies: Array<string>
};

function DecorationLine(props: {style: any}) {
  return (
    <Svg style={{ width: 30, height: 1, ...props.style }}>
      <Line x1="0" y1="0" x2="30" y2="0" strokeWidth="1" stroke={inactiveColor} />
    </Svg>
  );
}

function ToggleCurrency(props: TogglePeriodProps) {
  const { value, setValue, currencies } = props;
  return (
    <View style={styleSheet.buttonsView}>
      <DecorationLine style={{ marginRight: 5 }} />
      {
        R.map(
          currency => (
            <TouchableHighlight
              key={currency}
              style={styleSheet.button}
              color="transparent"
              underlayColor="transparent"
              onPress={() => {
                setValue(currency);
              }}
            >
              <Text style={value === currency ? styleSheet.activeText : styleSheet.text}>
                {currencyTitles[currency] || currency}
              </Text>
            </TouchableHighlight>
          ),
          currencies,
        )
      }
      <DecorationLine style={{ marginLeft: 5 }} />
    </View>
  );
}

export default ToggleCurrency;
