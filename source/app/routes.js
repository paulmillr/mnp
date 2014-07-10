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
