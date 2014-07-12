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
