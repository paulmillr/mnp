(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
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

});

require.register("components", function(exports, require, module) {
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

});

require.register("config", function(exports, require, module) {
module.exports = {
  currencies: {
    url: 'http://openexchangerates.org/api/latest.json?app_id=8556217a83d84985930d67d6cf934289',
    symbols: {
      USD: 'US$',
      CAD: 'CA$',
      HKD: 'HK$',
      SGD: 'SG$',
      AUD: 'AU$',
      THB: '฿',
      JPY: '¥',
      GBP: '£',
      EUR: '€',
      CZK: 'Kč',
      UAH: '₴',
      BTC: 'BTC'
    },

    sorter: ['USD', 'EUR', 'GBP', 'RUB', 'UAH', 'BTC']
  },

  subjectiveWords: {
    crime: ['very high', 'high', 'moderate', 'low', 'very low'],
    prices: ['very expensive', 'expensive', 'moderate', 'cheap', 'very cheap'],
    business: ['very hard', 'hard', 'moderate', 'easy', 'very easy'],
    corruption: ['very bad', 'bad', 'moderate', 'good', 'very good'],
    total: ['very bad', 'bad', 'moderate', 'good', 'very good']
  }
};

});

require.register("controllers", function(exports, require, module) {
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

});

require.register("countries/australia", function(exports, require, module) {
module.exports = {
  "name": "Australia",
  "slug": "australia",
  "code": "AUD",
  "ratings": {
    "crime": 41.23,
    "prices": 108.51,
    "business": 11,
    "corruption": 81
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "ratesSource": "https://en.wikipedia.org/wiki/Income_tax_in_Australia#Individual_income_tax_rates_.28residents.29",
  "rates": [
    "incremental",
    {
      "max": 18200,
      "rate": 0
    },
    {
      "max": 37000,
      "rate": 19
    },
    {
      "max": 80000,
      "rate": 32.5
    },
    {
      "max": 180000,
      "rate": 37
    },
    {
      "max": null,
      "rate": 45
    }
  ]
};
});

require.register("countries/austria", function(exports, require, module) {
module.exports = {
  "name": "Austria",
  "slug": "austria",
  "code": "EUR",
  "ratings": {
    "crime": 25.83,
    "prices": 89.5,
    "business": 30,
    "corruption": 69
  },
  "immigration": {
    "work": false,
    "investment": {
      "minAmount": 3000000,
      "yearsBeforeCitizenship": "0",
      "source": "http://best-citizenships.com/austria-citizenship.htm"
    },
    "business": false
  },
  "ratesSource": "http://europa.eu/youreurope/citizens/work/retire/taxes/austria/index_en.htm",
  "rates": [
    "incremental",
    {
      "max": 10999,
      "rate": 0
    },
    {
      "max": 25000,
      "rate": 36.5
    },
    {
      "max": 60000,
      "rate": 43.2
    },
    {
      "max": null,
      "rate": 50
    }
  ]
};
});

require.register("countries/belarus", function(exports, require, module) {
module.exports = {
  "name": "Belarus",
  "slug": "belarus",
  "code": "BYR",
  "ratings": {
    "crime": 32.89,
    "prices": 50.35,
    "business": 63,
    "corruption": 29
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "rate": 12
};
});

require.register("countries/canada", function(exports, require, module) {
module.exports = {
  "name": "Canada",
  "slug": "canada",
  "code": "CAD",
  "ratings": {
    "crime": 36.29,
    "prices": 87.9,
    "business": 19,
    "corruption": 81
  },
  "immigration": {
    "work": {
      "degreeReq": false,
      "source": "http://www.workpermit.com/canada/individual/skilled.htm"
    },
    "investment": {
      "minAmount": 800000,
      "yearsBeforePR": 0,
      "source": "http://news.gc.ca/web/article-en.do?nid=814939"
    },
    "business": {
      "source": "http://www.cic.gc.ca/english/immigrate/business/start-up/eligibility.asp#language",
      "specialConditions": [
        "Startup visa.",
        "Must have min $11824 in bank for settlement",
        "You must secure a minimum investment of $200,000 if the investment comes from a designated Canadian venture capital fund.",
        "You must secure a minimum investment of $75,000 if the investment comes from a designated Canadian angel investor group.",
        "You may proceed with no investment if you're in business incubator.",
        "Alternative: visa for self-employed persons"
      ]
    }
  },
  "ratesSource": "http://www.cra-arc.gc.ca/tx/ndvdls/fq/txrts-eng.html",
  "rates": [
    "incremental",
    {
      "max": 43561,
      "rate": 15
    },
    {
      "max": 87123,
      "rate": 22
    },
    {
      "max": 135054,
      "rate": 26
    },
    {
      "max": null,
      "rate": 29
    }
  ],
  "states": [
    {
      "name": "Quebec",
      "slug": "qc",
      "rates": [
        "incremental",
        {
          "max": 41095,
          "rate": 16
        },
        {
          "max": 82190,
          "rate": 20
        },
        {
          "max": 100000,
          "rate": 24
        },
        {
          "max": null,
          "rate": 25.75
        }
      ]
    },
    {
      "name": "Ontario",
      "slug": "on",
      "rates": [
        "incremental",
        {
          "max": 39723,
          "rate": 5.05
        },
        {
          "max": 79448,
          "rate": 9.15
        },
        {
          "max": 509000,
          "rate": 11.16
        },
        {
          "max": null,
          "rate": 13.16
        }
      ]
    },
    {
      "name": "Manitoba",
      "slug": "mb",
      "rates": [
        "incremental",
        {
          "max": 31000,
          "rate": 10.8
        },
        {
          "max": 67000,
          "rate": 12.75
        },
        {
          "max": null,
          "rate": 17.4
        }
      ]
    },
    {
      "name": "Alberta",
      "slug": "ab",
      "rate": 10
    },
    {
      "name": "British Columbia",
      "slug": "bc",
      "rates": [
        "incremental",
        {
          "max": 37568,
          "rate": 5.06
        },
        {
          "max": 71138,
          "rate": 7.7
        },
        {
          "max": 82268,
          "rate": 10.5
        },
        {
          "max": 104754,
          "rate": 12.29
        },
        {
          "max": null,
          "rate": 14.7
        }
      ]
    }
  ]
};
});

require.register("countries/china", function(exports, require, module) {
module.exports = {
  "name": "China",
  "slug": "china",
  "code": "CNY",
  "ratings": {
    "crime": 30.13,
    "prices": 54.12,
    "business": 96,
    "corruption": 40
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "ratesSource": "https://en.wikipedia.org/wiki/Taxation_in_China#Individual_income_tax",
  "rates": [
    "incremental",
    {
      "max": 1500,
      "rate": 3
    },
    {
      "max": 4500,
      "rate": 10
    },
    {
      "max": 9000,
      "rate": 20
    },
    {
      "max": 35000,
      "rate": 25
    },
    {
      "max": 55000,
      "rate": 30
    },
    {
      "max": 80000,
      "rate": 35
    },
    {
      "max": null,
      "rate": 45
    }
  ]
};
});

require.register("countries/cyprus", function(exports, require, module) {
module.exports = {
  "name": "Cyprus",
  "slug": "cyprus",
  "code": "EUR",
  "ratings": {
    "crime": 37.56,
    "prices": 89.76,
    "business": 39,
    "corruption": 63
  },
  "immigration": {
    "work": false,
    "investment": {
      "minAmount": 3000000,
      "yearsBeforeCitizenship": "0",
      "source": "http://best-citizenships.com/cyprus-citizenship.htm"
    },
    "business": false
  },
  "rates": [
    "incremental",
    {
      "max": 19500,
      "rate": 0
    },
    {
      "max": 28000,
      "rate": 20
    },
    {
      "max": 36300,
      "rate": 25
    },
    {
      "max": 60000,
      "rate": 30
    },
    {
      "max": null,
      "rate": 35
    }
  ]
};
});

require.register("countries/czech-republic", function(exports, require, module) {
module.exports = {
  "name": "Czech Republic",
  "slug": "czech-republic",
  "code": "CZK",
  "ratings": {
    "crime": 33.88,
    "prices": 56.59,
    "business": 75,
    "corruption": 48
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": {
      "minCapital": 200000,
      "yearsBeforePR": 5,
      "yearsBeforeCitizenship": 5,
      "stayReq": 90,
      "source": "http://business-investor-immigration.com/czech-business-immigration-program/"
    }
  },
  "rate": 15
};
});

require.register("countries/france", function(exports, require, module) {
module.exports = {
  "name": "France",
  "slug": "france",
  "code": "EUR",
  "ratings": {
    "crime": 47.28,
    "prices": 100.21,
    "business": 38,
    "corruption": 71
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "ratesSource": "https://en.wikipedia.org/wiki/Taxation_in_France#Income_Taxes",
  "rates": [
    "incremental",
    {
      "max": 6011,
      "rate": 0
    },
    {
      "max": 11991,
      "rate": 5.5
    },
    {
      "max": 26631,
      "rate": 14
    },
    {
      "max": 71397,
      "rate": 30
    },
    {
      "max": 151200,
      "rate": 41
    },
    {
      "max": null,
      "rate": 45
    }
  ]
};
});

require.register("countries/georgia", function(exports, require, module) {
module.exports = {
  "name": "Georgia",
  "slug": "georgia",
  "code": "GEL",
  "ratings": {
    "crime": 19.91,
    "prices": 46.22,
    "business": 8,
    "corruption": 49
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "rate": 20
};
});

require.register("countries/germany", function(exports, require, module) {
module.exports = {
  "name": "Germany",
  "slug": "germany",
  "code": "EUR",
  "ratings": {
    "crime": 27.14,
    "prices": 87.14,
    "business": 21,
    "corruption": 78
  },
  "immigration": {
    "work": {
      "degreeReq": false,
      "canApplyForPR": true,
      "yearsBeforePR": 5,
      "source": "http://www.internations.org/germany-expats/guide/15983-visa-administration/how-to-get-a-german-residence-permit-15953"
    },
    "investment": {
      "minAmount": 250000,
      "minJobs": 5,
      "source": "http://en.wikipedia.org/wiki/Immigration_to_Germany"
    },
    "business": false
  },
  "ratesSource": "http://www.parmentier.de/steuer/steuer.htm?wagetax.htm",
  "rates": [
    "incremental",
    {
      "max": 8130,
      "rate": 0
    },
    {
      "max": 52881,
      "rate": 14
    },
    {
      "max": 250731,
      "rate": 42
    },
    {
      "max": null,
      "rate": 45
    }
  ]
};
});

require.register("countries/hong-kong", function(exports, require, module) {
module.exports = {
  "name": "Hong Kong",
  "slug": "hong-kong",
  "code": "HKD",
  "ratings": {
    "crime": 22.68,
    "prices": 76.36,
    "business": 2,
    "corruption": 75
  },
  "climate": {
    "high": 31.4,
    "low": 14.5,
    "rainyDays": 137
  },
  "immigration": {
    "work": {
      "degreeReq": true,
      "canApplyForPR": true,
      "source": "http://www.clic.org.hk/en/topics/immigration/hk_permanent_residence/"
    },
    "investment": {
      "minAmount": 10000000,
      "yearsBeforePR": 7,
      "source": "http://www.second-citizenship.org/permanent-residence/immigration-through-investment-to-hong-kong/"
    },
    "business": false
  },
  "rates": [
    "simple",
    {
      "max": 40000,
      "rate": 2
    },
    {
      "max": 80000,
      "rate": 7
    },
    {
      "max": 120000,
      "rate": 12
    },
    {
      "max": null,
      "rate": 17
    }
  ]
};
});

require.register("countries/iceland", function(exports, require, module) {
module.exports = {
  "name": "Iceland",
  "slug": "iceland",
  "code": "ISK",
  "ratings": {
    "crime": 31.68,
    "prices": 111.75,
    "business": 13,
    "corruption": 78
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "rates": [
    "incremental",
    {
      "max": 2512800,
      "rate": 37.31
    },
    {
      "max": 8166600,
      "rate": 40.21
    },
    {
      "max": null,
      "rate": 46.21
    }
  ]
};
});

require.register("countries/ireland", function(exports, require, module) {
module.exports = {
  "name": "Ireland",
  "slug": "ireland",
  "code": "EUR",
  "ratings": {
    "crime": 53.59,
    "prices": 106.61,
    "business": 15,
    "corruption": 72
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "ratesSource": "https://en.wikipedia.org/wiki/Taxation_in_the_Republic_of_Ireland#Rates_of_income_tax",
  "rates": [
    "incremental",
    {
      "max": 32800,
      "rate": 20
    },
    {
      "max": null,
      "rate": 41
    }
  ]
};
});

require.register("countries/israel", function(exports, require, module) {
module.exports = {
  "name": "Israel",
  "slug": "israel",
  "code": "ILS",
  "ratings": {
    "crime": 33.28,
    "prices": 91.45,
    "business": 35,
    "corruption": 61
  },
  "climate": {
    "high": 30,
    "low": 9,
    "rainyDays": 45
  },
  "immigration": {
    "work": {
      "canApplyForPR": true,
      "source": "http://www.justlanded.com/english/Israel/Israel-Guide/Visas-Permits/Visas"
    },
    "investment": {
      "specialConditions": [
        "Only for U.S. investors"
      ]
    },
    "business": false
  },
  "ratesSource": "https://en.wikipedia.org/wiki/Taxation_in_Israel#Personal_Income_tax",
  "rates": [
    "incremental",
    {
      "max": 62400,
      "rate": 10
    },
    {
      "max": 106560,
      "rate": 14
    },
    {
      "max": 173160,
      "rate": 21
    },
    {
      "max": 261360,
      "rate": 30
    },
    {
      "max": 501960,
      "rate": 33
    },
    {
      "max": null,
      "rate": 48
    }
  ]
};
});

require.register("countries/italy", function(exports, require, module) {
module.exports = {
  "name": "Italy",
  "slug": "italy",
  "code": "EUR",
  "ratings": {
    "crime": 45.59,
    "prices": 96.81,
    "business": 65,
    "corruption": 43
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "ratesSource": "https://en.wikipedia.org/wiki/Taxation_in_Italy",
  "rates": [
    "incremental",
    {
      "max": 15000,
      "rate": 23
    },
    {
      "max": 28000,
      "rate": 27
    },
    {
      "max": 55000,
      "rate": 38
    },
    {
      "max": 75000,
      "rate": 41
    },
    {
      "max": null,
      "rate": 43
    }
  ]
};
});

require.register("countries/japan", function(exports, require, module) {
module.exports = {
  "name": "Japan",
  "slug": "japan",
  "code": "JPY",
  "ratings": {
    "crime": 18.1,
    "prices": 94.13,
    "business": 27,
    "corruption": 74
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "rates": [
    "incremental",
    {
      "max": 1950000,
      "rate": 5
    },
    {
      "max": 3300000,
      "rate": 10
    },
    {
      "max": 6950000,
      "rate": 20
    },
    {
      "max": 9000000,
      "rate": 23
    },
    {
      "max": 18000000,
      "rate": 33
    },
    {
      "max": null,
      "rate": 40
    }
  ]
};
});

require.register("countries/latvia", function(exports, require, module) {
module.exports = {
  "name": "Latvia",
  "slug": "latvia",
  "code": "EUR",
  "ratings": {
    "crime": 43.74,
    "prices": 65.95,
    "business": 24,
    "corruption": 53
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "rate": 24
};
});

require.register("countries/malaysia", function(exports, require, module) {
module.exports = {
  "name": "Malaysia",
  "slug": "malaysia",
  "code": "MYR",
  "ratings": {
    "crime": 66.41,
    "prices": 48.66,
    "business": 6,
    "corruption": 50
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "ratesSource": "http://savemoney.my/malaysia-personal-income-tax-guide-2013-rates-exemptions-rebates-reliefs-and-more/",
  "rates": [
    "incremental",
    {
      "max": 2500,
      "rate": 0
    },
    {
      "max": 5000,
      "rate": 1
    },
    {
      "max": 10000,
      "rate": 3
    },
    {
      "max": 20000,
      "rate": 3
    },
    {
      "max": 35000,
      "rate": 7
    },
    {
      "max": 50000,
      "rate": 12
    },
    {
      "max": 70000,
      "rate": 19
    },
    {
      "max": 100000,
      "rate": 24
    },
    {
      "max": null,
      "rate": 26
    }
  ]
};
});

require.register("countries/netherlands", function(exports, require, module) {
module.exports = {
  "name": "Netherlands",
  "slug": "netherlands",
  "code": "EUR",
  "ratings": {
    "crime": 37.07,
    "prices": 98.82,
    "business": 28,
    "corruption": 83
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "ratesSource": "http://en.wikipedia.org/wiki/Income_tax_in_the_Netherlands#Progressive_tax_on_wages_etc._.28box_1.29",
  "rates": [
    "incremental",
    {
      "max": 19645,
      "rate": 5.85
    },
    {
      "max": 33363,
      "rate": 10.85
    },
    {
      "max": 55991,
      "rate": 42
    },
    {
      "max": null,
      "rate": 52
    }
  ]
};
});

require.register("countries/poland", function(exports, require, module) {
module.exports = {
  "name": "Poland",
  "slug": "poland",
  "code": "PLN",
  "ratings": {
    "crime": 37.53,
    "prices": 53.68,
    "business": 45,
    "corruption": 60
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "ratesSource": "http://europa.eu/youreurope/citizens/work/abroad/taxes/poland/employed_en.htm",
  "rates": [
    "incremental",
    {
      "max": 3091,
      "rate": 0
    },
    {
      "max": 85528,
      "rate": 18
    },
    {
      "max": null,
      "rate": 32
    }
  ]
};
});

require.register("countries/russia", function(exports, require, module) {
module.exports = {
  "name": "Russia",
  "slug": "russia",
  "code": "RUB",
  "ratings": {
    "crime": 52.67,
    "prices": 61.8,
    "business": 92,
    "corruption": 28
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "rate": 13
};
});

require.register("countries/singapore", function(exports, require, module) {
module.exports = {
  "name": "Singapore",
  "slug": "singapore",
  "code": "SGD",
  "ratings": {
    "crime": 21.35,
    "prices": 100.01,
    "business": 1,
    "corruption": 86
  },
  "immigration": {
    "work": {
      "degreeReq": false,
      "canApplyForPR": true
    },
    "investment": {
      "minAmount": 2500000,
      "yearsBeforePR": 0,
      "yearsBeforeCitizenship": 2
    },
    "business": {
      "minCapital": 50000,
      "minShare": 30,
      "specialConditions": [
        "The company is receiving monetary funding or investment of at least S$100,000 from a third-party Venture Capitalist (VC) or angel investor accredited by a Singapore Government agency.",
        "The company holds an Intellectual Property (IP) that is registered with a recognised national IP institution.",
        "The company has on-going research collaboration with an institution recognised by Agency for Science, Technology and Research (A*STAR) or Institutes of Higher Learning in Singapore.",
        "The company is an incubatee at a Singapore Government-supported incubator."
      ],
      "source": "http://www.guidemesingapore.com/relocation/work-pass/singapore-entrepreneur-pass-guide"
    }
  },
  "climate": {
    "high": 31,
    "low": 24.1,
    "rainyDays": 178
  },
  "rates": [
    "incremental",
    {
      "max": 20000,
      "rate": 0
    },
    {
      "max": 30000,
      "rate": 2
    },
    {
      "max": 40000,
      "rate": 3.5
    },
    {
      "max": 80000,
      "rate": 7
    },
    {
      "max": 120000,
      "rate": 11.5
    },
    {
      "max": 160000,
      "rate": 15
    },
    {
      "max": 200000,
      "rate": 17
    },
    {
      "max": 320000,
      "rate": 18
    },
    {
      "max": null,
      "rate": 20
    }
  ]
};
});

require.register("countries/south-korea", function(exports, require, module) {
module.exports = {
  "name": "South Korea",
  "slug": "south-korea",
  "code": "KRW",
  "ratings": {
    "crime": 16.35,
    "prices": 87.56,
    "business": 7,
    "corruption": 55
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "ratesSource": "http://www.korea4expats.com/article-income-taxes.html",
  "rates": [
    "incremental",
    {
      "max": 12000000,
      "rate": 6
    },
    {
      "max": 46000000,
      "rate": 16
    },
    {
      "max": 88000000,
      "rate": 25
    },
    {
      "max": null,
      "rate": 35
    }
  ]
};
});

require.register("countries/spain", function(exports, require, module) {
module.exports = {
  "name": "Spain",
  "slug": "spain",
  "code": "EUR",
  "ratings": {
    "crime": 32.42,
    "prices": 77.81,
    "business": 52,
    "corruption": 59
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "ratesSource": "https://en.wikipedia.org/wiki/Income_tax_in_Spain",
  "rates": [
    "incremental",
    {
      "max": 17707.2,
      "rate": 24
    },
    {
      "max": 33007.2,
      "rate": 28
    },
    {
      "max": 53407.2,
      "rate": 37
    },
    {
      "max": 120000.2,
      "rate": 43
    },
    {
      "max": 175000.2,
      "rate": 44
    },
    {
      "max": null,
      "rate": 45
    }
  ]
};
});

require.register("countries/sweden", function(exports, require, module) {
module.exports = {
  "name": "Sweden",
  "slug": "sweden",
  "code": "SEK",
  "ratings": {
    "crime": 38.23,
    "prices": 103.68,
    "business": 14,
    "corruption": 89
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "rates": [
    "incremental",
    {
      "max": 413200,
      "rate": 30
    },
    {
      "max": 591600,
      "rate": 50
    },
    {
      "max": null,
      "rate": 55
    }
  ]
};
});

require.register("countries/thailand", function(exports, require, module) {
module.exports = {
  "name": "Thailand",
  "slug": "thailand",
  "code": "THB",
  "ratings": {
    "crime": 37.56,
    "prices": 45.95,
    "business": 19,
    "corruption": 35
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "ratesSource": "http://www.rd.go.th/publish/6045.0.html",
  "rates": [
    "incremental",
    {
      "max": 150000,
      "rate": 0
    },
    {
      "max": 500000,
      "rate": 10
    },
    {
      "max": 1000000,
      "rate": 20
    },
    {
      "max": 4000000,
      "rate": 30
    },
    {
      "max": null,
      "rate": 37
    }
  ]
};
});

require.register("countries/uae", function(exports, require, module) {
module.exports = {
  "name": "United Arab Emirates",
  "slug": "uae",
  "code": "AED",
  "ratings": {
    "crime": 20.79,
    "prices": 68.25,
    "business": 23,
    "corruption": 69
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "rate": 0
};
});

require.register("countries/uk", function(exports, require, module) {
module.exports = {
  "name": "United Kingdom",
  "slug": "uk",
  "code": "GBP",
  "ratings": {
    "crime": 42.62,
    "prices": 100.11,
    "business": 10,
    "corruption": 76
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "ratesSource": "https://en.wikipedia.org/wiki/Taxation_in_the_United_Kingdom#Income_tax",
  "rates": [
    "incremental",
    {
      "max": 32011,
      "rate": 20
    },
    {
      "max": 150000,
      "rate": 40
    },
    {
      "max": null,
      "rate": 45
    }
  ]
};
});

require.register("countries/ukraine", function(exports, require, module) {
module.exports = {
  "name": "Ukraine",
  "slug": "ukraine",
  "code": "UAH",
  "ratings": {
    "crime": 49.37,
    "prices": 45.64,
    "business": 112,
    "corruption": 25
  },
  "immigration": {
    "work": false,
    "investment": false,
    "business": false
  },
  "rates": [
    "simple",
    {
      "max": 12180,
      "rate": 15
    },
    {
      "max": null,
      "rate": 17
    }
  ]
};
});

require.register("countries/usa", function(exports, require, module) {
module.exports = {
  "name": "United States",
  "slug": "usa",
  "code": "USD",
  "ratings": {
    "crime": 50.15,
    "prices": 77.39,
    "business": 4,
    "corruption": 73
  },
  "immigration": {
    "work": {
      "degreeReq": true,
      "canApplyForPR": true,
      "quota": 65000,
      "source": "http://www.uscis.gov/working-united-states/temporary-workers/h-1b-specialty-occupations-and-fashion-models/h-1b-specialty-occupations-dod-cooperative-research-and-development-project-workers-and-fashion-models"
    },
    "investment": {
      "minAmount": 1000000,
      "minJobs": 10,
      "yearsBeforePR": 2,
      "source": "http://www.uscis.gov/working-united-states/permanent-workers/employment-based-immigration-fifth-preference-eb-5/eb-5-immigrant-investor-process"
    },
    "business": false
  },
  "ratesSource": "http://www.worldwide-tax.com/us/us_taxes.asp",
  "rates": [
    "incremental",
    {
      "max": 8925,
      "rate": 0
    },
    {
      "max": 36250,
      "rate": 15
    },
    {
      "max": 87850,
      "rate": 25
    },
    {
      "max": 183250,
      "rate": 28
    },
    {
      "max": 398350,
      "rate": 33
    },
    {
      "max": 400000,
      "rate": 35
    },
    {
      "max": null,
      "rate": 39.6
    }
  ],
  "states": [
    {
      "name": "Alaska / Florida / Nevada / Texas",
      "slug": "ak-fl-nv-tx",
      "rate": 0
    },
    {
      "name": "California",
      "slug": "ca",
      "rates": [
        "incremental",
        {
          "max": 7455,
          "rate": 0
        },
        {
          "max": 17676,
          "rate": 2
        },
        {
          "max": 27897,
          "rate": 4
        },
        {
          "max": 38726,
          "rate": 6
        },
        {
          "max": 48942,
          "rate": 8
        },
        {
          "max": 250000,
          "rate": 9.3
        },
        {
          "max": 300000,
          "rate": 10.3
        },
        {
          "max": 500000,
          "rate": 11.3
        },
        {
          "max": null,
          "rate": 12.3
        }
      ]
    },
    {
      "name": "Delaware",
      "slug": "de",
      "rates": [
        "incremental",
        {
          "max": 2000,
          "rate": 0
        },
        {
          "max": 5000,
          "rate": 2.2
        },
        {
          "max": 10000,
          "rate": 3.9
        },
        {
          "max": 20000,
          "rate": 4.8
        },
        {
          "max": 25000,
          "rate": 5.2
        },
        {
          "max": 60000,
          "rate": 5.55
        },
        {
          "max": null,
          "rate": 6.75
        }
      ]
    },
    {
      "name": "Kentucky",
      "slug": "ky",
      "rates": [
        "incremental",
        {
          "max": 3000,
          "rate": 2
        },
        {
          "max": 4000,
          "rate": 3
        },
        {
          "max": 5000,
          "rate": 4
        },
        {
          "max": 8000,
          "rate": 5
        },
        {
          "max": 75000,
          "rate": 5.8
        },
        {
          "max": null,
          "rate": 6
        }
      ]
    },
    {
      "name": "New York",
      "slug": "ny",
      "rates": [
        "incremental",
        {
          "max": 8000,
          "rate": 4
        },
        {
          "max": 11000,
          "rate": 4.5
        },
        {
          "max": 13000,
          "rate": 5.25
        },
        {
          "max": 20000,
          "rate": 5.9
        },
        {
          "max": 75000,
          "rate": 6.45
        },
        {
          "max": 200000,
          "rate": 6.65
        },
        {
          "max": 1000000,
          "rate": 6.85
        },
        {
          "max": null,
          "rate": 8.72
        }
      ]
    }
  ]
};
});

require.register("helpers", function(exports, require, module) {
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

});

require.register("init", function(exports, require, module) {
var App = require('application');
var url = require('config').currencies.url;

$.getJSON(url, function(data) {
  if (!fx) throw new Error('Provide money.js library');
  fx.rates = data.rates;
  fx.base = data.base;

  App.advanceReadiness();
});

});

require.register("models", function(exports, require, module) {
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

});

require.register("routes", function(exports, require, module) {
App.Router.map(function() {
  this.resource('tax-rating', { path: '/taxes' });
  this.resource('ratings');
  this.resource('details', { path: '/c/:country_slug' });
  this.resource('details_state', { path: '/c/:country_slug/:state_slug' });
});

App.RatingsRoute  = Ember.Route.extend({
  model: function() {
    return App.COUNTRIES;
  }
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

});

require.register("utils", function(exports, require, module) {
var config = require('config');

exports.toCurrency = function(value, toCode, fromCode) {
  if (!value) return 0;
  return fx(value).from(fromCode).to(toCode);
};
var fromCurrency = function(value, fromCode, toCode) {
  if (!value) return 0;
  return fx(value).from(fromCode).to(toCode);
};

var subjectiveScore = function(rating, value) {
  if (rating === 'crime') {
    return value > 75 ? 0 :
      value > 50 ? 1 :
      value > 35 ? 2 :
      value > 25 ? 3 :
      4;
  } else if (rating === 'prices') {
    return value > 110 ? 0 :
      value > 85 ? 1 :
      value > 65 ? 2 :
      value > 50 ? 3 :
      4;
  } else if (rating === 'business') {
    return value > 120 ? 0 :
      value > 80 ? 1 :
      value > 60 ? 2 :
      value > 25 ? 3 :
      4;
  } else if (rating === 'corruption') {
    return value > 75 ? 4 :
      value > 60 ? 3 :
      value > 45 ? 2 :
      value > 30 ? 1 :
      0;
  } else if (rating === 'total') {
    var total = 0;
    for (var item in value) {
      total += subjectiveScore(item, value[item])
    }
    console.log(total);
    return total >= 20 ? 4 :
      total >= 15 ? 3 :
      total >= 10 ? 2 :
      total >= 5 ? 1 :
      0;
  } else {
    throw new Error('Unknown rating: ' + rating);
  }
};

exports.subjectiveWord = function(rating, value) {
  if (rating === 'crime' || rating === 'prices' || rating === 'business' || rating === 'corruption' || rating === 'total') {
    var score = subjectiveScore(rating, value);
    return config.subjectiveWords[rating][score];
  } else if (rating === 'climate') {
    return value > 20 ? 'very hot' :
      value > 0 ? 'moderate' :
      'cold';
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

var getSameCurrencyRate = function(convertedIncome, rates) {
  rates = rates.slice();
  var type = rates.shift(); // 'simple' or 'incremental'

  if (type == 'incremental') {
    // income 45000, brackets 20k: 0%, +10k: 2%, +10k: 3.5%
    // (45000 > 20000) = total -= 20000; 45000 - 20000 / 0
    // (15000 > 10000) = total -= 10000; 25000 - 10000 / 2
    // (5000  < 10000) = total = 0; 5000 / 3.5

    var hasInfinity = rates.any(function(item) { return item.max == Infinity; });

    if (!hasInfinity) {
      throw new Error('Country must have max income bracket');
    }

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

exports.getRate = function(income, currentCurrency, baseCurrency, rates)  {
  if (!rates) return 0;
  var convertedIncome = fromCurrency(income, currentCurrency, baseCurrency);
  var amount = getSameCurrencyRate(convertedIncome, rates);
  return exports.toCurrency(amount, currentCurrency, baseCurrency);
};

var normal = function(entity) {
  if (entity.rates) entity.rates.forEach(function(rate) {
    if (rate.max == null) rate.max = Infinity;
  });
};

exports.normalizeRates = function(item) {
  if (item.rates) {
    normal(item);
    (item.states || []).map(normal);
    return item.rates;
  } else {
    return ['simple', {max: Infinity, rate: item.rate}];
  }
};

// window.debounce = function(func, wait, immediate) {
//   var timeout;
//   return function() {
//     var context = this, args = arguments;
//     var call = function() {
//       Ember.run(function() { func.apply(context, args); });
//     };
//     var later = function() {
//       timeout = null;
//       call();
//     };
//     var callNow = immediate && !timeout;
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//     if (callNow) call();
//   };
// };

});


//# sourceMappingURL=app.js.map