var symbols = require('config').currencies.symbols;

App.ApplicationController = Ember.Controller.extend({
  currencyCode: 'USD'
});

App.NavbarController = Ember.Controller.extend({
  needs: ['application'],
  currencyCode: Ember.computed.alias('controllers.application.currencyCode')
});

App.RatingsController = Ember.ArrayController.extend({
});

App.FilterSet = Ember.Object.extend({
  noEducationWorkVisa: false,

  allFiltersChanged: function() {
    this.notifyPropertyChange('allFilters');
  }.observes('noEducationWorkVisa'),

  doesMatch: function(country) {
    var noEdu = this.get('noEducationWorkVisa');
    var clearFilters = !noEdu;

    if (clearFilters) {
      return true;
    } else {
      var work = country.get('immigration.work');

      return work.degreeReq === false;
    }
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
    if (this.get('state')) {
      return this.get('state');
    } else {
      return this.get('country');
    }
  }.property('country', 'state')
});
