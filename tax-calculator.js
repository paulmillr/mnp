var oexToken = '8556217a83d84985930d67d6cf934289';

var toCurrency = function(value, fromCode, toCode) {
  if (!value) return 0;
  return fx(value).from(fromCode).to(toCode);
};
var fromCurrency = function(value, toCode, fromCode) {
  if (!value) return 0;
  return fx(value).from(fromCode).to(toCode);
};

// calculation type - simple or incremental
// rates - tax brackets
// a)    = [{min: 10000, rate: 0.05}]
// b)    = [{min: 10000, max: 15000, rate: 0.05}]
// convertedIncome = 15000

// Get rate.
//
// income      - The Integer income.
// currentCode - The String code.
// currency    - The String code.
// rates       - The Array of tax rates. First item should indicate calculation
//               type. Possible calculation types are 'simple' and 'incremental'.
var getRate = function(income, currentCurrency, currency, rates)  {
  if (!rates) return 0;
  var convertedIncome = fromCurrency(income, currentCurrency, currency);
  rates = rates.slice();
  var type = rates.shift(); // 'simple' or 'incremental'
  if (type == 'incremental') {
    var total = 0;
    var current = convertedIncome;
    // income 45000, brackets 20k: 0%, +10k: 2%, +10k: 3.5%
    // (45000 > 20000) = total -= 20000; 45000 - 20000 / 0
    // (15000 > 10000) = total -= 10000; 25000 - 10000 / 2
    // (5000  < 10000) = total = 0; 5000 / 3.5
    var list = rates;
    var prevMax = 0;
    for (var i = 0, item, rate; i < list.length; i++) {
      item = list[i];
      rate = (item.rate / 100);
      var next = item.max - prevMax;
      if (current > next) {
        total += next * rate;
        current -= next;
        var prevMax = item.max;
      } else {
        total += current * rate;
        return toCurrency(total, currentCurrency, currency);
      }
    }
    throw new Error('Something went wrong');
  } else {
    var list = rates.slice().reverse();
    for (var i = 0, item; i < list.length; i++) {
      item = list[i];
      if (convertedIncome >= item.min) {
        return toCurrency(convertedIncome * (item.rate / 100), currentCurrency, currency);
      }
    }
    console.log(rates)
    throw new Error('No rate matches the value ' + convertedIncome);
  }
};

var makeCalc = function(item) {
  if (typeof item.calc === 'function') return item.calc;
  return function(income, currency) {
    return getRate(income, currency, item.code, item.rates);
  };
};

var policies = [
  // Almost right. Needs some fix
  // http://www.worldwide-tax.com/us/us_taxes.asp
  // Income taxes by state: http://www.bankrate.com/finance/taxes/check-taxes-in-your-state.aspx
  // :/
  // Over  But not over  Tax +%  On amount over
  // $0  $8,925  $0.00 10  $ 0
  // 8,925 36,250  892 15  8,925
  // 36,250  87,850  4,991 25  36,250
  // 87,850  183,250 17,891  28  87,850
  // 183,250 398,350 44,603  33  183,250
  // 398,350 400,000 115,586 35  398,350
  // 400,000 ----- ----- 39.6  -----
  {country: 'United States', code: 'USD', symbol: 'US$', rates: ['incremental',
    {max: 8925, rate: 0},
    {max: 36250, rate: 15},
    {max: 87850, rate: 25},
    {max: 183250, rate: 28},
    {max: 398350, rate: 33},
    {max: 400000, rate: 35},
    {max: Infinity, rate: 39.6}
  ], states: [
    {state: 'Albama', rates: ['incremental',
      {max: 500, rate: 2},
      {max: 3000, rate: 3},
      {max: Infinity, rate: 5}
    ]},
    {state: 'Alaska', rates: null},
    {state: 'Arizona', rates: ['incremental',
      {max: 10000, rate: 2.59},
      {max: 25000, rate: 2.88},
      {max: 50000, rate: 3.36},
      {max: 150000, rate: 3.24},
      {max: Infinity, rate: 4.54}
    ]},
    {state: 'Arkasas', rates: ['incremental',
      {max: 4099, rate: 1},
      {max: 8199, rate: 2.5},
      {max: 12199, rate: 3.5},
      {max: 20399, rate: 4.5},
      {max: 33999, rate: 6},
      {max: Infinity, rate: 7}
    ]},
    {state: 'California', rates: ['incremental',
      {max: 7455, rate: 0},
      {max: 17676, rate: 2},
      {max: 27897, rate: 4},
      {max: 38726, rate: 6},
      {max: 48942, rate: 8},
      {max: 250000, rate: 9.3},
      {max: 300000, rate: 10.3},
      {max: 500000, rate: 11.3},
      {max: Infinity, rate: 12.3},
    ]},
    {state: 'Colorado', rates: ['simple', {min: 0, rate: 4.63}]},
    {state: 'Connecticut', rates: ['incremental',
      {max: 10000, rate: 3},
      {max: 50000, rate: 5},
      {max: 100000, rate: 5.5},
      {max: 200000, rate: 6},
      {max: 250000, rate: 6.5},
      {max: Infinity, rate: 6.7}
    ]},
    {state: 'Delaware', rates: ['incremental',
      {max: 2000, rate: 0},
      {max: 5000, rate: 2.2},
      {max: 10000, rate: 3.9},
      {max: 20000, rate: 4.8},
      {max: 25000, rate: 5.2},
      {max: 60000, rate: 5.55},
      {max: Infinity, rate: 6.75}
    ]}
  ]},

  {country: 'Hong Kong', code: 'HKD', symbol: 'HK$', rates: ['simple',
    {min: 0, rate: 2},
    {min: 40000, rate: 7},
    {min: 80000, rate: 12},
    {min: 120000, rate: 17}
  ]},

  {country: 'Singapore', code: 'SGD', symbol: 'SG$', rates: ['incremental',
    {max: 20000, rate: 0},
    {max: 30000, rate: 2},
    {max: 40000, rate: 3.5},
    {max: 80000, rate: 7},
    {max: 120000, rate: 11.5},
    {max: 160000, rate: 15},
    {max: 200000, rate: 17},
    {max: 320000, rate: 18},
    {max: Infinity, rate: 20}
  ]},

  {country: 'Japan', code: 'JPY', symbol: '¥', rates: ['incremental',
    {max: 1950000, rate: 5},
    {max: 3300000, rate: 10}, // 3300000-1950000
    {max: 6950000, rate: 20}, // 6950000-3300000
    {max: 9000000, rate: 23}, // 9000000-6950000
    {max: 18000000, rate: 33}, // 18000000-9000000
    {max: Infinity, rate: 40}
  ]},

  // Germany does not work.
  // http://www.parmentier.de/steuer/steuer.htm?wagetax.htm
  // Tax % Tax Base (EUR)
  // 0 Up to 8,130
  // 14% 8,131-52,881
  // 42% 52,882-250,730
  // 45% 250,731 and over
  // {country: 'Germany', code: 'EUR', rates: [
  //   {min: 0, rate: 0},
  //   {min: 8130, rate: 14},
  //   {min: 52881, rate: 42},
  //   {min: 250731, rate: 45}
  // ]}

  {country: 'Russia', code: 'RUB', rates: ['simplem', {min: 0, rate: 13}]},
  {country: 'Ukraine', code: 'UAH', symbol: '₴', rates: ['simple',
    {min: 0, rate: 15},
    {min: 12180, rate: 17}
  ]},
  {country: 'Belarus', code: 'BYR', rates: ['simple', {min: 0, rate: 12}]}
];

