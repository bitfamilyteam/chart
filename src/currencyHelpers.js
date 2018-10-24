// @flow

import R from 'ramda';

const knownCurrencies = [
  {
    key: 'bitcoin',
    title: 'BTC',
  },
  {
    key: 'bcash',
    title: 'BCH',
  },
  {
    key: 'ethereum',
    title: 'ETH',
  },
  {
    key: 'ripple',
    title: 'XRP',
  },
  {
    key: 'litecoin',
    title: 'LTC',
  },
  {
    key: 'biocoin',
    title: 'BIO',
  },
];

const currencyKeys = R.map(R.prop('key'), knownCurrencies);
const currencyTitles = R.reduce(
  (result, { key, title }) => ({ ...result, [key]: title }),
  {},
  knownCurrencies,
);

export {
  currencyKeys,
  currencyTitles,
};
