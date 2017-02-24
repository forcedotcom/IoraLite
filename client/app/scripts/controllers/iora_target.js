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
 * @name ioraliteAngularApp.controller:IoraTargetCtrl
 * @description
 * # IoraTargetCtrl
 * Controller of the ioraliteAngularApp
 */
angular.module('ioraliteAngularApp')
  .controller('IoraTargetCtrl', function($scope, $filter, blockUI, $localStorage, $location, $timeout, ioraReportFactory, ioraDashboardFactory, userInfoFactory, ioraInitFactory, ioraSearchFactory,$route,orgDetailChartFactory) {

    var _populateScopeBasedonTarget=function($scope,$filter,$location,queryParams,sfdcId){
      if (sfdcId === "00O") {
        $scope.targetTypes = 'Reports';
        $scope.targetType = 'Report';
        $scope.isReportPage = true;
        $scope.isDashboardPage = false;
        targetElement = $filter('filter')($scope.ioraReportRest.reportDetails, {
          $: queryParams.target
        })[0];
        $scope.generalClass = "active";
        $scope.dashboardClass = "";
        $scope.dashboardDiv = "";
        $scope.generalDiv = "active in";
        $scope.hasDashErrors = false;



      } else if (sfdcId === "00B") {
        $scope.targetTypes = 'List Views';
        $scope.targetType = 'List View';
        $scope.isReportPage = false;
        $scope.isDashboardPage = false;
      } else if (sfdcId === "01Z") {
        $scope.targetTypes = 'Dashboards';
        $scope.targetType = 'Dashboard';
        $scope.isReportPage = false;
        $scope.isDashboardPage = true;
        $scope.generalClass = "";
        $scope.dashboardClass = "active";
        $scope.generalDiv = "";
        $scope.dashboardDiv = "active in";
        targetElement = $filter('filter')($scope.ioraDashboardRest.dashDetails, {
          $: queryParams.target
        })[0];
        if (targetElement !== null && targetElement !== undefined) {
          $scope.hasDashErrors = (targetElement.dashboardInfo.generalInfo.errorInfos !== null && targetElement.dashboardInfo.generalInfo.errorInfos.length > 0);
        } else {
          $scope.hasDashErrors = false;
        }

      } else { // invalid query string, so redirect to home page
          $location.url("./Iora_Org");
          $location.replace();
      }
    }

    var onDemandFetchRedirect=function($scope,blockUI,queryParams,$route,$location){

      //call the appropriate search factory if it has not been already fetched
      if($scope.targetType === 'Dashboard' &&
         ($scope.dashboardIds[queryParams.target] === null || $scope.dashboardIds[queryParams.target] === undefined)
       ){
            blockUI.start('Fetching dashboard and related reports from server');
            ioraSearchFactory.fetchSingleDashboard(queryParams.target, $scope,$route);
       }

       else if (
           $scope.targetType === 'Report' &&
          ($scope.reportIds[queryParams.target] === null || $scope.reportIds[queryParams.target] === undefined)
        ) {
             blockUI.start('Fetching report from server');
             ioraSearchFactory.fetchSingleReport(queryParams.target, $scope,$route);
       }

        //else redirect to page not found page to display appropriate modal error.
        else {
           $location.url('/Iora_Page_Not_Found?target='+queryParams.target + '&type=' + $scope.targetType);
           $location.replace();
        }

    }

    blockUI.start('Loading....');
    ioraInitFactory.pageLoad($scope);
    blockUI.stop();


    var queryParams = $location.search();
    var sfdcId = queryParams.target.substring(0, 3);

    //object to store the target element based on the entity.
    var targetElement;



    $scope.searchErrors = false;
    $scope.divStyle = '';
    $scope.searchErrorMsgs = '';
    $scope.invalidSession = false;
    $scope.invalidSessionMsg = '';



    // update config variables based on runtime parameters
    _populateScopeBasedonTarget($scope,$filter,$location,queryParams,sfdcId);

    if (targetElement === null || targetElement === undefined) {
      onDemandFetchRedirect($scope,blockUI,queryParams,$route,$location);
    } else {
      initConfig(document.URL);
      $timeout(function() {
        if ($scope.isDashboardPage && targetElement !== null && targetElement !== undefined) {
          var dashDetailChart=orgDetailChartFactory.dashboardDetailChart(targetElement.dashboardInfo.generalInfo.componentInfo);
          $scope.options=dashDetailChart.chartOptions;
          $scope.data=dashDetailChart.chartData;
        }

        if (targetElement !== null && targetElement !== undefined) {
          updateTargetPageData(targetElement);
        }
      }, 1000);
    }
  });
