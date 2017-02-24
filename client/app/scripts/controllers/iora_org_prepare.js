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
 * @ngdoc function
 * @name ioraliteAngularApp.controller:IoraOrgPrepareCtrl
 * @description
 * # IoraOrgPrepareCtrl
 * Controller of the ioraliteAngularApp
 */

angular.module('ioraliteAngularApp')
  .controller('IoraOrgPrepareCtrl', function($q,$scope, $filter, $location, $localStorage, $http, $timeout, blockUI, aboutMeFactory, ioraServicesFactory, ioraReportFactory, userInfoFactory, ioraDashboardFactory, httpReqFactory, ioraGateKeeperFactory, reportAggFactory, dashboardAggFactory,ioraOrgPrepFactory) {

    var apiVer = '36.0';


    //set the session storage for caching the API results
    $scope.$storage = $localStorage;

    //set the selective flag selected by user quick scan flag in the UI.
    var isSelective=!($scope.$storage.quickScan);

    if ($scope.$storage.version !== null && $scope.$storage.version !== undefined && $scope.$storage.version.length > 0) {
      apiVer = $scope.$storage.version;
    }

    $scope.offset = 0;
    $scope.timerCurrent = 0;
    $scope.uploadCurrent = 0;
    $scope.stroke = 15;
    $scope.radius = 125;
    $scope.isSemi = false;
    $scope.rounded = false;
    $scope.responsive = false;
    $scope.clockwise = true;
    $scope.currentColor = '#45ccce';
    $scope.bgColor = '#eaeaea';
    $scope.duration = 800;
    $scope.currentAnimation = 'easeOutCubic';
    $scope.animationDelay = 0;


    $scope.getStyle = function() {
      var transform = ($scope.isSemi ? '' : 'translateY(-50%) ') + 'translateX(-50%)';

      return {
        'top': $scope.isSemi ? 'auto' : '50%',
        'bottom': $scope.isSemi ? '5%' : 'auto',
        'left': '50%',
        'transform': transform,
        '-moz-transform': transform,
        '-webkit-transform': transform,
        'font-size': $scope.radius / 3.5 + 'px'
      };
    };

    $scope.getColor = function() {
      return $scope.gradient ? 'url(#gradient)' : $scope.currentColor;
    };

    ioraOrgPrepFactory.ioraOrgPrepare($q,$scope,$location,$localStorage,apiVer,isSelective);

  });
