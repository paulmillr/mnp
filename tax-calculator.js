var oexToken = '8556217a83d84985930d67d6cf934289';

var toCurrency = function(value, toCode, fromCode) {
  if (!value) return 0;
  return fx(value).from(fromCode).to(toCode);
};
var fromCurrency = function(value, fromCode, toCode) {
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
// income       - The Integer income.
// currentCode  - The String code.
// baseCurrency - The String code.
// rates        - The Array of tax rates. First item should indicate calculation
//                type. Possible calculation types are 'simple' and 'incremental'.
var getRate = function(income, currentCurrency, baseCurrency, rates)  {
  if (!rates) return 0;
  var convertedIncome = fromCurrency(income, currentCurrency, baseCurrency);
  var amount = getSameCurrencyRate(convertedIncome, rates);
  return toCurrency(amount, currentCurrency, baseCurrency);
}

var getSameCurrencyRate = function(convertedIncome, rates) {
  rates = rates.slice();
  var type = rates.shift(); // 'simple' or 'incremental'

  if (type == 'incremental') {
    // income 45000, brackets 20k: 0%, +10k: 2%, +10k: 3.5%
    // (45000 > 20000) = total -= 20000; 45000 - 20000 / 0
    // (15000 > 10000) = total -= 10000; 25000 - 10000 / 2
    // (5000  < 10000) = total = 0; 5000 / 3.5

    var hasInfinity = rates.any(function(item) { return item.max == Infinity; });

    if (!hasInfinity) throw new Error('Something went wrong');

    var ranges = rates.map(function(item, index) {
      var prev = rates[index-1] || {};
      var prevMax = prev.max || 0;
      return { min: prevMax, max: item.max, rate: item.rate, fixed: item.fixed || 0 };
    }).filter(function(item) {
      return convertedIncome > item.min;
    });

    var charges = ranges.map(function(item) {
      var max = item.max > convertedIncome ? convertedIncome : item.max;
      var bracket = max - item.min;
      var tax = bracket * item.rate / 100 + item.fixed;
      return tax;
    });

    var total = charges.reduce(function(memo, i) { return memo + i }, 0);

    return total;
  } else {
    var list = rates.slice().reverse();
    var item = list.find(function(i) { return convertedIncome < i.max });

    if (item) {
      return convertedIncome * item.rate / 100;
    }

    throw new Error('No rate matches the value ' + convertedIncome);
  }
};

var symbols = {};
policies.forEach(function(item) {
  symbols[item.code] = item.symbol || item.code;
});

App = Ember.Application.create();
App.deferReadiness();

App.CURRENCIES = policies.map(function(item) { return item.code }).
  uniq().map(function(code) { return { code: code, symbol: symbols[code] };
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

App.TAX_POLICIES = [];

policies.forEach(function(item) {
  var setRates = function(i) {
    if (item.rate) {
      item.rates = ['simple', {max: Infinity, rate: item.rate}];
    }
  }

  setRates(item);

  if (item.states) {
    item.states.forEach(function(state) {
      setRates(state);
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
  currencyCode: Ember.computed.alias('calculator.currencyCode'),
  currency: Ember.computed.alias('calculator.currency'),

  flagURL: function() {
    return 'flags/' + this.get('policy.country').replace(/ /g, '-') + '.png';
  }.property('policy.country'),

  amount: function() {
    return this.get('policy').calculateFor(this.get('annualIncome'), this.get('currencyCode'));
  }.property('policy', 'annualIncome', 'currencyCode'),

  takeHome: function() {
    return this.get('annualIncome') - this.get('amount');
  }.property('annualIncome', 'amount'),

  percentage: function() {
    return this.get('amount') / this.get('annualIncome');
  }.property('amount', 'annualIncome')
});

App.TaxCalculatior = Ember.Object.extend({
  annualIncome: null,
  currencyCode: 'USD',
  currency: function() {
    return symbols[this.get('currencyCode')];
  }.property('currencyCode'),

  results: function() {
    var self = this;
    return App.TAX_POLICIES.map(function(policy) {
      return App.Entry.create({ policy: policy, calculator: self });
    });
  }.property()
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return App.TaxCalculatior.create();
  }
});

// Custom debounce implementation
var debounce = function(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var call = function() {
      Ember.run(function() { func.apply(context, args); });
    };
    var later = function() {
      timeout = null;
      call();
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) call();
  };
};

App.IndexController = Ember.ObjectController.extend({
  income: null,

  incomeChanged: function() {
    if (!this.process) {
      this.process = debounce(this.processIncomeChange, 500, true);
    }
    this.process();
  }.observes('income'),

  processIncomeChange: function() {
    var income = this.get('income');
    this.set('annualIncome', accounting.unformat(income));
  },

  actions: {
    setIncome: function(value) {
      this.set('currencyCode', 'USD');
      this.set('income', value);
    }
  }
});

App.ResultsController = Ember.ArrayController.extend({
  sortProperties: ['amount'],
  needs: ['index'],
  currencyCode: Ember.computed.alias('controllers.index.currencyCode'),
  currency: Ember.computed.alias('controllers.index.currency')
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
