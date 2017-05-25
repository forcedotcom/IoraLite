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

/**
 * Iora Services to construct angular charts needed for the app.
 * and provide to the controller.
 */

'use strict';

angular.module('ioraOrgPrepServices', [])
  .factory('ioraOrgPrepFactory', function($filter, $location, $localStorage, $http, $timeout, blockUI, aboutMeFactory, ioraServicesFactory, ioraReportFactory, userInfoFactory, ioraDashboardFactory, httpReqFactory, ioraGateKeeperFactory, reportAggFactory, dashboardAggFactory) {

    var _redirectUnPermittedOrg = function(response) {
      var isAccessDenied=(response.errorMessage && response.errorMessage !== 'PROCEED');
      if (isAccessDenied) {
        ioraGateKeeperFactory.set(response.errorMessage);
        $location.url('/Iora_Unpermitted_Org');
        $location.replace();
      }
      return isAccessDenied;
    }
    var _populateResultsandErrors = function(reportSummary, reportErrors, reportPerfErrors, reportsWithZeroRecs, reportResults, reportIds) {
      angular.forEach(reportSummary, function(indReportInfo) {
        if (indReportInfo.generalInfo.errorInfo !== undefined) {
          reportErrors.push(indReportInfo.generalInfo);
        } else if (indReportInfo.reportPerformance === undefined || indReportInfo.reportPerformance.executionPlans === undefined) {
          reportPerfErrors.push(indReportInfo.generalInfo);
        } else {
          if (indReportInfo.reportPerformance.executionPlans.length > 0 && indReportInfo.reportPerformance.executionPlans[0].cardinality === 0) {
            reportsWithZeroRecs.push(indReportInfo);
          }
          reportResults.push(indReportInfo);
        }
        reportIds[indReportInfo.generalInfo.Id] = indReportInfo.generalInfo.Id;
      });
    }

    var populateAddlnReqParamsMap = function(propertyName, propertyValue, apiVer) {
      var addlnReqParamsMap = {};
      addlnReqParamsMap[propertyName] = propertyValue;
      addlnReqParamsMap.apiVer = apiVer;
      addlnReqParamsMap.chunkSize = '25';
      return addlnReqParamsMap;
    }

    var addRankToStructure = function(interestedObj, perfPropertyName) {
      if (interestedObj) {
        for (var iterIdx = 0; iterIdx < interestedObj.length; iterIdx++) {
          var interestedInstance = interestedObj[iterIdx];
          interestedInstance[perfPropertyName].rank = iterIdx + 1;
        }
      }
    }

    var parsedashResponse=function(dashboardSummary,dashResults,dashErrors){
      angular.forEach(dashboardSummary.dashDetails, function(dashResponse) {

        if (dashResponse.dashboardStats.healthScore === -100 || dashResponse.dashboardInfo.generalInfo.name === undefined) {
          dashErrors = dashErrors.concat(dashResponse.dashboardInfo.generalInfo.errorInfos);
        } else {
          dashResults.push(dashResponse);
        }

      });
    }

    var _processLoadCompleteSteps = function(dashboardRestInfoMap, dashboardInfoMap, reportPerfMap, dashSummaryStats, reportSummaryStats, dashResults, reportResults, dashErrors, reportErrors, reportPerfErrors, reportsWithZeroRecs, reportIds, dashboardIds, $scope, $location, ioraReportFactory, ioraDashboardFactory) {

      var finalDashSummary = {};
      var finalReportSummary = {};

      var dashboardSummary = dashboardAggFactory.updateDashboards(dashboardRestInfoMap, dashboardInfoMap, reportPerfMap, dashSummaryStats);

      parsedashResponse(dashboardSummary,dashResults,dashErrors);

      //sort report health results.
      var sortedReportResults = $filter('orderBy')(reportResults, "reportPerformance.healthScoreMult1", true);
      //add rank value to the Data structure.

      addRankToStructure(sortedReportResults, 'reportPerformance');

      //sort dashboard results
      var sortedDashResults = $filter('orderBy')(dashResults, "reportPerformance.healthScore", true);
      //add rank value to the Data structure.
      addRankToStructure(sortedDashResults, 'dashboardStats');

      finalDashSummary.dashSummaryStats = dashSummaryStats;
      finalDashSummary.dashDetails = sortedDashResults;
      finalDashSummary.dashErrors = dashErrors;

      finalReportSummary.reportDetails = sortedReportResults;
      finalReportSummary.reportErrors = reportErrors;
      finalReportSummary.reportSummaryStats = reportSummaryStats;
      finalReportSummary.reportPerfErrors = reportPerfErrors;
      finalReportSummary.reportsWithZeroRecs = reportsWithZeroRecs;


      ioraReportFactory.set(finalReportSummary);
      $scope.$storage.ioraReportFactory = LZString.compressToUTF16(JSON.stringify(finalReportSummary));

      ioraDashboardFactory.set(finalDashSummary);
      $scope.$storage.ioraDashboardFactory = LZString.compressToUTF16(JSON.stringify(finalDashSummary));


      $scope.$storage.reportIds = reportIds;

      $scope.$storage.dashboardIds = dashboardIds;


      $location.url('/Iora_Org');
      $location.replace();
    }

    var _beginProcessingAlertUser = function(blockUI, $timeout) {
      blockUI.start('We are analyzing your org. Please hang tight!');

      $timeout(function() {
        blockUI.message('Assessment in Progress ...');
      }, 4000);

      $timeout(function() {
        blockUI.message('Fetching Dashboards......');
      }, 6000);

      $timeout(function() {
        blockUI.message('Collecting Dashboard Stats ...');
      }, 10000);

      $timeout(function() {
        blockUI.message('Fetching Dashboard Components ...');
      }, 30000);
    }

    var _interestedDashboardsInfo = function(dashRecentresponse, dashboardInfoMap, dashboardsReqd) {
      angular.forEach(dashRecentresponse, function(value) {

        dashboardInfoMap[value.Id] = value;
        dashboardsReqd.push(value.Id);
      });
    }

    var _storeUserInfo = function($scope, response, userInfoFactory) {
      $scope.userInfo = response;
      $scope.$storage.userInfoFactory = response;
      userInfoFactory.set(response);
    }

    /*var _processDashboardsResponse = function(dashboardRestInfoMap, dashDescribeResponseArr, dashboardIds, reportsToBeFetched, reportsReqd) {
      //dashboardRestInfoMap = [];

      angular.forEach(dashDescribeResponseArr, function(dashboardInstance) {

        dashboardIds[dashboardInstance.generalInfo.Id] = dashboardInstance.generalInfo.Id;
        dashboardRestInfoMap[dashboardInstance.generalInfo.Id] = dashboardInstance;

        angular.forEach(dashboardInstance.generalInfo.componentInfo, function(dashboardCmp) {
          if (reportsToBeFetched[dashboardCmp.componentId] === null || reportsToBeFetched[dashboardCmp.componentId] === undefined) {
            reportsToBeFetched[dashboardCmp.componentId] = dashboardCmp.componentId;
            reportsReqd = reportsReqd.concat(dashboardCmp.componentId);
          }
        }); //end of dashboard components iteration.
      }); //end of dashboard response iteration.
    }*/

    var _fetchDashboardsReports = function(httpReqFactory, searchObject, apiVer, reportsToBeFetched, reportsReqd, addlnReqParamsMap, $scope, $location) {

      var reportSummaryStats = ioraServicesFactory.genericPerfStats();
      var dashSummaryStats = ioraServicesFactory.genericPerfStats();

      var reportPerfMap = [];
      var dashboardInfoMap = [];
      var dashboardRestInfoMap = [];

      var dashResults = [];
      var reportResults = [];

      var reportsWithZeroRecs = [];
      var reportErrors = [];
      var reportPerfErrors = [];
      var dashErrors = [];

      //variable to store the dashboards Ids to be fetched
      var dashboardsReqd = [];
      var dashboardIds = [];
      var reportIds = [];

      var rptLoopIndex = 0;

      httpReqFactory.promisifyReq($http, '/fetchRecentDashboards', searchObject, null).then(function(dashRecentresponse) {
        _interestedDashboardsInfo(dashRecentresponse, dashboardInfoMap, dashboardsReqd);
        //construct the request data
        addlnReqParamsMap = populateAddlnReqParamsMap('dashboardIds', dashboardsReqd.toString(), apiVer);
        //make the api call to fetch the dashboard describe. Needed to understand the dashboard components
        httpReqFactory.promisifyReq($http, '/dashboardsInfo', searchObject, addlnReqParamsMap).then(function(dashDescribeResponseArr) {
        //  _processDashboardsResponse(dashboardRestInfoMap, dashDescribeResponseArr, dashboardIds, reportsToBeFetched, reportsReqd);

          angular.forEach(dashDescribeResponseArr, function(dashboardInstance) {

            dashboardIds[dashboardInstance.generalInfo.Id] = dashboardInstance.generalInfo.Id;
            dashboardRestInfoMap[dashboardInstance.generalInfo.Id] = dashboardInstance;

            angular.forEach(dashboardInstance.generalInfo.componentInfo, function(dashboardCmp) {
              if (reportsToBeFetched[dashboardCmp.componentId] === null || reportsToBeFetched[dashboardCmp.componentId] === undefined) {
                reportsToBeFetched[dashboardCmp.componentId] = dashboardCmp.componentId;
                reportsReqd = reportsReqd.concat(dashboardCmp.componentId);
              }
            }); //end of dashboard components iteration.
          }); //end of dashboard response iteration.

          blockUI.stop();
          $scope.max = reportsReqd.length;
          $scope.current = 0;

          rptLoopIndex = 0;

          for (var reportIndex = 0; reportIndex < reportsReqd.length; reportIndex += 10) {
            rptLoopIndex++;
            var reportsubset = reportsReqd.slice(reportIndex, reportIndex + 10);
            //construct the request data
            addlnReqParamsMap = populateAddlnReqParamsMap('reportIds', reportsubset.toString(), apiVer);

            //make the api call to fetch the dashboard describe. Needed to understand the dashboard components
            httpReqFactory.promisifyReq($http, '/reportsInfo', searchObject, addlnReqParamsMap).then(function(rptPromises) {
              var reportSummary = reportAggFactory.summarizeReports(rptPromises, reportPerfMap, reportSummaryStats);
              _populateResultsandErrors(reportSummary, reportErrors, reportPerfErrors, reportsWithZeroRecs, reportResults, reportIds);
              var totalLoaded = reportResults.length + reportErrors.length + reportPerfErrors.length;
              $scope.current = totalLoaded;
              if (reportsReqd.length === totalLoaded) {
                _processLoadCompleteSteps(dashboardRestInfoMap, dashboardInfoMap, reportPerfMap, dashSummaryStats, reportSummaryStats, dashResults, reportResults, dashErrors, reportErrors, reportPerfErrors, reportsWithZeroRecs, reportIds, dashboardIds, $scope, $location, ioraReportFactory, ioraDashboardFactory);
              }
            }); //end of reportsInfo call
          }
        }); //end of dashboard info HTTP Request.
      }); //end of fetch recent dashboards.
    }

    var ioraOrgPrepare = function($q,$scope, $location, $localStorage, apiVer,isSelective) {
      //update the location path to fix the hash issue
      var url = $location.url();
      var addlnReqParamsMap = [];
      //variable to store the array of reportIds fetched so far
      var reportsToBeFetched = [];
      var reportsReqd = [];
      //variable to store the health score promise objects for selective option
      var rptScorePromises = [];

      ioraServicesFactory.fixhashinURL(url, $location);

      if (url !== null && url.indexOf("?access_token") > -1) { //url check begining
        var searchObject = $location.search();
        if (searchObject.access_token !== null && searchObject.access_token.length > 0) {
          $scope.$storage.access_token = searchObject.access_token;
          $scope.$storage.instance_url = searchObject.instance_url;
          addlnReqParamsMap = {};
          addlnReqParamsMap.restEndPoint = '/services/data/v' + apiVer;
          httpReqFactory.promisifyReq($http, '/ioraGateKeeper', searchObject, addlnReqParamsMap).then(function(response) {
            if(_redirectUnPermittedOrg(response)) return;
            httpReqFactory.promisifyReq($http, '/aboutme', searchObject, null).then(function(response) {
                _storeUserInfo($scope, response, userInfoFactory);
                _beginProcessingAlertUser(blockUI, $timeout);
              },
              function(error) {
                console.log("There was an error saving" + error);
              });

              //selective scan
              if(isSelective){

                //make a rest call to fetchRecent reports
                httpReqFactory.promisifyReq($http, '/fetchPossibleCandidates', searchObject, addlnReqParamsMap).then(function(candidates) {

                  angular.forEach(candidates, function(candidate) {
                    reportsToBeFetched.push(candidate.Id);
                  });

                  for (var rptHealthIndex = 0; rptHealthIndex < reportsToBeFetched.length; rptHealthIndex += 25) {

                    var reportsubset = reportsToBeFetched.slice(rptHealthIndex, rptHealthIndex + 25);
                    addlnReqParamsMap = [];

                    //construct the request data
                    addlnReqParamsMap.reportIds = reportsubset.toString();
                    addlnReqParamsMap.apiVer = apiVer;
                    addlnReqParamsMap.chunkSize = '25';

                    rptScorePromises.push(httpReqFactory.promisifyReq($http, '/reportsPerf', searchObject, addlnReqParamsMap));
                  }


                  $q.all(rptScorePromises).then(function(reportHeathScores) {

                    var finalHealthScores = [];

                    angular.forEach(reportHeathScores, function(reportHeathScore) {
                      finalHealthScores = finalHealthScores.concat(reportHeathScore);
                    });

                    var sortedHealthScores = $filter('orderBy')(finalHealthScores, "healthScore", true);

                    for (var sortedIndex = 0; sortedIndex < 100 && sortedIndex < sortedHealthScores.length; sortedIndex++) {
                      reportsReqd.push(sortedHealthScores[sortedIndex].reportId);
                    }

                    _fetchDashboardsReports(httpReqFactory, searchObject, apiVer, reportsToBeFetched, reportsReqd, addlnReqParamsMap, $scope, $location);
                });//end iteration of reportHealthScores
              });//end call to fetchPossibleCandidates

              }
              //quick scan selected by user
              else{

                //make a rest call to fetchRecent reports
                httpReqFactory.promisifyReq($http, '/fetchRecent', searchObject, null).then(function(recentReportsResponse) {

                  angular.forEach(recentReportsResponse, function(reportInstance) {
                    reportsToBeFetched[reportInstance.Id] = reportInstance.Id;
                    reportsReqd.push(reportInstance.Id);
                  });

                  _fetchDashboardsReports(httpReqFactory, searchObject, apiVer, reportsToBeFetched, reportsReqd, addlnReqParamsMap, $scope, $location);

                }); //end of fetch recent reports

              }


          }); //end of gatekeeper validator call
        } //end of searchObject or query param check
      } //end of URL check
    }

    return {
      ioraOrgPrepare: ioraOrgPrepare,
      addRankToStructure:addRankToStructure,
      populateAddlnReqParamsMap:populateAddlnReqParamsMap,
      parsedashResponse:parsedashResponse
    };
  });
