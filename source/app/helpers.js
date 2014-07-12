var utils = require('utils');

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

Ember.Handlebars.helper('money', function(value) {
  if (value === Infinity) return 'Infinity';
  return accounting.formatMoney(value, '');
});

Ember.Handlebars.helper('multi-money', function(value, from, to) {
  var converted = utils.toCurrency(value, to, from);
  var money = function(v, c) { return accounting.formatMoney(v, c + '&nbsp;'); };

  return new Ember.Handlebars.SafeString(money(value, from) + ' (' + money(converted, to) + ')');
});

Ember.Handlebars.helper('subj-climate', App.SubjectiveClimateComponent);
Ember.Handlebars.helper('subj-rating', App.SubjectiveRatingComponent);
Ember.Handlebars.helper('total-rating', App.TotalRatingComponent);
