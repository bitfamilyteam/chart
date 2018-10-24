// @flow

import moment from 'moment';

function alignBy5Minutes(time: moment) {
  const minutes = Math.floor(time.get('minutes') / 5) * 5;
  return time.set('minutes', minutes || 1);
}

function formatTooltipText(timestamp: number, period?: string): string {
  const time = moment(timestamp);

  switch (period) {
    case 'day':
      return alignBy5Minutes(time).format('hh:mm A');

    case 'week':
      return time.startOf('hour').format('hh:mm A MMM DD');

    case 'month':
    case 'year':
    case 'all':
    default:
      return time.format('MMM DD, YYYY');
  }
}

export default formatTooltipText;
