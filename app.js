var oexToken = '8556217a83d84985930d67d6cf934289';

var toCurrency = function(value, toCode, fromCode) {
  if (!value) return 0;
  return fx(value).from(fromCode).to(toCode);
};
var fromCurrency = function(value, fromCode, toCode) {
  if (!value) return 0;
  return fx(value).from(fromCode).to(toCode);
};

var subjectiveWord = function(rating, value) {
  if (rating === 'crime') {
    return value > 75 ? 'very high' :
      value > 50 ? 'high' :
      value > 35 ? 'moderate' :
      value > 25 ? 'low' :
      'very low';
  } else if (rating === 'prices') {
    return value > 110 ? 'very expensive' :
      value > 85 ? 'expensive' :
      value > 65 ? 'moderate' :
      value > 50 ? 'cheap' :
      'very cheap';
  } else if (rating === 'business') {
    return value > 120 ? 'very hard' :
      value > 80 ? 'hard' :
      value > 60 ? 'moderate' :
      value > 25 ? 'easy' :
      'very easy';
  } else if (rating === 'corruption') {
    return value > 75 ? 'very good' :
      value > 60 ? 'good' :
      value > 45 ? 'moderate' :
      value > 30 ? 'bad' :
      'very bad';
  } else if (rating === 'climate') {
    return value > 20 ? 'very hot' :
      value > 0 ? 'moderate' :
      'cold';
  } else if (rating === 'total') {
    console.log(value);
    return 'very good';
  } else {
    throw new Error('Unknown rating: ' + rating);
  }
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

App = Ember.Application.create({
  rootElement: '#app',

  ready: function() {
    if (fx.rates.BTC) {
      App.CURRENCIES.push({code: 'BTC', symbol: 'BTC'});
      symbols.BTC = 'BTC';
    }

    App.CURRENCIES = App.CURRENCIES.sort(function(a, b) {
      var ia = currSortOrder.indexOf(a.code)
      var ib = currSortOrder.indexOf(b.code);
      if (ia === -1) ia = 1000;
      if (ib === -1) ib = 1000;
      return ia - ib;
    });
    $('.loader').hide();
  }
});

App.deferReadiness();

var currSortOrder = ['USD', 'EUR', 'GBP', 'RUB', 'UAH', 'BTC'];

App.CURRENCIES = policies
  .map(function(item) { return item.code })
  .uniq()
  .map(function(code) { return {code: code, symbol: symbols[code] || (symbols[code] = code) } });


App.SubjectiveBaseComponent = Ember.Component.extend({
  tagName: 'b',
  classNameBindings: ['descriptionClass'],

  descriptionClass: function() {
    return this.get('description').replace(/\s+/g, '-');
  }.property('description')
});

App.SubjectiveClimateComponent = App.SubjectiveBaseComponent.extend({
  layout: Ember.Handlebars.compile('{{description}}'),

  climate: null,
  avg: function() {
    return (this.get('climate.high') + this.get('climate.low')) / 2;
  }.property('climate.{high,low}'),

  description: function() {
    return subjectiveWord('climate', this.get('avg'));
  }.property('avg')
});

Ember.Handlebars.helper('subj-climate', App.SubjectiveClimateComponent);

App.SubjectiveRatingComponent = App.SubjectiveBaseComponent.extend({
  layout: Ember.Handlebars.compile('{{#if rating}}{{description}} ({{numDesc}}){{else}}&emdash;{{/if}}'),

  name: null, // rating name
  rating: null, // rating value

  isBusiness: Ember.computed.equal('name', 'business'),
  isCorruption: Ember.computed.equal('name', 'corruption'),

  numDesc: function() {
    var num = this.get('rating');
    if (this.get('isBusiness')) {
      return '#' + num
    } else if (this.get('isCorruption')) {
      return num + ' / 100';
    } else {
      return num;
    }
  }.property('rating', 'isBusiness'),

  description: function() {
    return subjectiveWord(this.get('name'), this.get('rating'));
  }.property('name', 'rating')
});

App.TotalRatingComponent = App.SubjectiveBaseComponent.extend({
  layout: Ember.Handlebars.compile('{{description}}'),

  ratings: null, // rating value

  description: function() {
    return 'very good'
    return subjectiveWord('total', this.get('ratings'));
  }.property('name', 'rating')
});


Ember.Handlebars.helper('subj-rating', App.SubjectiveRatingComponent);
Ember.Handlebars.helper('total-rating', App.TotalRatingComponent);

App.CountryRatingComponent = Ember.Component.extend({
  name: null,
  rating: null,

  sources: {
    crime: 'http://www.numbeo.com/crime/rankings_by_country.jsp',
    prices: 'http://www.numbeo.com/cost-of-living/rankings_by_country.jsp',
    business: 'http://www.doingbusiness.org/rankings',
    corruption: 'http://cpi.transparency.org/cpi2013/results/'
  },

  labels: {
    crime: 'Crime index',
    prices: 'Consumer price index',
    business: 'Doing business',
    corruption: 'Corruption perception'
  },

  source: function() {
    var name = this.get('name');
    return this.get('sources')[name];
  }.property('name', 'sources'),

  label: function() {
    var name = this.get('name');
    return this.get('labels')[name];
  }.property('name', 'labels')
});

App.Taxable = Ember.Mixin.create({
  rates: null,

  taxBrackets: function() {
    var rates = this.get('rates').slice();
    rates.shift();
    return rates;
  }.property('rates'),

  isFlatTax: Ember.computed.equal('taxBrackets.length', 1),
  flatTaxRate: Ember.computed.alias('taxBrackets.firstObject.rate'),
});

App.Country = Ember.Object.extend(App.Taxable, {
  name: null,
  slug: null,
  code: null,
  prosperityIndexRank: null,
  ratesSource: null,
  states: null,

  hasStates: Ember.computed.notEmpty('states'),

  isCountry: true,
  isState: false,

  flagURL: function() {
    return 'flags/' + this.get('name').replace(/ /g, '-') + '.png';
  }.property('name')
});

App.CountryState = Ember.Object.extend(App.Taxable, {
  country: null,
  name: null,
  slug: null,
  code: Ember.computed.alias('country.code'),

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
  if (item.rate !== undefined) {
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
  this.resource('tax-rating', { path: '/taxes' });
  this.resource('ratings');
  this.resource('details', { path: '/c/:country_slug' });
  this.resource('details_state', { path: '/c/:country_slug/:state_slug' });
});

App.ApplicationController = Ember.Controller.extend({
  currencyCode: 'USD'
});

App.NavbarController = Ember.Controller.extend({
  needs: ['application'],
  currencyCode: Ember.computed.alias('controllers.application.currencyCode')
});

App.RatingsRoute  = Ember.Route.extend({
  model: function() {
    return App.COUNTRIES;
  }
});

App.RatingsController = Ember.ArrayController.extend({
});

App.TaxRatingController = Ember.Controller.extend({
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
  needs: ['tax_rating'],
  currencyCode: Ember.computed.alias('controllers.tax_rating.currencyCode'),
  currency: Ember.computed.alias('controllers.tax_rating.currency')
});

App.DetailsRoute = Ember.Route.extend({
  model: function(params) {
    return App.COUNTRIES.findBy('slug', params.country_slug);
  }
});

App.DetailsStateRoute = Ember.Route.extend({
  controllerName: 'details',

  model: function(params) {
    var country = App.COUNTRIES.findBy('slug', params.country_slug);
    var state = country.get('states').findBy('slug', params.state_slug);
    return [country, state];
  },

  setupController: function(controller, model) {
    controller.set('model', model[0]);
    controller.set('state', model[1]);
  },

  renderTemplate: function() {
    this.render('details');
  }
});

App.DetailsController = Ember.ObjectController.extend({
  needs: ['application'],
  currencyCode: Ember.computed.alias('controllers.application.currencyCode'),

  country: Ember.computed.alias('model'),
  state: null,

  countryOrState: function() {
    if (this.get('state')) {
      return this.get('state');
    } else {
      return this.get('country');
    }
  }.property('country', 'state')
});

App.TaxBandsComponent = Ember.Component.extend({
  countryOrState: null,
  currencyCode: null,

  currency: function() {
    return symbols[this.get('currencyCode')];
  }.property('currencyCode'),

  sourceCurrencyCode: Ember.computed.alias('countryOrState.code'),
  rates: Ember.computed.alias('countryOrState.rates'),
  isFlatTax: Ember.computed.alias('countryOrState.isFlatTax'),
  flatTaxRate: Ember.computed.alias('countryOrState.flatTaxRate'),

  bands: function() {
    var rates = this.get('rates').slice();
    var currency = this.get('currencyCode');
    var sourceCurrency = this.get('sourceCurrencyCode');

    rates.shift();

    return rates.map(function(rate) {
      var newMax = toCurrency(rate.max, currency, sourceCurrency);
      return { max: newMax, rate: rate.rate };
    });
  }.property('rates', 'currencyCode', 'sourceCurrencyCode')
});

App.SampleRatesComponent = Ember.Component.extend({
  countryOrState: null,
  currencyCode: null,

  demoIncome: null,

  currency: function() {
    return symbols[this.get('currencyCode')];
  }.property('currencyCode'),

  sampleIncomes: function() {
    var currency = this.get('currencyCode');
    var incomes = [25000, 50000, 75000, 100000, 250000, 500000, 1000000];

    return incomes.map(function(usd) {
      return toCurrency(usd, currency, 'USD');
    });
  }.property('currencyCode'),

  samples: function() {
    var country = this.get('countryOrState');
    var currency = this.get('currencyCode');

    return this.get('sampleIncomes').map(function(income) {
      return App.TaxCalculator.calculateTotalWithStats(country, income, currency);
    });
  }.property('countryOrState', 'sampleIncomes'),

  result: function() {
    var income = this.get('demoIncome');
    var country = this.get('countryOrState');
    var currency = this.get('currencyCode');

    return App.TaxCalculator.calculateTotalWithStats(country, income, currency);
  }.property('countryOrState', 'demoIncome')
});

App.MoneyInputComponent = Ember.Component.extend({
  currencyCode: null,
  value: null,
  placeholder: null,
  autofocus: false,

  debounce: null,

  setFmt: function() {
    this.updateMoney();
  }.on('init'),

  fmtValue: null,

  updateMoney: function() {
    this.set('fmtValue', accounting.formatNumber(this.get('value')));
  }.observes('value'),

  inputValueDidChange: function() {
    this.set('fmtValue', accounting.formatNumber(this.get('fmtValue')));

    var debounce = this.get('debounce');

    if (debounce) {
      Ember.run.debounce(this, this.updateValue, debounce);
    } else {
      this.updateValue();
    }
  }.observes('fmtValue'),

  updateValue: function() {
    this.set('value', accounting.unformat(this.get('fmtValue')));
  }
});

App.CheckMarkComponent = Ember.Component.extend({
  tagName: 'span',
  value: null
});

App.BsPanelComponent = Ember.Component.extend({
  classNames: ['panel panel-default']
});

App.VisaCardComponent = Ember.Component.extend({
  visa: null,
  title: null
});

Ember.Handlebars.helper('money', function(value) {
  if (value === Infinity) return 'Infinity';
  return accounting.formatMoney(value, '');
});

Ember.Handlebars.helper('multi-money', function(value, from, to) {
  var converted = toCurrency(value, to, from);
  var money = function(v, c) { return accounting.formatMoney(v, c + '&nbsp;'); };

  return new Ember.Handlebars.SafeString(money(value, from) + ' (' + money(converted, to) + ')');
});

Ember.Handlebars.helper('number', function(value) {
  return accounting.formatNumber(value);
});

Ember.Handlebars.helper('rawPercent', function(value) {
  return accounting.formatNumber(value, 2) + '%';
});

Ember.Handlebars.helper('percent', function(value) {
  return accounting.formatNumber(value * 100, 2) + '%';
});

Ember.Handlebars.helper('yesno', function(value) {
  return value ? 'yes' : 'no';
});

$.getJSON('http://openexchangerates.org/api/latest.json?app_id=' + oexToken, function(data) {
  if (!fx) throw new Error('Provide money.js library');
  fx.rates = data.rates;
  fx.base = data.base;
  App.advanceReadiness();
});
