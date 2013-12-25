var oexToken = '8556217a83d84985930d67d6cf934289';

var toCurrency = function(value, currentCode, code) {
  if (!value) return 0;
  return fx(value).from(code).to(currentCode);
};
var fromCurrency = function(value, currentCode, code) {
  if (!value) return 0;
  return fx(value).from(currentCode).to(code);
};

// rates - with or without tax brackets
// a)    = [{min: 10000, rate: 0.05}]
// b)    = [{min: 10000, max: 15000, rate: 0.05}]
// convertedIncome = 15000

var getRate = function(income, currentCurrency, currency, rates)  {
  var convertedIncome = fromCurrency(income, currentCurrency, currency);
  // Enable or disable tax brackets
  if ('next' in rates[0]) {
    // Brackets are enabled.
    var total = 0;
    var current = convertedIncome;
    // income 45000, brackets 20k: 0%, +10k: 2%, +10k: 3.5%
    // (45000 > 20000) = total -= 20000; 45000 - 20000 / 0
    // (15000 > 10000) = total -= 10000; 25000 - 10000 / 2
    // (5000  < 10000) = total = 0; 5000 / 3.5
    var list = rates;
    for (var i = 0, item, rate; i < list.length; i++) {
      item = list[i];
      rate = (item.rate / 100);
      // console.log('current', current, 'next', item.next);
      if (current > item.next) {
        // console.log('mult', item.next, rate);
        total += item.next * rate;
        current -= item.next;
      } else {
        // console.log('mult', current, rate);
        // console.log('total +=', total, current * rate);
        total += current * rate;
        return toCurrency(total, currentCurrency, currency);
      }
    }
    throw new Error('Something went wrong');
  } else {
    // Brackets are disabled.
    var list = rates.slice().reverse();
    for (var i = 0, item; i < list.length; i++) {
      item = list[i];
      if (convertedIncome >= item.min) {
        return toCurrency(convertedIncome * (item.rate / 100), currentCurrency, currency);
      }
    }
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
  // :/
  // Over  But not over  Tax +%  On amount over
  // $0  $8,925  $0.00 10  $ 0
  // 8,925 36,250  892 15  8,925
  // 36,250  87,850  4,991 25  36,250
  // 87,850  183,250 17,891  28  87,850
  // 183,250 398,350 44,603  33  183,250
  // 398,350 400,000 115,586 35  398,350
  // 400,000 ----- ----- 39.6  -----
  {country: 'United States', code: 'USD', symbol: 'US$', rates: [
    {next: 8925, rate: 0}, // 0-8,925
    {next: 27325, rate: 25}, // 8,925-36,250
    {next: 51600, rate: 28}, // 36,250-87,850
    {next: 95400, rate: 33}, // 87,850-183,250
    {next: 215100, rate: 35}, // 183,250-398,350
    {next: 1650, rate: 39.6}, // 398,350-400K
    {next: Infinity, rate: 40} // 400K+
  ], states: [
     {state: 'California', rates: [
        {next: 7455, rate: 0},
        {next: 10221, rate: 2},
        {next: 10221, rate: 4},
        {next: 10221, rate: 6},
        {next: 10221, rate: 8},
        {next: 10221, rate: 2},
        {next: 201058, rate: 9.3},
        {next: 50000, rate: 10.3},
        {next: 200000, rate: 11.3},
        {next: Infinity, rate: 12.3},
     ]}
  ]},

  {country: 'Hong Kong', code: 'HKD', symbol: 'HK$', rates: [
    {min: 0, rate: 2},
    {min: 40000, rate: 7},
    {min: 80000, rate: 12},
    {min: 120000, rate: 17}
  ]},

  {country: 'Singapore', code: 'SGD', symbol: 'SG$', rates: [
    {next: 20000, rate: 0},
    {next: 10000, rate: 2},
    {next: 10000, rate: 3.5},
    {next: 40000, rate: 7},
    {next: 40000, rate: 11.5},
    {next: 40000, rate: 15},
    {next: 40000, rate: 17},
    {next: 120000, rate: 18},
    {next: Infinity, rate: 20}
  ]},

  // Tax Base (Yen)  Tax
  // 1 - 1,950,000 5%
  // 1,950,001-3,300,000 10%
  // 3,300,001 - 6,950,000 20% of base exceeding 3,300,000
  // 6,950,001-9,000,000 23% of base exceeding 6,950,000
  // 9,000,001 - 18,000,000  33% of base exceeding 9,000,000
  // 18,000,001 and over 40% of base exceeding 18,000,000

  {country: 'Japan', code: 'JPY', symbol: '¥', rates: [
    {next: 1950000, rate: 5},
    {next: 1350000, rate: 10}, // 3300000-1950000
    {next: 3650000, rate: 20}, // 6950000-3300000
    {next: 2050000, rate: 23}, // 9000000-6950000
    {next: 9000000, rate: 33}, // 18000000-9000000
    {next: Infinity, rate: 40}
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

  {country: 'Russia', code: 'RUB', rates: [{min: 0, rate: 13}]},
  {country: 'Ukraine', code: 'UAH', symbol: '₴', rates: [
    {min: 0, rate: 15},
    {min: 12180, rate: 17}
  ]},
  {country: 'Belarus', code: 'BYR', rates: [{min: 0, rate: 12}]}
];

var symbols = {};
policies.forEach(function(item) {
  symbols[item.code] = item.symbol || item.code;
});

App = Ember.Application.create();
App.deferReadiness();

App.TaxPolicy = Ember.Object.extend({
  country: null,
  calculateFor: function(annualIncome, currentCurrency) {}
});

App.TAX_POLICIES = policies.map(function(item) {
  return App.TaxPolicy.create({country: item.country, calculateFor: makeCalc(item)});
});

Currencies = Ember.Object.extend({
  currentSymbol: function() {
    return symbols[this.get('current')];
  }.property('current')
});

App.CURRENCIES = policies.map(function(item) {
  return {code: item.code, symbol: symbols[item.code]};
});

App.Entry = Ember.Object.extend({
  policy: null,
  country: Ember.computed.alias('policy.country'),
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
      return App.Entry.create({policy: policy, calculator: self});
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
