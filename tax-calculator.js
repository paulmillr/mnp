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
    for (var i = 0, item, rate, fixed; i < list.length; i++) {
      item = list[i];
      rate = (item.rate / 100);
      fixed = item.fixed;
      var next = item.max - prevMax;
      if (current > next) {
        total += next * rate;
        if (fixed) total += fixed;
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
      if (convertedIncome < item.max) {
        return toCurrency(convertedIncome * (item.rate / 100), currentCurrency, currency);
      }
    }
    console.log(rates)
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
    var later = function() {
      timeout = null;
      Ember.run(function() { func.apply(context, args); });
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
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
