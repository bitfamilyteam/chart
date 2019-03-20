// @flow

import R from 'ramda';
import React from 'react';
import { View, TouchableHighlight, Text, StyleSheet } from 'react-native';
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
  locale: string,
};

const commonStyle = StyleSheet.create(TogglePeriodStyle());
const activeStyle = StyleSheet.create(TogglePeriodStyle(true));

function TogglePeriod(props: TogglePeriodProps) {
  const { value, setValue, isDeclining, locale, periods } = props;
  const PeriodToggleButtonsView = R.map(period => {
    const { title } = period;
    const style = period.value === value ? activeStyle : commonStyle;

    return (
      <TouchableHighlight
        key={`PeriodToggleButton-${title}`}
        style={style.button}
        title={title}
        color="transparent"
        underlayColor="transparent"
        onPress={() => setValue(period.value)}
      >
        <View style={style.textBackground}>
          <Text style={isDeclining ? style.decliningText : style.growingText}>{title}</Text>
        </View>
      </TouchableHighlight>
    );
  }, periods);
  return <View style={commonStyle.buttonsView}>{PeriodToggleButtonsView}</View>;
}

export default TogglePeriod;
export type { Period };
