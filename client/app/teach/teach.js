'use strict';

angular.module('takhshilaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('teach', {
        url: '/',
        templateUrl: 'app/teach/teach.html',
        controller: 'TeachCtrl',
        authenticate: false,
        navStick: false
      });
  });
