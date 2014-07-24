exports.config =
  # See http://brunch.io/#documentation for docs.
  paths:
    public: '../'

  files:
    javascripts:
      joinTo:
        'app.js': /^app/
        'vendor.js': /^(?!app)/
    stylesheets:
      joinTo: 'app.css'
    templates:
      joinTo: 'app.js'

  overrides:
    production:
      sourceMaps: false
