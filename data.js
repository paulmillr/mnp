var symbols = {
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
  UAH: '₴'
};

var policies = [
  // Almost right. Needs some fix
  // http://www.worldwide-tax.com/us/us_taxes.asp
  // Income taxes by name: http://www.bankrate.com/finance/taxes/check-taxes-in-your-state.aspx
  // :/
  // Over  But not over  Tax +%  On amount over
  // $0  $8,925  $0.00 10  $ 0
  // 8,925 36,250  892 15  8,925
  // 36,250  87,850  4,991 25  36,250
  // 87,850  183,250 17,891  28  87,850
  // 183,250 398,350 44,603  33  183,250
  // 398,350 400,000 115,586 35  398,350
  // 400,000 ----- ----- 39.6  -----
  {
    name: 'United States',
    slug: 'usa',
    code: 'USD',
    prosperityIndexRank: 11,
    crimeIndex: 50.15,
    consumerPriceIndex: 77.39,
    immigration: {
      workVisa: {
        degreeReq: true,
        canApplyForPR: true,
        quota: 65000,
        source: 'http://www.uscis.gov/working-united-states/temporary-workers/h-1b-specialty-occupations-and-fashion-models/h-1b-specialty-occupations-dod-cooperative-research-and-development-project-workers-and-fashion-models'
      },
      investmentVisa: {
        minAmount: 1000000,
        minJobs: 10,
        yearsBeforePR: 2,
        source: 'http://www.uscis.gov/working-united-states/permanent-workers/employment-based-immigration-fifth-preference-eb-5/eb-5-immigrant-investor-process'
      },
      businessVisa: false // TODO
    },
    ratesSource: 'http://www.worldwide-tax.com/us/us_taxes.asp',
    rates: ['incremental',
      {max: 8925, rate: 0},
      {max: 36250, rate: 15},
      {max: 87850, rate: 25},
      {max: 183250, rate: 28},
      {max: 398350, rate: 33},
      {max: 400000, rate: 35},
      {max: Infinity, rate: 39.6}
    ],
    states: [
      { name: 'Alaska / Florida / Nevada / Texas', slug: 'ak-fl-nv-tx', rate: 0 },
      { name: 'California', slug: 'ca', rates: ['incremental',
          {max: 7455, rate: 0},
          {max: 17676, rate: 2},
          {max: 27897, rate: 4},
          {max: 38726, rate: 6},
          {max: 48942, rate: 8},
          {max: 250000, rate: 9.3},
          {max: 300000, rate: 10.3},
          {max: 500000, rate: 11.3},
          {max: Infinity, rate: 12.3},
        ]
      },
      { name: 'Delaware', slug: 'de', rates: ['incremental',
          {max: 2000, rate: 0},
          {max: 5000, rate: 2.2},
          {max: 10000, rate: 3.9},
          {max: 20000, rate: 4.8},
          {max: 25000, rate: 5.2},
          {max: 60000, rate: 5.55},
          {max: Infinity, rate: 6.75}
        ]
      },
      { name: 'Kentucky', slug: 'ky', rates: ['incremental',
          {max: 3000, rate: 2},
          {max: 4000, rate: 3},
          {max: 5000, rate: 4},
          {max: 8000, rate: 5},
          {max: 75000, rate: 5.8},
          {max: Infinity, rate: 6}
        ]
      },
      { name: 'New York', slug: 'ny', rates: ['incremental',
          {max: 8000, rate: 4},
          {max: 11000, rate: 4.5},
          {max: 13000, rate: 5.25},
          {max: 20000, rate: 5.9},
          {max: 75000, rate: 6.45},
          {max: 200000, rate: 6.65},
          {max: 1000000, rate: 6.85},
          {max: Infinity, rate: 8.72}
        ]
      }
    ]
  },

  {
    name: 'Canada',
    slug: 'canada',
    code: 'CAD',
    prosperityIndexRank: 3,
    crimeIndex: 36.29,
    consumerPriceIndex: 87.90,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'http://www.cra-arc.gc.ca/tx/ndvdls/fq/txrts-eng.html',
    rates: ['incremental',
      {max: 43561, rate: 15},
      {max: 87123, rate: 22},
      {max: 135054, rate: 26},
      {max: Infinity, rate: 29}
    ],
    states:[
      // http://www.revenuquebec.ca/en/citoyen/impots/rens_comp/taux.aspx
      { name: 'Quebec', slug: 'qc', rates: ['incremental',
          {max: 41095, rate: 16},
          {max: 82190, rate: 20},
          {max: 100000, rate: 24},
          {max: Infinity, rate: 25.75}
        ]
      },
      { name: 'Ontario', slug: 'on', rates: ['incremental',
          {max: 39723, rate: 5.05},
          {max: 79448, rate: 9.15},
          {max: 509000, rate: 11.16},
          {max: Infinity, rate: 13.16}
        ]
      },
      { name: 'Manitoba', slug: 'mb', rates: ['incremental',
          {max: 31000, rate: 10.8},
          {max: 67000, rate: 12.75},
          {max: Infinity, rate: 17.4}
        ]
      },
      { name: 'Alberta', slug: 'ab', rate: 10},
      { name: 'British Columbia', slug: 'bc', rates: ['incremental',
          {max: 37568, rate: 5.06},
          {max: 71138, rate: 7.7},
          {max: 82268, rate: 10.5},
          {max: 104754, rate: 12.29},
          {max: Infinity, rate: 14.7}
        ]
      }
    ]
  },

  {
    name: 'Hong Kong',
    slug: 'hong-kong',
    code: 'HKD',
    prosperityIndexRank: 19,
    crimeIndex: 22.68,
    consumerPriceIndex: 76.36,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    rates: ['simple',
      {max: 40000, rate: 2},
      {max: 80000, rate: 7},
      {max: 120000, rate: 12},
      {max: Infinity, rate: 17}
    ]
  },

  {
    name: 'Singapore',
    slug: 'singapore',
    code: 'SGD',
    prosperityIndexRank: 18,
    crimeIndex: 21.35,
    consumerPriceIndex: 100.01,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    rates: ['incremental',
      {max: 20000, rate: 0},
      {max: 30000, rate: 2},
      {max: 40000, rate: 3.5},
      {max: 80000, rate: 7},
      {max: 120000, rate: 11.5},
      {max: 160000, rate: 15},
      {max: 200000, rate: 17},
      {max: 320000, rate: 18},
      {max: Infinity, rate: 20}
    ]
  },

  {
    name: 'China',
    slug: 'china',
    code: 'CNY',
    prosperityIndexRank: 51,
    crimeIndex: 30.13,
    consumerPriceIndex: 54.12,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'https://en.wikipedia.org/wiki/Taxation_in_China#Individual_income_tax',
    rates: ['incremental',
      {max: 1500, rate: 3},
      {max: 4500, rate: 10},
      {max: 9000, rate: 20},
      {max: 35000, rate: 25},
      {max: 55000, rate: 30},
      {max: 80000, rate: 35},
      {max: Infinity, rate: 45}
    ]
  },

  {
    name: 'Thailand',
    slug: 'thailand',
    code: 'THB',
    prosperityIndexRank: 52,
    crimeIndex: 37.56,
    consumerPriceIndex: 45.95,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'http://www.rd.go.th/publish/6045.0.html',
    rates: ['incremental',
      {max: 150000, rate: 0},
      {max: 500000, rate: 10},
      {max: 1000000, rate: 20},
      {max: 4000000, rate: 30},
      {max: Infinity, rate: 37}
    ]
  },

  {
    name: 'Malaysia',
    slug: 'malaysia',
    code: 'MYR',
    prosperityIndexRank: 44,
    crimeIndex: 66.41,
    consumerPriceIndex: 48.66,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'http://savemoney.my/malaysia-personal-income-tax-guide-2013-rates-exemptions-rebates-reliefs-and-more/',
    rates: ['incremental',
      {max: 2500, rate: 0},
      {max: 5000, rate: 1},
      {max: 10000, rate: 3},
      {max: 20000, rate: 3},
      {max: 35000, rate: 7},
      {max: 50000, rate: 12},
      {max: 70000, rate: 19},
      {max: 100000, rate: 24},
      {max: Infinity, rate: 26}
    ]
  },

  {
    name: 'South Korea',
    slug: 'south-korea',
    code: 'KRW',
    prosperityIndexRank: 26,
    crimeIndex: 16.35,
    consumerPriceIndex: 87.56,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'http://www.korea4expats.com/article-income-taxes.html',
    rates: ['incremental',
      {max: 12000000, rate: 6},
      {max: 46000000, rate: 16},
      {max: 88000000, rate: 25},
      {max: Infinity, rate: 35}
    ]
  },

  {
    name: 'Japan',
    slug: 'japan',
    code: 'JPY',
    prosperityIndexRank: 21,
    crimeIndex: 18.10,
    consumerPriceIndex: 94.13,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    rates: ['incremental',
      {max: 1950000, rate: 5},
      {max: 3300000, rate: 10},
      {max: 6950000, rate: 20},
      {max: 9000000, rate: 23},
      {max: 18000000, rate: 33},
      {max: Infinity, rate: 40}
    ]
  },

  {
    name: 'Australia',
    slug: 'australia',
    code: 'AUD',
    prosperityIndexRank: 7,
    crimeIndex: 41.23,
    consumerPriceIndex: 108.51,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'https://en.wikipedia.org/wiki/Income_tax_in_Australia#Individual_income_tax_rates_.28residents.29',
    rates: ['incremental',
      {max: 18200, rate: 0},
      {max: 37000, rate: 19},
      {max: 80000, rate: 32.5},
      {max: 180000, rate: 37},
      {max: Infinity, rate: 45}
    ]
  },

  {
    name: 'United Kingdom',
    slug: 'uk',
    code: 'GBP',
    prosperityIndexRank: 16,
    crimeIndex: 42.62,
    consumerPriceIndex: 100.11,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'https://en.wikipedia.org/wiki/Taxation_in_the_United_Kingdom#Income_tax',
    rates: ['incremental',
      {max: 32011, rate: 20},
      {max: 150000, rate: 40},
      {max: Infinity, rate: 45}
    ]
  },

  {
    name: 'Ireland',
    slug: 'ireland',
    code: 'EUR',
    prosperityIndexRank: 12,
    crimeIndex: 53.59,
    consumerPriceIndex: 106.61,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'https://en.wikipedia.org/wiki/Taxation_in_the_Republic_of_Ireland#Rates_of_income_tax',
    rates: ['incremental',
      {max: 32800, rate: 20},
      {max: Infinity, rate: 41}
    ]
  },

  {
    name: 'Spain',
    slug: 'spain',
    code: 'EUR',
    prosperityIndexRank: 23,
    crimeIndex: 32.42,
    consumerPriceIndex: 77.81,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'https://en.wikipedia.org/wiki/Income_tax_in_Spain',
    rates: ['incremental',
      {max: 17707.2, rate: 24},
      {max: 33007.2, rate: 28},
      {max: 53407.2, rate: 37},
      {max: 120000.2, rate: 43},
      {max: 175000.2, rate: 44},
      {max: Infinity, rate: 45}
    ]
  },

  {
    name: 'Italy',
    slug: 'italy',
    code: 'EUR',
    prosperityIndexRank: 32,
    crimeIndex: 45.59,
    consumerPriceIndex: 96.81,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'https://en.wikipedia.org/wiki/Taxation_in_Italy',
    rates: ['incremental',
      {max: 15000, rate: 23},
      {max: 28000, rate: 27},
      {max: 55000, rate: 38},
      {max: 75000, rate: 41},
      {max: Infinity, rate: 43}
    ]
  },

  {
    name: 'Netherlands',
    slug: 'netherlands',
    code: 'EUR',
    prosperityIndexRank: 9,
    crimeIndex: 37.07,
    consumerPriceIndex: 98.82,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'http://en.wikipedia.org/wiki/Income_tax_in_the_Netherlands#Progressive_tax_on_wages_etc._.28box_1.29',
    rates: ['incremental',
      {max: 19645, rate: 5.85},
      {max: 33363, rate: 10.85},
      {max: 55991, rate: 42},
      {max: Infinity, rate: 52}
    ]
  },

  {
    name: 'Cyprus',
    slug: 'cyprus',
    code: 'EUR',
    prosperityIndexRank: 37,
    crimeIndex: 37.56,
    consumerPriceIndex: 89.76,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    rates: ['incremental',
      {max: 19500, rate: 0},
      {max: 28000, rate: 20},
      {max: 36300, rate: 25},
      {max: 60000, rate: 30},
      {max: Infinity, rate: 35}
    ]
  },

  {
    name: 'Sweden',
    slug: 'sweden',
    code: 'SEK',
    prosperityIndexRank: 4,
    crimeIndex: 38.23,
    consumerPriceIndex: 103.68,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    rates: ['incremental',
      {max: 413200, rate: 30},
      {max: 591600, rate: 50},
      {max: Infinity, rate: 55}
    ]
  },

  {
    name: 'Iceland',
    slug: 'iceland',
    code: 'ISK',
    prosperityIndexRank: 13,
    crimeIndex: 31.68,
    consumerPriceIndex: 111.75,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    rates: ['incremental',
      {max: 2512800, rate: 37.31},
      {max: 8166600, rate: 40.21},
      {max: Infinity, rate: 46.21}
    ]
  },

  {
    name: 'Czech Republic',
    slug: 'czech-republic',
    code: 'CZK',
    prosperityIndexRank: 29,
    crimeIndex: 33.88,
    consumerPriceIndex: 56.59,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    rate: 15
  },

  {
    name: 'Georgia',
    slug: 'georgia',
    code: 'GEL',
    prosperityIndexRank: 84,
    crimeIndex: 19.91,
    consumerPriceIndex: 46.22,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    rate: 20
  },

  {
    name: 'Latvia',
    slug: 'latvia',
    code: 'EUR',
    prosperityIndexRank: 48,
    crimeIndex: 43.74,
    consumerPriceIndex: 65.95,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    rate: 24
  },

  {
    name: 'Austria',
    slug: 'austria',
    code: 'EUR',
    prosperityIndexRank: 7,
    crimeIndex: 25.83,
    consumerPriceIndex: 89.50,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'http://europa.eu/youreurope/citizens/work/retire/taxes/austria/index_en.htm',
    rates: ['incremental',
      {max: 10999, rate: 0},
      {max: 25000, rate: 36.5},
      {max: 60000, rate: 43.2},
      {max: Infinity, rate: 50}
    ]
  },

  {
    name: 'France',
    slug: 'france',
    code: 'EUR',
    prosperityIndexRank: 20,
    crimeIndex: 47.28,
    consumerPriceIndex: 100.21,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'https://en.wikipedia.org/wiki/Taxation_in_France#Income_Taxes',
    rates: ['incremental',
      {max: 6011, rate: 0},
      {max: 11991, rate: 5.5},
      {max: 26631, rate: 14},
      {max: 71397, rate: 30},
      {max: 151200, rate: 41},
      {max: Infinity, rate: 45}
    ]
  },

  {
    name: 'Poland',
    slug: 'poland',
    code: 'PLN',
    prosperityIndexRank: 34,
    crimeIndex: 37.53,
    consumerPriceIndex: 53.68,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'http://europa.eu/youreurope/citizens/work/abroad/taxes/poland/employed_en.htm',
    rates: ['incremental',
      {max: 3091, rate: 0},
      {max: 85528, rate: 18},
      {max: Infinity, rate: 32}
    ]
  },

  // Germany does not work.
  // http://www.parmentier.de/steuer/steuer.htm?wagetax.htm
  // Tax % Tax Base (EUR)
  // 0 Up to 8,130
  // 14% 8,131-52,881
  // 42% 52,882-250,730
  // 45% 250,731 and over
  // {name: 'Germany', code: 'EUR', rates: ['simple',
  //   {max: 8130, rate: 0},
  //   {max: 52881, rate: 14},
  //   {max: 250731, rate: 42},
  //   {max: Infinity, rate: 45}
  // ]}

  {
    name: 'Israel',
    slug: 'israel',
    code: 'ILS',
    prosperityIndexRank: 39,
    crimeIndex: 33.28,
    consumerPriceIndex: 91.45,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    ratesSource: 'https://en.wikipedia.org/wiki/Taxation_in_Israel#Personal_Income_tax',
    rates: ['incremental',
      {max: 62400, rate: 10},
      {max: 106560, rate: 14},
      {max: 173160, rate: 21},
      {max: 261360, rate: 30},
      {max: 501960, rate: 33},
      {max: Infinity, rate: 48}
    ]
  },

  // FTW!
  {
    name: 'United Arab Emirates',
    slug: 'uae',
    code: 'AED',
    prosperityIndexRank: 28,
    crimeIndex: 20.79,
    consumerPriceIndex: 68.25,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    rate: 0
  },

  {
    name: 'Russia',
    slug: 'russia',
    code: 'RUB',
    prosperityIndexRank: 61,
    crimeIndex: 52.67,
    consumerPriceIndex: 61.80,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    rate: 13
  },

  {
    name: 'Ukraine',
    slug: 'ukraine',
    code: 'UAH',
    prosperityIndexRank: 64,
    crimeIndex: 49.37,
    consumerPriceIndex: 45.64,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    rates: ['simple',
      {max: 12180, rate: 15},
      {max: Infinity, rate: 17}
    ]
  },

  {
    name: 'Belarus',
    slug: 'belarus',
    code: 'BYR',
    prosperityIndexRank: 58,
    crimeIndex: 32.89,
    consumerPriceIndex: 50.35,
    immigration: {
      workVisa: false, // TODO
      investmentVisa: false, // TODO
      businessVisa: false // TODO
    },
    rate: 12
  }
];
