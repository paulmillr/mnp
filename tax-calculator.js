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

Ember.Handlebars.helper('money', function(value, symbol) {
  return accounting.formatMoney(value, symbol || '');
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
