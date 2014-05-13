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

var symbols = {};
policies.forEach(function(item) {
  symbols[item.code] = item.symbol || item.code;
});

Ember.TextField.reopen({
  attributeBindings: ['autofocus', 'autocomplete']
});

App = Ember.Application.create();
App.deferReadiness();

App.CURRENCIES = policies.map(function(item) { return item.code }).
  uniq().map(function(code) { return { code: code, symbol: symbols[code] };
});

App.Country = Ember.Object.extend({
  name: null,
  slug: null,
  code: null,
  rates: null,
  states: null,

  hasStates: Ember.computed.notEmpty('states'),

  isCountry: true,
  isState: false
});

App.CountryState = Ember.Object.extend({
  country: null,
  name: null,
  slug: null,
  code: Ember.computed.alias('country.code'),
  rates: null,

  isCountry: false,
  isState: true
});

App.TaxCalculator = Ember.Object.extend({
  calculateTotalFor: function(countryOrState, annualIncome, currentCurrency) {
    var isState = countryOrState.get('isState');
    var country = isState ? countryOrState.get('country') : countryOrState;
    var state = isState ? countryOrState : null;

    var total1 = this.calculateFor(country, annualIncome, currentCurrency);
    var total2 = isState ? this.calculateFor(state, annualIncome, currentCurrency) : 0;

    return total1 + total2;
  },

  calculateFor: function(country, annualIncome, currentCurrency) {
    return getRate(annualIncome, currentCurrency, country.get('code'), country.get('rates'));
  }
});

Ember.Application.initializer({
  name: 'injectCalculator',

  initialize: function(container, application) {
    container.register('calculator:main', App.TaxCalculator);
    container.injection('controller', 'calculator', 'calculator:main');
  }
});

App.COUNTRIES = [];

var normalizeRates = function(item) {
  if (item.rate) {
    return ['simple', {max: Infinity, rate: item.rate}];
  } else {
    return item.rates;
  }
};

policies.forEach(function(item) {
  var country = App.Country.create({
    name: item.country,
    slug: item.slug,
    code: item.code,
    rates: normalizeRates(item)
  });

  var states = [];

  if (item.states) {
    states = item.states.map(function(state) {
      return App.CountryState.create({
        country: country,
        name: state.state,
        slug: state.slug,
        rates: normalizeRates(state)
      });
    });
  }

  country.set('states', states);

  App.COUNTRIES.push(country);
});

App.CalculationResult = Ember.Object.extend({
  country: null,
  state: null,

  countryOrState: function() {
    if (this.get('state')) {
      return this.get('state');
    } else {
      return this.get('country');
    }
  }.property('country', 'state'),

  countryName: Ember.computed.alias('country.name'),
  stateName: Ember.computed.alias('state.name'),

  name: function() {
    var country = this.get('countryName'),
        state = this.get('stateName');

    if (state) {
      return country + ' — ' + state;
    } else {
      return country;
    }
  }.property('countryName', 'stateName'),

  calculator: null,
  annualIncome: Ember.computed.alias('calculator.annualIncome'),
  currencyCode: Ember.computed.alias('calculator.currencyCode'),
  currency: Ember.computed.alias('calculator.currency'),

  flagURL: function() {
    return 'flags/' + this.get('country.name').replace(/ /g, '-') + '.png';
  }.property('country'),

  amount: function() {
    return this.get('calculator.calculator').calculateTotalFor(this.get('countryOrState'), this.get('annualIncome'), this.get('currencyCode'));
  }.property('calculator', 'countryOrState', 'annualIncome', 'currencyCode'),

  takeHome: function() {
    return this.get('annualIncome') - this.get('amount');
  }.property('annualIncome', 'amount'),

  percentage: function() {
    return this.get('amount') / this.get('annualIncome');
  }.property('amount', 'annualIncome')
});


App.IndexController = Ember.Controller.extend({
  annualIncome: null,
  currencyCode: 'USD',
  income: null,
  currency: function() {
    return symbols[this.get('currencyCode')];
  }.property('currencyCode'),

  results: function() {
    var self = this;

    return App.COUNTRIES.reduce(function(memo, item) {
      if (item.get('hasStates')) {
        return memo.concat(item.get('states'));
      } else {
        return memo.concat([item]);
      }
    }, []).map(function(countryOrState) {
      var country, state;

      if (countryOrState.get('isCountry')) {
        country = countryOrState;
      } else {
        country = countryOrState.get('country');
        state = countryOrState;
      }

      return App.CalculationResult.create({
        country: country,
        state: state,
        calculator: self
      });
    });
  }.property(),

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
