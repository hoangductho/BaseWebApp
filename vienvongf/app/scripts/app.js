'use strict';

/**
 * @ngdoc overview
 * @name vienvongApp
 * @description
 * # vienvongApp
 *
 * Main module of the application.
 */
angular
  .module('vienvongApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'ui.bootstrap',
    'LocalStorageModule',
    '720kb.datepicker',

    'authMod',
    'facebookMod',
    'googleMod',
    'userMod',
  ])
  .config(function ($locationProvider, $stateProvider, $urlRouterProvider, localStorageServiceProvider) {
    // name prefix so your app doesn’t accidently read todos from another app using the same variable names
    localStorageServiceProvider.setPrefix('vienvong');
    // Enable mod rewirte
    $locationProvider.html5Mode(true);

    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/");
    //
    // Now set up the states
    $stateProvider
      .state('app', {
        abstract: true,
        template: '<div  id="wrap-page" ui-view=""></div>',
        resolve: {
          host: function ($rootScope) {
            $rootScope.apiHost = '//beta.vienvong.com/api/';
            $rootScope.apiUrl = {
              sec: {
                rsaPubKey: $rootScope.apiHost + 'sec/rsakey/:random',
              },
              auth: {
                signin: $rootScope.apiHost + 'auth/signin',
                signup: $rootScope.apiHost + 'auth/signup',
                active: $rootScope.apiHost + 'auth/active',
                forgot: $rootScope.apiHost + 'auth/forgot',
                resend: $rootScope.apiHost + 'auth/resend',
                facebook: $rootScope.apiHost + 'auth/facebook',
                google: $rootScope.apiHost + 'auth/google',
              },
              user: {
                profile: {
                  index: $rootScope.apiHost + 'user/profile/index',
                  update: $rootScope.apiHost + 'user/profile/update',
                },
                password: $rootScope.apiHost + 'user/password',
              }
            };
          },
        },
        controller: function($rootScope, $filter, $window, $interval, localStorageService, FConnect) {
          // --------------------------------------------------------
          /**
           * Load user authenticate info
           */
          function getAuth() {
            $rootScope.auth = localStorageService.get('auth');
          }
          getAuth();
          $interval(getAuth, 3000);
          // --------------------------------------------------------
          /**
           * ==============================================
           * RSA Key Init
           * ==============================================
           *
           * @todo Get RSA key from Server and storage in client localstorage
           *
           */
          function randomstring(length) {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < length; i++ ) {
              text += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            return text;
          }
          // --------------------------------------------------------
          /**
           * ==============================================
           * RSA Key Init
           * ==============================================
           *
           * @todo Get RSA key from Server and storage in client localstorage
           *
           */
          $rootScope.rsaKeyInit = function() {
            var date = $filter('date')(new Date(), 'yyyyMMdd', 'UTC');
            var rsa = localStorageService.get('rsakey');
            // Check RSA storage in client
            if(!rsa || (date !== rsa._id)) {
              // Random string 
              var random = randomstring(32);
              /**
               * -------------------------------------------------
               * Get RSA Key Successful
               * -------------------------------------------------
               */
              var success = function(data){
                // RSA-Public-Hexa-Key isset
                if(data.ok && data.result.publicHex) {
                    var apiRSA = data.result;
                    apiRSA.date = date;
                    // Storage rsa key and share for other page in app
                    localStorageService.set('rsakey',data.result);
                    $rootScope.rsakey = data.result;
                    $window.location.reload();
                }else {
                    console.log('RSA key from server invalid!');
                }
              };
              /**
               * -------------------------------------------------
               * Get RSA Key Failed
               * -------------------------------------------------
               */
              var error = function(err) {
                window.alert('Failed to connect to server.');
                console.log(err);
                return false;
              };
              /**
               * -------------------------------------------------
               * Get RSA key from server
               * -------------------------------------------------
               *
               * using service provided by factory defaultFact
               *
               * @see services/defaultFact.js
               */ 
              new FConnect($rootScope.apiUrl.sec.rsaPubKey, {random: random}).get({}, success, error);
            }else {
                $rootScope.rsakey = rsa;
            }
          };
          
          // Init default security key
          $rootScope.rsaKeyInit();
          // --------------------------------------------------------
        }
      })
      .state('app.main', {
        url: "/",
        templateUrl: "views/main.html",
        controller: 'MainCtrl'
      })
      .state('app.about', {
        url: "/about",
        templateUrl: "views/about.html",
      });
    });
