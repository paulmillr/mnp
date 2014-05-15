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
  prosperityIndexRank: null,
  ratesSource: null,
  rates: null,
  states: null,

  hasStates: Ember.computed.notEmpty('states'),

  isCountry: true,
  isState: false,

  flagURL: function() {
    return 'flags/' + this.get('name').replace(/ /g, '-') + '.png';
  }.property('name')
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

  calculateTotalWithStats: function(countryOrState, annualIncome, currentCurrency) {
    var tax = this.calculateTotalFor(countryOrState, annualIncome, currentCurrency);
    var effectiveRate = tax / annualIncome;
    var takeHome = annualIncome - tax;

    return { income: annualIncome, taxAmount: tax, effectiveRate: effectiveRate, takeHome: takeHome, currency: currentCurrency };
  },

  calculateFor: function(country, annualIncome, currentCurrency) {
    return getRate(annualIncome, currentCurrency, country.get('code'), country.get('rates'));
  }
}).create();

App.COUNTRIES = [];

var normalizeRates = function(item) {
  if (item.rate) {
    return ['simple', {max: Infinity, rate: item.rate}];
  } else {
    return item.rates;
  }
};

policies.forEach(function(item) {
  item.rates = normalizeRates(item);

  var country = App.Country.create(item);

  var states = [];

  if (item.states) {
    states = item.states.map(function(state) {
      state.country = country;
      state.rates = normalizeRates(state);

      return App.CountryState.create(state);
    });
  }

  country.set('states', states);

  App.COUNTRIES.push(country);
});

App.CalculationEntry = Ember.Object.extend({
  country: null,
  state: null,

  income: null,
  currencyCode: null,

  countryOrState: function() {
    if (this.get('state')) {
      return this.get('state');
    } else {
      return this.get('country');
    }
  }.property('country', 'state'),

  result: function() {
    var country = this.get('countryOrState');
    var income = this.get('income');
    var currency = this.get('currencyCode');

    return App.TaxCalculator.calculateTotalWithStats(country, income, currency);
  }.property('countryOrState', 'income', 'currencyCode'),

  taxAmount: Ember.computed.alias('result.taxAmount'),
  effectiveRate: Ember.computed.alias('result.effectiveRate'),
  takeHome: Ember.computed.alias('result.takeHome')
});

App.Router.map(function() {
  this.resource('details', { path: '/c/:slug' });
});

App.ApplicationController = Ember.Controller.extend({
  currencyCode: 'USD'
});

App.NavbarController = Ember.Controller.extend({
  needs: ['application'],
  currencyCode: Ember.computed.alias('controllers.application.currencyCode')
});

App.IndexController = Ember.Controller.extend({
  needs: ['application'],
  queryParams: ['income', 'currencyCode'],

  currencyCode: Ember.computed.alias('controllers.application.currencyCode'),
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

      return App.CalculationEntry.create({
        country: country,
        state: state,
        source: self,
        incomeBinding: 'source.income',
        currencyCodeBinding: 'source.currencyCode'
      });
    });
  }.property(),

  actions: {
    setIncome: function(value) {
      this.set('currencyCode', 'USD');
      this.set('income', value);
    }
  }
});

App.ResultsController = Ember.ArrayController.extend({
  sortProperties: ['taxAmount'],
  needs: ['index'],
  currencyCode: Ember.computed.alias('controllers.index.currencyCode'),
  currency: Ember.computed.alias('controllers.index.currency')
});

App.DetailsRoute = Ember.Route.extend({
  model: function(params) {
    return App.COUNTRIES.findBy('slug', params.slug);
  }
});

App.DetailsController = Ember.ObjectController.extend({
  needs: ['application'],

  demoIncome: null,

  currencyCode: Ember.computed.alias('controllers.application.currencyCode'),

  sampleIncomes: function() {
    var currency = this.get('currencyCode');
    var incomes = [25000, 50000, 75000, 100000, 250000, 500000, 1000000];

    return incomes.map(function(usd) {
      return toCurrency(usd, currency, 'USD');
    });
  }.property('currencyCode'),

  bands: function() {
    var rates = this.get('rates').slice();
    var currency = this.get('currencyCode');
    var sourceCurrency = this.get('model.code')

    rates.shift();

    return rates.map(function(rate) {
      var newMax = toCurrency(rate.max, currency, sourceCurrency);
      return { max: newMax, rate: rate.rate };
    });
  }.property('rates', 'currencyCode', 'code'),

  samples: function() {
    var country = this.get('model');
    var currency = this.get('currencyCode');

    return this.get('sampleIncomes').map(function(income) {
      return App.TaxCalculator.calculateTotalWithStats(country, income, currency);
    });
  }.property('model', 'sampleIncomes'),

  result: function() {
    var income = this.get('demoIncome');
    var country = this.get('model');
    var currency = this.get('currencyCode');

    return App.TaxCalculator.calculateTotalWithStats(country, income, currency);
  }.property('model', 'demoIncome')
});

App.MoneyInputComponent = Ember.Component.extend({
  currencyCode: null,
  value: null,
  placeholder: null,
  autofocus: false,

  setFmt: function() {
    this.updateMoney();
  }.on('init'),

  fmtValue: null,

  updateMoney: function() {
    this.set('fmtValue', accounting.formatNumber(this.get('value')));
  }.observes('value'),

  inputValueDidChange: function() {
    this.set('fmtValue', accounting.formatNumber(this.get('fmtValue')));

    Ember.run.debounce(this, this.updateValue, 500);
  }.observes('fmtValue'),

  updateValue: function() {
    this.set('value', accounting.unformat(this.get('fmtValue')));
  }
});

Ember.Handlebars.helper('money', function(value) {
  if (value === Infinity) return 'Infinity';
  return accounting.formatMoney(value, '');
});

Ember.Handlebars.helper('rawPercent', function(value) {
  return accounting.formatNumber(value, 2) + '%';
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
