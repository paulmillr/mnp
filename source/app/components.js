var symbols = require('config').currencies.symbols;
var utils = require('utils');

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
    return utils.subjectiveWord('climate', this.get('avg'));
  }.property('avg')
});

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
      var newMax = utils.toCurrency(rate.max, currency, sourceCurrency);
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
      return utils.toCurrency(usd, currency, 'USD');
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
    return utils.subjectiveWord(this.get('name'), this.get('rating'));
  }.property('name', 'rating')
});

App.TotalRatingComponent = App.SubjectiveBaseComponent.extend({
  layout: Ember.Handlebars.compile('{{description}}'),

  ratings: null, // rating value

  description: function() {
    return utils.subjectiveWord('total', this.get('ratings'));
  }.property('name', 'rating')
});
