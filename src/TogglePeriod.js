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

const periodTitles = {
  ru: {
    live: '\u2022 Live',
    day: 'День',
    week: 'Неделя',
    month: 'Месяц',
    year: 'Год',
    all: 'Все время',
  },
  en: {
    live: '\u2022 Live',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    all: 'All',
  },
};

const periodsList = ['live', 'day', 'week', 'month', 'year', 'all'];

const periods = locale =>
  periodsList.map(value => ({
    title: periodTitles[locale][value],
    value,
  }));

const commonStyle = StyleSheet.create(TogglePeriodStyle());
const activeStyle = StyleSheet.create(TogglePeriodStyle(true));

function TogglePeriod(props: TogglePeriodProps) {
  const { value, setValue, isDeclining, locale } = props;
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
  }, periods(locale));
  return <View style={commonStyle.buttonsView}>{PeriodToggleButtonsView}</View>;
}

export default TogglePeriod;
export type { Period };
