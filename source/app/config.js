module.exports = {
  currencies: {
    url: 'http://openexchangerates.org/api/latest.json?app_id=8556217a83d84985930d67d6cf934289',
    symbols: {
      USD: 'US$',
      CAD: 'CA$',
      HKD: 'HK$',
      SGD: 'SG$',
      AUD: 'AU$',
      THB: '฿',
      JPY: '¥',
      GBP: '£',
      EUR: '€',
      CZK: 'Kč',
      UAH: '₴',
      BTC: 'BTC'
    },

    sorter: ['USD', 'EUR', 'GBP', 'RUB', 'UAH', 'BTC']
  },

  subjectiveWords: {
    crime: ['very high', 'high', 'moderate', 'low', 'very low'],
    prices: ['very expensive', 'expensive', 'moderate', 'cheap', 'very cheap'],
    business: ['very hard', 'hard', 'moderate', 'easy', 'very easy'],
    corruption: ['very bad', 'bad', 'moderate', 'good', 'very good'],
    total: ['very bad', 'bad', 'moderate', 'good', 'very good']
  }
};
