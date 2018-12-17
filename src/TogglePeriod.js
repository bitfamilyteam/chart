// @flow

import R from 'ramda';
import React from 'react';
import {
  View, TouchableHighlight, Text, StyleSheet,
} from 'react-native';
import TogglePeriodStyle from './TogglePeriod.style';

type Period = {
  title: string,
  type: string,
  diff: number,
};

type TogglePeriodProps = {
  value: string,
  setValue: string => void,
  isDeclining?: boolean,
};

const periods = [
  {
    title: '\u2022 LIVE',
    value: 'live',
  },
  {
    title: '1D',
    value: 'day',
  },
  {
    title: '1W',
    value: 'week',
  },
  {
    title: '1M',
    value: 'month',
  },
  {
    title: '1Y',
    value: 'year',
  },
  {
    title: 'All',
    value: 'all',
  },
];

const commonStyle = StyleSheet.create(TogglePeriodStyle());
const activeStyle = StyleSheet.create(TogglePeriodStyle(true));

function TogglePeriod(props: TogglePeriodProps) {
  const { value, setValue, isDeclining } = props;
  const mapIndexed = R.addIndex(R.map);
  const PeriodToggleButtonsView = mapIndexed((period, index) => {
    const { title } = period;
    const style = period.value === value ? activeStyle : commonStyle;

    return (
      <TouchableHighlight
        key={`PeriodToggleButton-${index}`}
        style={style.button}
        title={title}
        color="transparent"
        underlayColor="transparent"
        onPress={() => setValue(period.value)}
      >
        <View style={style.textBackground}>
          <Text style={isDeclining ? style.decliningText : style.growingText}> {title} </Text>
        </View>
      </TouchableHighlight>
    );
  }, periods);
  return <View style={commonStyle.buttonsView}> {PeriodToggleButtonsView} </View>;
}

export default TogglePeriod;
export type { Period };
