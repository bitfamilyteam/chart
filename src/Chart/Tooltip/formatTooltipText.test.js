// @flow

import moment from 'moment';
import formatTooltipText from './formatTooltipText';

it('works for day', () => {
  const timestamp = moment([2018, 3, 26, 19, 11, 12]).valueOf();
  expect(formatTooltipText(timestamp, 'day')).toBe('07:10 PM');

  const timestamp2 = moment([2018, 3, 26, 2, 29, 12]).valueOf();
  expect(formatTooltipText(timestamp2, 'day')).toBe('02:25 AM');

  const edgeCaseTimestamp = moment([2018, 3, 26, 2, 1, 12]).valueOf();
  expect(formatTooltipText(edgeCaseTimestamp, 'day')).toBe('02:01 AM');
});

it('works for week', () => {
  const timestamp = moment([2018, 2, 4, 22, 11, 12]).valueOf();
  expect(formatTooltipText(timestamp, 'week')).toBe('10:00 PM Mar 04');
});

it('works for other periods', () => {
  const timestamp = moment([2017, 7, 4, 11, 11, 12]).valueOf();
  expect(formatTooltipText(timestamp, 'month')).toBe('Aug 04, 2017');
  expect(formatTooltipText(timestamp, 'year')).toBe('Aug 04, 2017');
  expect(formatTooltipText(timestamp, 'all')).toBe('Aug 04, 2017');
  expect(formatTooltipText(timestamp)).toBe('Aug 04, 2017');
});
