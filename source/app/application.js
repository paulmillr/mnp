var config = require('config');
var normalizeRates = require('utils').normalizeRates;

var countriesData =
  window.require.list()
  .filter(function(moduleName) {
    return /^countries/.test(moduleName);
  })
  .map(require)
  .map(function(country) {
    if (country.rates) country.rates.forEach(function(rate) {
      if (rate.max == null) rate.max = Infinity;
    });
    return country;
  });

var currSortOrder = config.currencies.sorter;
var currSymbols = config.currencies.symbols;

var currencies = countriesData
  .map(function(country) { return country.code })
  .uniq()
  .map(function(code) {
    if (!currSymbols[code]) currSymbols[code] = code;
    return {code: code, symbol: currSymbols[code]};
  })
  .sort(function(a, b) {
    var ia = currSortOrder.indexOf(a.code)
    var ib = currSortOrder.indexOf(b.code);
    if (ia === -1) ia = 1000;
    if (ib === -1) ib = 1000;
    return ia - ib;
  });

var App = Ember.Application.create({
  rootElement: '#app',

  ready: function() {
    console.log('The app is started');
    $('.loader').hide();
  }
});
window.App = App;

App.deferReadiness();

['components', 'controllers', 'helpers', 'models', 'routes'].forEach(require);

var countries = countriesData.map(function(data) {
  data.rates = normalizeRates(data);
  var country = App.Country.create(data);

  // States of the country.
  var states = (country.states || []).map(function(state) {
    state.country = country;
    state.rates = normalizeRates(state);
    return App.CountryState.create(state);
  });
  country.set('states', states);

  return country;

  // item=data;
  // item.rates = normalizeRates(item);

  // var country = App.Country.create(item);

  // var states = [];

  // if (item.states) {
  //   states = item.states.map(function(state) {
  //     state.country = country;
  //     state.rates = normalizeRates(state);

  //     return App.CountryState.create(state);
  //   });
  // }

  // country.set('states', states);
  // return country;
});

App.CURRENCIES = currencies;
App.COUNTRIES = countries;

Ember.TextField.reopen({
  attributeBindings: ['autofocus', 'autocomplete']
});

module.exports = window.App = App;
