var symbols = require('config').currencies.symbols;
var utils = require('utils');

App.ApplicationController = Ember.Controller.extend({
  currencyCode: 'USD'
});

App.NavbarController = Ember.Controller.extend({
  needs: ['application'],
  currencyCode: Ember.computed.alias('controllers.application.currencyCode')
});

App.RatingsController = Ember.ArrayController.extend({
});

var filterNames = [
  'noEducationWorkVisa', 'warmClimate', 'ruleOfLaw',
  'lowCrime',
  'lowTaxes', 'noWorkVisaQuotas', 'simpleStartupVisa'
];
App.FilterSet = Ember.Object.extend({
  noEducationWorkVisa: false,
  warmClimate: false,
  ruleOfLaw: false,
  lowTaxes: false,
  noWorkVisaQuotas: false,
  simpleStartupVisa: false,

  allFiltersChanged: function() {
    this.notifyPropertyChange('allFilters');
  }.observes('noEducationWorkVisa', 'warmClimate', 'ruleOfLaw', 'lowCrime', 'lowTaxes', 'noWorkVisaQuotas', 'simpleStartupVisa'),

  doesMatch: function(country) {
    var subj = function(type, keyName, desired) {
      var value = country.get(keyName);
      return utils.subjectiveWord(type, value) === desired;
    };
    var matches = function(name) {
      switch (name) {
        case 'noEducationWorkVisa':
          var work = country.get('immigration.work');
          return work.degreeReq === false;
        case 'warmClimate':
          return subj('climate', 'climate.low', 'very hot');
        case 'ruleOfLaw':
          return subj('corruption', 'ratings.corruption', 'very good');
        case 'lowCrime':
          return subj('crime', 'ratings.crime', 'very low');
        case 'lowTaxes':
          var sum = 100000;
          var rate = utils.getRate(sum, 'USD', 'USD', country.get('rates'));
          var percent = (rate / sum) * 100;
          return percent < 20;
        case 'noWorkVisaQuotas':
          var work = country.get('immigration.work');
          return work && !work.quota;
        case 'simpleStartupVisa':
          return ;
      }
    };
    var filters = filterNames.map(function(name) {
      var value = this.get(name);
      return {
        name: name, isEnabled: value,
        doesMatch: value ? matches(name) : false
      };
    }, this);

    var enabled = filters.filter(function(filter) {
      return filter.isEnabled;
    });

    console.log('Test', country.name, enabled);

    if (!enabled.length) return true;

    return enabled.every(function(filter) {
      return filter.doesMatch;
    });
  }
});

App.ChooseDestinyController = Ember.ArrayController.extend({
  filterSet: function() {
    return App.FilterSet.create();
  }.property(),

  results: function() {
    var countries = this.get('model');
    var filters = this.get('filterSet');

    return countries.filter(function(country) {
      return filters.doesMatch(country);
    });
  }.property('@each', 'filterSet.allFilters')
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


App.DetailsController = Ember.ObjectController.extend({
  needs: ['application'],
  currencyCode: Ember.computed.alias('controllers.application.currencyCode'),

  country: Ember.computed.alias('model'),
  state: null,

  countryOrState: function() {
    return this.get('state') || this.get('country');
  }.property('country', 'state')
});
