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
    ratings: {
      crime: 50.15,
      prices: 77.39,
      business: 4,
      corruption: 73
    },
    immigration: {
      work: {
        degreeReq: true,
        canApplyForPR: true,
        quota: 65000,
        source: 'http://www.uscis.gov/working-united-states/temporary-workers/h-1b-specialty-occupations-and-fashion-models/h-1b-specialty-occupations-dod-cooperative-research-and-development-project-workers-and-fashion-models'
      },
      investment: {
        minAmount: 1000000,
        minJobs: 10,
        yearsBeforePR: 2,
        source: 'http://www.uscis.gov/working-united-states/permanent-workers/employment-based-immigration-fifth-preference-eb-5/eb-5-immigrant-investor-process'
      },
      business: false // TODO
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
    ratings: {
      crime: 36.29,
      prices: 87.90,
      business: 19,
      corruption: 81
    },
    immigration: {
      work: {
        degreeReq: false,
        source: 'http://www.workpermit.com/canada/individual/skilled.htm'
      },
      investment: {
        minAmount: 800000,
        yearsBeforePR: 0,
        source: 'http://news.gc.ca/web/article-en.do?nid=814939'
      },
      business: {
        source: 'http://www.cic.gc.ca/english/immigrate/business/start-up/eligibility.asp#language',
        specialConditions: [
          'Must have min $11824 in bank for settlement',
          'You must secure a minimum investment of $200,000 if the investment comes from a designated Canadian venture capital fund.',
          'You must secure a minimum investment of $75,000 if the investment comes from a designated Canadian angel investor group.',
          'Alternative: visa for self-employed persons'
        ]
      }
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
    ratings: {
      crime: 22.68,
      prices: 76.36,
      business: 2,
      corruption: 75
    },
    immigration: {
      work: {
        degreeReq: true,
        canApplyForPR: true,
        source: 'http://www.clic.org.hk/en/topics/immigration/hk_permanent_residence/'
      },
      investment: {
        minAmount: 10000000,
        yearsBeforePR: 7,
        source: 'http://www.second-citizenship.org/permanent-residence/immigration-through-investment-to-hong-kong/'
      },
      business: false // TODO
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
    ratings: {
      crime: 21.35,
      prices: 100.01,
      business: 1,
      corruption: 86
    },
    immigration: {
      work: {
        degreeReq: false,
        canApplyForPR: true
      },
      investment: {
        minAmount: 2500000,
        yearsBeforePR: 0,
        yearsBeforeCitizenship: 2
      },
      business: {
        minCapital: 50000,
        minShare: 30,
        specialConditions: [
          'The company is receiving monetary funding or investment of at least S$100,000 from a third-party Venture Capitalist (VC) or angel investor accredited by a Singapore Government agency.',
          'The company holds an Intellectual Property (IP) that is registered with a recognised national IP institution.',
          'The company has on-going research collaboration with an institution recognised by Agency for Science, Technology and Research (A*STAR) or Institutes of Higher Learning in Singapore.',
          'The company is an incubatee at a Singapore Government-supported incubator.'
        ],
        source: 'http://www.guidemesingapore.com/relocation/work-pass/singapore-entrepreneur-pass-guide'
      }
    },
    climate: {
      high: 31.0,
      low: 24.1,
      rainyDays: 178
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
    ratings: {
      crime: 30.13,
      prices: 54.12,
      business: 96,
      corruption: 40
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 37.56,
      prices: 45.95,
      business: 19,
      corruption: 35
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 66.41,
      prices: 48.66,
      business: 6,
      corruption: 50
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 16.35,
      prices: 87.56,
      business: 7,
      corruption: 55
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 18.10,
      prices: 94.13,
      business: 27,
      corruption: 74
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 41.23,
      prices: 108.51,
      business: 11,
      corruption: 81
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 42.62,
      prices: 100.11,
      business: 10,
      corruption: 76
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 53.59,
      prices: 106.61,
      business: 15,
      corruption: 72
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 32.42,
      prices: 77.81,
      business: 52,
      corruption: 59
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 45.59,
      prices: 96.81,
      business: 65,
      corruption: 43
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 37.07,
      prices: 98.82,
      business: 28,
      corruption: 83
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 37.56,
      prices: 89.76,
      business: 39,
      corruption: 63
    },
    immigration: {
      work: false, // TODO
      investment: {
        minAmount: 3000000,
        yearsBeforeCitizenship: '0',
        source: 'http://best-citizenships.com/cyprus-citizenship.htm'
      },
      business: false // TODO
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
    ratings: {
      crime: 38.23,
      prices: 103.68,
      business: 14,
      corruption: 89
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 31.68,
      prices: 111.75,
      business: 13,
      corruption: 78
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 33.88,
      prices: 56.59,
      business: 75,
      corruption: 48
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: {
        minCapital: 200000,
        yearsBeforePR: 5,
        yearsBeforeCitizenship: 5,
        stayReq: 90,
        source: 'http://business-investor-immigration.com/czech-business-immigration-program/'
      }
    },
    rate: 15
  },

  {
    name: 'Georgia',
    slug: 'georgia',
    code: 'GEL',
    ratings: {
      crime: 19.91,
      prices: 46.22,
      business: 8,
      corruption: 49
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
    },
    rate: 20
  },

  {
    name: 'Latvia',
    slug: 'latvia',
    code: 'EUR',
    ratings: {
      crime: 43.74,
      prices: 65.95,
      business: 24,
      corruption: 53
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
    },
    rate: 24
  },

  {
    name: 'Austria',
    slug: 'austria',
    code: 'EUR',
    ratings: {
      crime: 25.83,
      prices: 89.50,
      business: 30,
      corruption: 69
    },
    immigration: {
      work: false, // TODO
      investment: {
        minAmount: 3000000,
        yearsBeforeCitizenship: '0',
        source: 'http://best-citizenships.com/austria-citizenship.htm'
      },
      business: false // TODO
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
    ratings: {
      crime: 47.28,
      prices: 100.21,
      business: 38,
      corruption: 71
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 37.53,
      prices: 53.68,
      business: 45,
      corruption: 60
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
    },
    ratesSource: 'http://europa.eu/youreurope/citizens/work/abroad/taxes/poland/employed_en.htm',
    rates: ['incremental',
      {max: 3091, rate: 0},
      {max: 85528, rate: 18},
      {max: Infinity, rate: 32}
    ]
  },

  // FIXME taxes might be incorrect
  // Tax % Tax Base (EUR)
  // 0 Up to 8,130
  // 14% 8,131-52,881
  // 42% 52,882-250,730
  // 45% 250,731 and over
  {
    name: 'Germany',
    slug: 'germany',
    code: 'EUR',
    ratings: {
      crime: 27.14,
      prices: 87.14,
      business: 21,
      corruption: 78
    },
    immigration: {
      work: {
        degreeReq: false,
        canApplyForPR: true,
        yearsBeforePR: 5,
        source: 'http://www.internations.org/germany-expats/guide/15983-visa-administration/how-to-get-a-german-residence-permit-15953'
      },
      investment: {
        minAmount: 250000,
        minJobs: 5,
        source: 'http://en.wikipedia.org/wiki/Immigration_to_Germany'
      },
      business: false
    },
    ratesSource: 'http://www.parmentier.de/steuer/steuer.htm?wagetax.htm',
    rates: ['incremental',
      {max: 8130, rate: 0},
      {max: 52881, rate: 14},
      {max: 250731, rate: 42},
      {max: Infinity, rate: 45}
    ]
  },

  {
    name: 'Israel',
    slug: 'israel',
    code: 'ILS',
    ratings: {
      crime: 33.28,
      prices: 91.45,
      business: 35,
      corruption: 61
    },
    immigration: {
      work: {
        canApplyForPR: true,
        source: 'http://www.justlanded.com/english/Israel/Israel-Guide/Visas-Permits/Visas'
      },
      investment: {
        specialConditions: [
          'Only for U.S. investors'
        ]
      },
      business: false
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
    ratings: {
      crime: 20.79,
      prices: 68.25,
      business: 23,
      corruption: 69
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
    },
    rate: 0
  },

  {
    name: 'Russia',
    slug: 'russia',
    code: 'RUB',
    ratings: {
      crime: 52.67,
      prices: 61.80,
      business: 92,
      corruption: 28
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
    },
    rate: 13
  },

  {
    name: 'Ukraine',
    slug: 'ukraine',
    code: 'UAH',
    ratings: {
      crime: 49.37,
      prices: 45.64,
      business: 112,
      corruption: 25
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
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
    ratings: {
      crime: 32.89,
      prices: 50.35,
      business: 63,
      corruption: 29
    },
    immigration: {
      work: false, // TODO
      investment: false, // TODO
      business: false // TODO
    },
    rate: 12
  }
];
