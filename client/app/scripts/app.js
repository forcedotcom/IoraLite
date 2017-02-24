/*
 * Copyright (c) 2017, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of Salesforce.com nor the names of its contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

/**
 * @ngdoc overview
 * @name ioraliteAngularApp
 * @description
 * # ioraliteAngularApp
 *
 * Main module of the application.
 */



angular
  .module('ioraliteAngularApp', [
    'ngRoute', 'ngResource', 'ngStorage','restangular', 'blockUI', 'oc.lazyLoad','nvd3','angular-svg-round-progress','ioraSessionServices','ioraServices','ioraSearchServices','ngCookies','ui.bootstrap.showErrors','ui.select','ngSanitize','nvd3ChartDirectives','ioraChartServices','underscore','ioraOrgPrepServices'
  ])
  .run(function($location){
     if ($location.protocol() !== 'https' && $location.host() !== 'localhost') {
       window.location.href=$location.absUrl().replace('http', 'https');
     }
  })
  .config(function($routeProvider,RestangularProvider, blockUIConfig, $ocLazyLoadProvider, $locationProvider) {
      $locationProvider
      .html5Mode(true).hashPrefix('');



    $ocLazyLoadProvider.config({
      events: true
    });


    //construct application base URL
    /*var protocol=$location.protocol();
    var host=$location.host();
    var port=$location.port();
    var baseUrlStr=protocol + "://" + host + ":"  + port;
    RestangularProvider.setBaseUrl(baseUrlStr);*/

    // Change the default overlay message
    blockUIConfig.message = 'Loading.....';
    blockUIConfig.blockBrowserNavigation = true;


    // Change the default delay to 100ms before the blocking is visible
    blockUIConfig.delay = 100;

    var loginOptions={
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl',
      controllerAs: 'login',
      resolve: {
        loadMyFiles: function($ocLazyLoad) {
          return $ocLazyLoad.load({
            name: 'IoraLogin',
            files: [
              'scripts/directives/termsofservice/terms.js',
              'scripts/directives/errors/invalidlogin.js',
              'scripts/directives/bootstrap_switch/bootstrap-switch.min.css',
              'scripts/directives/bootstrap_switch/bootstrap-switch.min.js',
              'scripts/directives/bootstrap_switch/switch-directive.js'
            ]
          });
        }
      }
    };


    $routeProvider
      .when('/', loginOptions)
      .when('/login', loginOptions)
      .when('/oauthRedirect', {
        templateUrl: 'views/oauthredirect.html',
        controller: 'OauthredirectCtrl',
        controllerAs: 'oauthRedirect'

      })
      .when('/Iora_Org', {
        templateUrl: 'views/iora_org.html',
        controller: 'IoraOrgCtrl',
        controllerAs: 'IoraOrg',
        resolve: {
          loadMyFiles: function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'IoraOrg',
              files: [
                'scripts/directives/iora/iora_ui_utility.js',
                'scripts/directives/header/header.js'
              ]
            });
          }
        }

      })
      .when('/Iora_Targets', {
        templateUrl: 'views/iora_targets.html',
        controller: 'IoraTargetsCtrl',
        controllerAs: 'IoraTargets',
        resolve: {
          loadMyFiles: function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'ioraTargets',
              files: [
                'scripts/directives/iora/iora_ui_utility.js',
                'scripts/directives/iora/datatables-merge.js',
                'scripts/directives/header/header.js',
                'scripts/directives/targets/targets.js',
                'scripts/directives/bootstrap_switch/bootstrap-switch.min.css',
                'scripts/directives/bootstrap_switch/bootstrap-switch.min.js',
                'scripts/directives/bootstrap_switch/switch-directive.js'
              ]
            });
          }
        }
      })
      .when('/Iora_Target', {
        templateUrl: 'views/iora_target.html',
        controller: 'IoraTargetCtrl',
        controllerAs: 'IoraTarget',
        resolve: {
          loadMyFiles: function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'IoraTarget',
              files: [
                'scripts/directives/iora/iora_ui_utility.js',
                'scripts/directives/iora/datatables-row-group.js',
                'scripts/directives/header/header.js',
                'scripts/directives/target/target.js'
              ]
            });
          }
        }
      })
      .when('/Iora_Errors', {
        templateUrl: 'views/iora_errors.html',
        controller: 'IoraErrorsCtrl',
        controllerAs: 'IoraErrors',
        resolve: {
          loadMyFiles: function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'IoraErrors',
              files: [
                'scripts/directives/iora/iora_ui_utility.js',
                'scripts/directives/iora/datatables-row-group.js',
                'scripts/directives/header/header.js',
                'scripts/directives/errors/error.js'
              ]
            });
          }
        }

      })
      .when('/Iora_Warning', {
        templateUrl: 'views/iora_warning.html',
        controller: 'IoraWarningCtrl',
        controllerAs: 'ioraWarning',
        resolve: {
          loadMyFiles: function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'IoraWarnings',
              files: [
                'scripts/directives/iora/iora_ui_utility.js',
                'scripts/directives/header/header.js',
                'scripts/directives/warnings/warning.js'
              ]
            });
          }
        }
      })
      .when('/Iora_Page_Not_Found', {
        templateUrl: 'views/iora_page_not_found.html',
        controller: 'IoraPageNotFoundCtrl',
        controllerAs: 'IoraPageNotFound',
        resolve: {
          loadMyFiles: function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'IoraWarnings',
              files: [
                'scripts/directives/iora/iora_ui_utility.js',
                'scripts/directives/header/header.js',
                'scripts/directives/errors/pagenotfound.js'
              ]
            });
          }
        }
      })
      .when('/Iora_No_Org_Context', {
        templateUrl: 'views/iora_no_org_context.html',
        controller: 'IoraNoOrgContextCtrl',
        controllerAs: 'IoraNoOrgContext'
      })
      .when('/test', {
        templateUrl: 'views/test.html',
        controller: 'TestCtrl',
        controllerAs: 'test'
      })
      .when('/Iora_Unpermitted_Org', {
        templateUrl: 'views/iora_unpermitted_org.html',
        controller: 'IoraUnpermittedOrgCtrl',
        controllerAs: 'IoraUnpermittedOrg'
      })
      .when('/Iora_Org_Prepare', {
        templateUrl: 'views/iora_org_prepare.html',
        controller: 'IoraOrgPrepareCtrl',
        controllerAs: 'IoraOrgPrepare',
        resolve: {
          loadMyFiles: function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'ioraOrgPrepare',
              files: [
                'scripts/directives/progress_chart/progress.css'
              ]
            });
          }
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .factory('Versions', function(Restangular) {
    return Restangular.service('versions');
  })
  .factory('Login', function(Restangular) {
    return Restangular.service('login');
  })
  .factory('aboutMeFactory', function(Restangular) {
    return Restangular.all('aboutme');
  });
