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
  {country: 'United States', code: 'USD', symbol: 'US$', rates: ['incremental',
    {max: 8925, rate: 0},
    {max: 36250, rate: 15},
    {max: 87850, rate: 25},
    {max: 183250, rate: 28},
    {max: 398350, rate: 33},
    {max: 400000, rate: 35},
    {max: Infinity, rate: 39.6}
  ], states: [
    {state: 'Albama', rates: ['incremental',
      {max: 500, rate: 2},
      {max: 3000, rate: 3},
      {max: Infinity, rate: 5}
    ]},
    {state: 'Alaska', rates: null},
    {state: 'Arizona', rates: ['incremental',
      {max: 10000, rate: 2.59},
      {max: 25000, rate: 2.88},
      {max: 50000, rate: 3.36},
      {max: 150000, rate: 3.24},
      {max: Infinity, rate: 4.54}
    ]},
    {state: 'Arkasas', rates: ['incremental',
      {max: 4099, rate: 1},
      {max: 8199, rate: 2.5},
      {max: 12199, rate: 3.5},
      {max: 20399, rate: 4.5},
      {max: 33999, rate: 6},
      {max: Infinity, rate: 7}
    ]},
    {state: 'California', rates: ['incremental',
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
    {state: 'Colorado', rates: ['simple', {min: 0, rate: 4.63}]},
    {state: 'Connecticut', rates: ['incremental',
      {max: 10000, rate: 3},
      {max: 50000, rate: 5},
      {max: 100000, rate: 5.5},
      {max: 200000, rate: 6},
      {max: 250000, rate: 6.5},
      {max: Infinity, rate: 6.7}
    ]},
    {state: 'Delaware', rates: ['incremental',
      {max: 2000, rate: 0},
      {max: 5000, rate: 2.2},
      {max: 10000, rate: 3.9},
      {max: 20000, rate: 4.8},
      {max: 25000, rate: 5.2},
      {max: 60000, rate: 5.55},
      {max: Infinity, rate: 6.75}
    ]}
  ]},

  {country: 'Hong Kong', code: 'HKD', symbol: 'HK$', rates: ['simple',
    {min: 0, rate: 2},
    {min: 40000, rate: 7},
    {min: 80000, rate: 12},
    {min: 120000, rate: 17}
  ]},

  {country: 'Singapore', code: 'SGD', symbol: 'SG$', rates: ['incremental',
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

  // http://www.rd.go.th/publish/6045.0.html
  {country: 'Thailand', code: 'THB', symbol: '฿', rates: ['incremental',
    {max: 150000, rate: 0},
    {max: 500000, rate: 10},
    {max: 1000000, rate: 20},
    {max: 4000000, rate: 30},
    {max: Infinity, rate: 37}
  ]},

  {country: 'Japan', code: 'JPY', symbol: '¥', rates: ['incremental',
    {max: 1950000, rate: 5},
    {max: 3300000, rate: 10}, // 3300000-1950000
    {max: 6950000, rate: 20}, // 6950000-3300000
    {max: 9000000, rate: 23}, // 9000000-6950000
    {max: 18000000, rate: 33}, // 18000000-9000000
    {max: Infinity, rate: 40}
  ]},

  // https://en.wikipedia.org/wiki/Income_tax_in_Spain
  {country: 'Spain', code: 'EUR', symbol: '€', rates: ['incremental',
    {max: 17707.2, rate: 24},
    {max: 33007.2, rate: 28},
    {max: 53407.2, rate: 37},
    {max: 120000.2, rate: 43},
    {max: 175000.2, rate: 44},
    {max: 300000.2, rate: 45},
    {max: Infinity, rate: 45}
  ]},

  // Germany does not work.
  // http://www.parmentier.de/steuer/steuer.htm?wagetax.htm
  // Tax % Tax Base (EUR)
  // 0 Up to 8,130
  // 14% 8,131-52,881
  // 42% 52,882-250,730
  // 45% 250,731 and over
  // {country: 'Germany', code: 'EUR', rates: [
  //   {min: 0, rate: 0},
  //   {min: 8130, rate: 14},
  //   {min: 52881, rate: 42},
  //   {min: 250731, rate: 45}
  // ]}

  {country: 'United Arab Emirates', rates: null},

  {country: 'Russia', code: 'RUB', rates: ['simplem', {min: 0, rate: 13}]},
  {country: 'Ukraine', code: 'UAH', symbol: '₴', rates: ['simple',
    {min: 0, rate: 15},
    {min: 12180, rate: 17}
  ]},
  {country: 'Belarus', code: 'BYR', rates: ['simple', {min: 0, rate: 12}]}
];
