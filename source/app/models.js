var utils = require('utils');

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

  immigration: null,

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
    return utils.getRate(annualIncome, currentCurrency, country.get('code'), country.get('rates'));
  }
}).create();

App.CalculationEntry = Ember.Object.extend({
  country: null,
  state: null,

  income: null,
  currencyCode: null,

  countryOrState: function() {
    return this.get('state') || this.get('country');
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