var symbols = {};
policies.forEach(function(item) {
  symbols[item.code] = item.symbol || item.code;
});

App = Ember.Application.create();
App.deferReadiness();

App.CURRENCIES = policies.map(function(item) {
  return {code: item.code, symbol: symbols[item.code]};
});

App.TaxPolicy = Ember.Object.extend({
  country: null,
  rates: null,
  code: null,
  calculateFor: function(annualIncome, currentCurrency) {
    return getRate(annualIncome, currentCurrency, this.get('code'), this.get('rates'));
  },
  name: Ember.computed.alias('country')
});

App.FederatedTaxPolicy = Ember.Object.extend({
  state: null,
  federalRates: null,
  stateRates: null,
  calculateFederalFor: function(annualIncome, currentCurrency) {
    return getRate(annualIncome, currentCurrency, this.get('code'), this.get('federalRates'));
  },
  calculateStateFor: function(annualIncome, currentCurrency) {
    return getRate(annualIncome, currentCurrency, this.get('code'), this.get('stateRates'));
  },
  calculateFor: function(annualIncome, currentCurrency) {
    return this.calculateFederalFor(annualIncome, currentCurrency) + this.calculateStateFor(annualIncome, currentCurrency);
  },
  name: function() {
    return this.get('country') + ' — ' + this.get('state');
  }.property('country', 'state')
});

App.TAX_POLICIES = []

policies.forEach(function(item) {
  if (item.states) {
    item.states.forEach(function(state) {
      var policy = App.FederatedTaxPolicy.create({ country: item.country, state: state.state, code: item.code, federalRates: item.rates, stateRates: state.rates });
      App.TAX_POLICIES.push(policy);
    });
  } else {
    App.TAX_POLICIES.push(App.TaxPolicy.create({ country: item.country, code: item.code, rates: item.rates }));
  }
});

App.Entry = Ember.Object.extend({
  policy: null,
  country: Ember.computed.alias('policy.name'),
  calculator: null,
  annualIncome: Ember.computed.alias('calculator.annualIncome'),
  currency: Ember.computed.alias('calculator.currencySymbol'),

  amount: function() {
    return this.get('policy').calculateFor(this.get('annualIncome'), this.get('currency'));
  }.property('policy', 'annualIncome', 'currency'),

  takeHome: function() {
    return this.get('annualIncome') - this.get('amount');
  }.property('annualIncome', 'amount'),

  percentage: function() {
    return this.get('amount') / this.get('annualIncome');
  }.property('amount', 'annualIncome')
});

App.TaxCalculation = Ember.Object.extend({
  annualIncome: null,
  currencySymbol: 'USD',

  results: function() {
    var self = this;
    return App.TAX_POLICIES.map(function(policy) {
      return App.Entry.create({ policy: policy, calculator: self });
    });
  }.property()
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return App.TaxCalculation.create();
  }
});

App.IndexController = Ember.ObjectController.extend({
  income: null,

  incomeChanged: function() {
    var income = this.get('income');
    this.set('annualIncome', accounting.unformat(income));
  }.observes('income'),

  actions: {
    setIncome: function(value) {
      this.set('currencySymbol', 'USD');
      this.set('income', value);
    }
  }
});

App.ResultsController = Ember.ArrayController.extend({
  sortProperties: ['amount']
});

Ember.Handlebars.helper('money', function(value) {
  return accounting.formatMoney(value, '');
});

Ember.Handlebars.helper('percent', function(value) {
  return accounting.formatNumber(value * 100, 2) + '%';
});

$.getJSON('http://openexchangerates.org/api/latest.json?app_id=' + oexToken, function(data) {
  if (!fx) throw new Error('Provide money.js library');
  fx.rates = data.rates;
  fx.base = data.base;
  App.advanceReadiness();
});
