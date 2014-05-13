var policies = [
  // Almost right. Needs some fix
  // http://www.worldwide-tax.com/us/us_taxes.asp
  // Income taxes by state: http://www.bankrate.com/finance/taxes/check-taxes-in-your-state.aspx
  // :/
  // Over  But not over  Tax +%  On amount over
  // $0  $8,925  $0.00 10  $ 0
  // 8,925 36,250  892 15  8,925
  // 36,250  87,850  4,991 25  36,250
  // 87,850  183,250 17,891  28  87,850
  // 183,250 398,350 44,603  33  183,250
  // 398,350 400,000 115,586 35  398,350
  // 400,000 ----- ----- 39.6  -----
  {country: 'United States', slug: 'usa', code: 'USD', symbol: 'US$', rates: ['incremental',
    {max: 8925, rate: 0},
    {max: 36250, rate: 15},
    {max: 87850, rate: 25},
    {max: 183250, rate: 28},
    {max: 398350, rate: 33},
    {max: 400000, rate: 35},
    {max: Infinity, rate: 39.6}
  ], states: [
    // {state: 'Albama', rates: ['incremental',
    //   {max: 500, rate: 2},
    //   {max: 3000, rate: 3},
    //   {max: Infinity, rate: 5}
    // ]},
    // {state: 'Arizona', rates: ['incremental',
    //   {max: 10000, rate: 2.59},
    //   {max: 25000, rate: 2.88},
    //   {max: 50000, rate: 3.36},
    //   {max: 150000, rate: 3.24},
    //   {max: Infinity, rate: 4.54}
    // ]},
    // {state: 'Arkasas', rates: ['incremental',
    //   {max: 4099, rate: 1},
    //   {max: 8199, rate: 2.5},
    //   {max: 12199, rate: 3.5},
    //   {max: 20399, rate: 4.5},
    //   {max: 33999, rate: 6},
    //   {max: Infinity, rate: 7}
    // ]},
    {state: 'Alaska / Florida / Nevada / Texas', slug: 'ak-fl-nv-tx', rate: 0},
    {state: 'California', slug: 'ca', rates: ['incremental',
      {max: 7455, rate: 0},
      {max: 17676, rate: 2},
      {max: 27897, rate: 4},
      {max: 38726, rate: 6},
      {max: 48942, rate: 8},
      {max: 250000, rate: 9.3},
      {max: 300000, rate: 10.3},
      {max: 500000, rate: 11.3},
      {max: Infinity, rate: 12.3},
    ]},
    // {state: 'Colorado', rate: 4.63},
    // {state: 'Connecticut', rates: ['incremental',
    //   {max: 10000, rate: 3},
    //   {max: 50000, rate: 5},
    //   {max: 100000, rate: 5.5},
    //   {max: 200000, rate: 6},
    //   {max: 250000, rate: 6.5},
    //   {max: Infinity, rate: 6.7}
    // ]},
    {state: 'Delaware', slug: 'de', rates: ['incremental',
      {max: 2000, rate: 0},
      {max: 5000, rate: 2.2},
      {max: 10000, rate: 3.9},
      {max: 20000, rate: 4.8},
      {max: 25000, rate: 5.2},
      {max: 60000, rate: 5.55},
      {max: Infinity, rate: 6.75}
    ]},
    {state: 'Kentucky', slug: 'ky', rates: ['incremental',
      {max: 3000, rate: 2},
      {max: 4000, rate: 3},
      {max: 5000, rate: 4},
      {max: 8000, rate: 5},
      {max: 75000, rate: 5.8},
      {max: Infinity, rate: 6}
    ]},
    {state: 'New York', slug: 'ny', rates: ['incremental',
      {max: 8000, rate: 4},
      {max: 11000, rate: 4.5},
      {max: 13000, rate: 5.25},
      {max: 20000, rate: 5.9},
      {max: 75000, rate: 6.45},
      {max: 200000, rate: 6.65},
      {max: 1000000, rate: 6.85},
      {max: Infinity, rate: 8.72}
    ]}
  ]},

  // http://www.cra-arc.gc.ca/tx/ndvdls/fq/txrts-eng.html
  {country: 'Canada', slug: 'canada', code: 'CAD', symbol: 'CA$', rates: ['incremental',
    {max: 43561, rate: 15},
    {max: 87123, rate: 22},
    {max: 135054, rate: 26},
    {max: Infinity, rate: 29}
  ], states:[
    // {state: 'Newfoundland and Labrador', rates: ['incremental',
    //   {max: 33748, rate: 7.7},
    //   {max: 67496, rate: 12.5},
    //   {max: Infinity, rate: 13.3}
    // ]},
    // {state: 'Prince Edward Island', rates: ['incremental',
    //   {max: 31984, rate: 9.8},
    //   {max: 63969, rate: 13.8},
    //   {max: Infinity, rate: 16.7}
    // ]},
    // {state: 'Nova Scotia', rates: ['incremental',
    //   {max: 29590, rate: 8.79},
    //   {max: 590180, rate: 14.95},
    //   {max: 93000, rate: 16.67},
    //   {max: 150000, rate: 17.5},
    //   {max: Infinity, rate: 21}
    // ]},
    // {state: 'New Brunswick', rates: ['incremental',
    //   {max: 38954, rate: 9.39},
    //   {max: 77908, rate: 13.46},
    //   {max: 126662, rate: 14.46},
    //   {max: Infinity, rate: 16.07}
    // ]},
    // http://www.revenuquebec.ca/en/citoyen/impots/rens_comp/taux.aspx
    {state: 'Quebec', slug: 'qc', rates: ['incremental',
      {max: 41095, rate: 16},
      {max: 82190, rate: 20},
      {max: 100000, rate: 24},
      {max: Infinity, rate: 25.75}
    ]},
    {state: 'Ontario', slug: 'on', rates: ['incremental',
      {max: 39723, rate: 5.05},
      {max: 79448, rate: 9.15},
      {max: 509000, rate: 11.16},
      {max: Infinity, rate: 13.16}
    ]},
    {state: 'Manitoba', slug: 'mb', rates: ['incremental',
      {max: 31000, rate: 10.8},
      {max: 67000, rate: 12.75},
      {max: Infinity, rate: 17.4}
    ]},
    // {state: 'Saskatchewan', rates: ['incremental',
    //   {max: 42906, rate: 11},
    //   {max: 122589, rate: 13},
    //   {max: Infinity, rate: 15}
    // ]},
    {state: 'Alberta', slug: 'ab', rate: 10},
    {state: 'British Columbia', slug: 'bc', rates: ['incremental',
      {max: 37568, rate: 5.06},
      {max: 71138, rate: 7.7},
      {max: 82268, rate: 10.5},
      {max: 104754, rate: 12.29},
      {max: Infinity, rate: 14.7}
    ]}
    // {state: 'Yukon', rates: ['incremental',
    //   {max: 43561, rate: 7.04},
    //   {max: 87123, rate: 9.68},
    //   {max: 135054, rate: 11.44},
    //   {max: Infinity, rate: 12.76}
    // ]},
    // {state: 'Nerthwest Territories', rates: ['incremental',
    //   {max: 39543, rate: 5.9},
    //   {max: 79086, rate: 8.6},
    //   {max: 128286, rate: 12.2},
    //   {max: Infinity, rate: 14.05}
    // ]},
    // {state: 'Nunavut', rates: ['incremental',
    //   {max: 41535, rate: 4},
    //   {max: 83071, rate: 7},
    //   {max: 135054, rate: 9},
    //   {max: Infinity, rate: 11.5}
    // ]}
  ]},

  {country: 'Hong Kong', slug: 'hongkong', code: 'HKD', symbol: 'HK$', rates: ['simple',
    {max: 40000, rate: 2},
    {max: 80000, rate: 7},
    {max: 120000, rate: 12},
    {max: Infinity, rate: 17}
  ]},

  {country: 'Singapore', slug: 'singapore', code: 'SGD', symbol: 'SG$', rates: ['incremental',
    {max: 20000, rate: 0},
    {max: 30000, rate: 2},
    {max: 40000, rate: 3.5},
    {max: 80000, rate: 7},
    {max: 120000, rate: 11.5},
    {max: 160000, rate: 15},
    {max: 200000, rate: 17},
    {max: 320000, rate: 18},
    {max: Infinity, rate: 20}
  ]},

  // https://en.wikipedia.org/wiki/Taxation_in_China#Individual_income_tax
  {country: 'China', slug: 'china', code: 'CNY', rates: ['incremental',
    {max: 1500, rate: 3},
    {max: 4500, rate: 10},
    {max: 9000, rate: 20},
    {max: 35000, rate: 25},
    {max: 55000, rate: 30},
    {max: 80000, rate: 35},
    {max: Infinity, rate: 45}
  ]},

  // http://www.rd.go.th/publish/6045.0.html
  {country: 'Thailand', slug: 'thailand', code: 'THB', symbol: '฿', rates: ['incremental',
    {max: 150000, rate: 0},
    {max: 500000, rate: 10},
    {max: 1000000, rate: 20},
    {max: 4000000, rate: 30},
    {max: Infinity, rate: 37}
  ]},

  // http://savemoney.my/malaysia-personal-income-tax-guide-2013-rates-exemptions-rebates-reliefs-and-more/
  {country: 'Malaysia', slug: 'malaysia', code: 'MYR', rates: ['incremental',
    {max: 2500, rate: 0},
    {max: 5000, rate: 1},
    {max: 10000, rate: 3},
    {max: 20000, rate: 3},
    {max: 35000, rate: 7},
    {max: 50000, rate: 12},
    {max: 70000, rate: 19},
    {max: 100000, rate: 24},
    {max: Infinity, rate: 26}
  ]},

  // http://www.korea4expats.com/article-income-taxes.html
  {country: 'South Korea', slug: 'southkorea', code: 'KRW', rates: ['incremental',
    {max: 12000000, rate: 6},
    {max: 46000000, rate: 16},
    {max: 88000000, rate: 25},
    {max: Infinity, rate: 35}
  ]},

  {country: 'Japan', slug: 'japan', code: 'JPY', symbol: '¥', rates: ['incremental',
    {max: 1950000, rate: 5},
    {max: 3300000, rate: 10}, // 3300000-1950000
    {max: 6950000, rate: 20}, // 6950000-3300000
    {max: 9000000, rate: 23}, // 9000000-6950000
    {max: 18000000, rate: 33}, // 18000000-9000000
    {max: Infinity, rate: 40}
  ]},

  // https://en.wikipedia.org/wiki/Income_tax_in_Australia#Individual_income_tax_rates_.28residents.29
  {country: 'Australia', slug: 'australia', code: 'AUD', symbol: 'AU$', rates: ['incremental',
    {max: 18200, rate: 0},
    {max: 37000, rate: 19},
    {max: 80000, rate: 32.5},
    {max: 180000, rate: 37},
    {max: Infinity, rate: 45}
  ]},

  // https://en.wikipedia.org/wiki/Taxation_in_the_United_Kingdom#Income_tax
  {country: 'United Kingdom', slug: 'uk', code: 'GBP', symbol: '£', rates: ['incremental',
    {max: 32011, rate: 20},
    {max: 150000, rate: 40},
    {max: Infinity, rate: 45}
  ]},

  // https://en.wikipedia.org/wiki/Taxation_in_the_Republic_of_Ireland#Rates_of_income_tax
  {country: 'Ireland', slug: 'ireland', code: 'EUR', rates: ['incremental',
    {max: 32800, rate: 20},
    {max: Infinity, rate: 41}
  ]},

  // https://en.wikipedia.org/wiki/Income_tax_in_Spain
  {country: 'Spain', slug: 'spain', code: 'EUR', symbol: '€', rates: ['incremental',
    {max: 17707.2, rate: 24},
    {max: 33007.2, rate: 28},
    {max: 53407.2, rate: 37},
    {max: 120000.2, rate: 43},
    {max: 175000.2, rate: 44},
    {max: Infinity, rate: 45}
  ]},

  // https://en.wikipedia.org/wiki/Taxation_in_Italy
  {country: 'Italy', slug: 'italy', code: 'EUR', symbol: '€', rates: ['incremental',
    {max: 15000, rate: 23},
    {max: 28000, rate: 27},
    {max: 55000, rate: 38},
    {max: 75000, rate: 41},
    {max: Infinity, rate: 43}
  ]},

  // http://en.wikipedia.org/wiki/Income_tax_in_the_Netherlands#Progressive_tax_on_wages_etc._.28box_1.29
  {country: 'Netherlands', slug: 'netherlands', code: 'EUR', symbol: '€', rates: ['incremental',
    {max: 19645, rate: 5.85},
    {max: 33363, rate: 10.85},
    {max: 55991, rate: 42},
    {max: Infinity, rate: 52}
  ]},

  {country: 'Cyprus', slug: 'cyprus', code: 'EUR', symbol: '€', rates: ['incremental',
    {max: 19500, rate: 0},
    {max: 28000, rate: 20},
    {max: 36300, rate: 25},
    {max: 60000, rate: 30},
    {max: Infinity, rate: 35}
  ]},

  {country: 'Sweden', slug: 'sweden', code: 'SEK', rates: ['incremental',
    {max: 413200, rate: 30},
    {max: 591600, rate: 50},
    {max: Infinity, rate: 55}
  ]},

  {country: 'Iceland', slug: 'iceland', code: 'ISK', rates: ['incremental',
    {max: 2512800, rate: 37.31},
    {max: 8166600, rate: 40.21},
    {max: Infinity, rate: 46.21}
  ]},

  {country: 'Czech Republic', slug: 'czechrepublic', code: 'CZK', symbol: 'Kč', rate: 15},

  // {country: 'Switzerland', code: 'CHF', symbol: '', rates: ['']},
  {country: 'Georgia', slug: 'georgia', code: 'GEL', symbol: '', rate: 20},
  {country: 'Latvia', slug: 'latvia', code: 'EUR', symbol: '€', rate: 24},

  // http://europa.eu/youreurope/citizens/work/retire/taxes/austria/index_en.htm
  {country: 'Austria', slug: 'austria', code: 'EUR', rates: ['incremental',
    {max: 10999, rate: 0},
    {max: 25000, rate: 36.5},
    {max: 60000, rate: 43.2},
    {max: Infinity, rate: 50}
  ]},

  // https://en.wikipedia.org/wiki/Taxation_in_France#Income_Taxes
  {country: 'France', slug: 'france', code: 'EUR', rates: ['incremental',
    {max: 6011, rate: 0},
    {max: 11991, rate: 5.5},
    {max: 26631, rate: 14},
    {max: 71397, rate: 30},
    {max: 151200, rate: 41},
    {max: Infinity, rate: 45}
  ]},

  // http://europa.eu/youreurope/citizens/work/abroad/taxes/poland/employed_en.htm
  {country: 'Poland', slug: 'poland', code: 'PLN', rates: ['incremental',
    {max: 3091, rate: 0},
    {max: 85528, rate: 18},
    {max: Infinity, rate: 32}
  ]},

  // Germany does not work.
  // http://www.parmentier.de/steuer/steuer.htm?wagetax.htm
  // Tax % Tax Base (EUR)
  // 0 Up to 8,130
  // 14% 8,131-52,881
  // 42% 52,882-250,730
  // 45% 250,731 and over
  // {country: 'Germany', code: 'EUR', rates: ['simple',
  //   {max: 8130, rate: 0},
  //   {max: 52881, rate: 14},
  //   {max: 250731, rate: 42},
  //   {max: Infinity, rate: 45}
  // ]}

  // https://en.wikipedia.org/wiki/Taxation_in_Israel#Personal_Income_tax
  {country: 'Israel', slug: 'israel', code: 'ILS', rates: ['incremental',
    {max: 62400, rate: 10},
    {max: 106560, rate: 14},
    {max: 173160, rate: 21},
    {max: 261360, rate: 30},
    {max: 501960, rate: 33},
    {max: Infinity, rate: 48}
  ]},

  // FTW!
  {country: 'United Arab Emirates', slug: 'uae', code: 'AED', rate: 0},

  {country: 'Russia', slug: 'russia', code: 'RUB', rate: 13},
  {country: 'Ukraine', slug: 'ukraine', code: 'UAH', symbol: '₴', rates: ['simple',
    {max: 12180, rate: 15},
    {max: Infinity, rate: 17}
  ]},
  {country: 'Belarus', slug: 'belarus', code: 'BYR', rate: 12}
];
