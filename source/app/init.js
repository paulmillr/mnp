var App = require('application');
var url = require('config').currencies.url;

$.getJSON(url, function(data) {
  if (!fx) throw new Error('Provide money.js library');
  fx.rates = data.rates;
  fx.base = data.base;

  App.advanceReadiness();
});
