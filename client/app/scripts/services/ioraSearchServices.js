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

 angular.module('ioraSearchServices', [])
 .factory('ioraSearchFactory', function(httpReqFactory, blockUI, reportAggFactory, dashboardAggFactory, ioraOrgPrepFactory, $http, $location, $localStorage) {

   var _captureReportErrors=function(indReportInfo,reportIds,reportErrors,$scope,blockUI){
     reportErrors.push(indReportInfo.generalInfo);
     $scope.$storage.reportIds = reportIds;
     //cope.ioraReportRest.reportErrors = reportErrors;


     $(".modal").modal({
       backdrop: 'true',
       keyboard: false
     });

     $scope.searchErrorMsgs += indReportInfo.generalInfo.errorInfo.errorMessage;
     $scope.searchErrors = true;
     $scope.divStyle = {
       "display": "block",
       "position": "relative"
     };
     blockUI.stop();
     return;
   }

   var _captureInvalidSession=function($scope,blockUI){
     $(".modal").modal({
       backdrop: 'true',
       keyboard: false
     });
     $scope.invalidSessionMsg = 'Your session has expired. Please re-login and try again.';
     $scope.invalidSession = true;
     $scope.divStyle = {
       "display": "block",
       "position": "relative"
     };
     blockUI.stop();
     return;

   }

   var _finalizeAndSaveReport=function($scope,finalReportSummary,reportResults,reportErrors,reportSummaryStats,reportPerfErrors,reportsWithZeroRecs,reportIds){
     finalReportSummary.reportDetails = reportResults;
     finalReportSummary.reportErrors = reportErrors;
     finalReportSummary.reportSummaryStats = reportSummaryStats;
     finalReportSummary.reportPerfErrors = reportPerfErrors;
     finalReportSummary.reportsWithZeroRecs = reportsWithZeroRecs;


     $scope.$storage.ioraReportFactory = LZString.compressToUTF16(JSON.stringify(finalReportSummary));
     $scope.$storage.reportIds = reportIds;

   }

   var _processReports=function(rptPromises,reportPerfMap,reportIds,$scope,blockUI){
     $scope.ioraReportRest =JSON.parse(LZString.decompressFromUTF16($scope.$storage.ioraReportFactory));
     var finalReportSummary = {};
     var reportResults = $scope.ioraReportRest.reportDetails;
     var reportErrors = $scope.ioraReportRest.reportErrors;
     var reportSummaryStats = $scope.ioraReportRest.reportSummaryStats;
     var reportPerfErrors = $scope.ioraReportRest.reportPerfErrors;
     var reportsWithZeroRecs = $scope.ioraReportRest.reportsWithZeroRecs;

     var reportSummary = reportAggFactory.summarizeReports(rptPromises, reportPerfMap, reportSummaryStats);
     var noOfReportsFetched = 0;
     angular.forEach(reportSummary, function(indReportInfo) {
        noOfReportsFetched++;
     reportIds[indReportInfo.generalInfo.Id] = indReportInfo.generalInfo.Id;

     if (indReportInfo.generalInfo.errorInfo !== undefined) {
       $scope.$storage.reportIds = reportIds;
       if (indReportInfo.generalInfo.errorInfo.errorCode === 'INVALID_SESSION_ID') {
            _captureInvalidSession($scope,blockUI);

       } else {
           _captureReportErrors(indReportInfo,reportIds,reportErrors,$scope,blockUI);
       }

     } else if (indReportInfo.reportPerformance === undefined || indReportInfo.reportPerformance.executionPlans === undefined) {
       reportPerfErrors.push(indReportInfo.generalInfo);
     } else {
       if (indReportInfo.reportPerformance.executionPlans.length > 0 && indReportInfo.reportPerformance.executionPlans[0].cardinality === 0) {
         reportsWithZeroRecs.push(indReportInfo);
       }
       reportResults.push(indReportInfo);
     }
   });
     _finalizeAndSaveReport($scope,finalReportSummary,reportResults,reportErrors,reportSummaryStats,reportPerfErrors,reportsWithZeroRecs,reportIds);
     return noOfReportsFetched;
   }

  var fetchSingleReport = function(reportId, $scope, $route) {
      var reportPerfMap = [];
      var reportIds = $scope.reportIds;

      //check if the needed report ID was already fetched. If so return.
      if (reportIds[reportId] !== null && reportIds[reportId] !== undefined) {
        return;
      }


      var searchObject = $location.search();
      var access_token = $scope.$storage.access_token;
      var instance_url = $scope.$storage.instance_url;

      searchObject.access_token = access_token;
      searchObject.instance_url = instance_url;

      var finalReportSummary = {};
      var addlnReqParamsMap = [];

      var reportTmpIds = [];
      reportTmpIds.push(reportId);

      //construct the request data
      addlnReqParamsMap=ioraOrgPrepFactory.populateAddlnReqParamsMap('reportIds',reportTmpIds.toString(),$scope.$storage.version);

      //make the api call to fetch the dashboard describe. Needed to understand the dashboard components
      httpReqFactory.promisifyReq($http, '/reportsInfo', searchObject, addlnReqParamsMap).then(function(rptPromises) {
        _processReports(rptPromises,reportPerfMap,reportIds,$scope,blockUI);
        $route.reload();
        blockUI.stop();
      });

    };

    var fetchSingleDashboard = function(dashboardId, $scope, $route) {

      var reportPerfMap = [];
      var dashboardIds = $scope.dashboardIds;
      //check if the needed report ID was already fetched. If so return.
      if (dashboardIds[dashboardId] !== null && dashboardIds[dashboardId] !== undefined) {
        return;
      }

      $scope.ioraDashboardRest=JSON.parse(LZString.decompressFromUTF16($scope.$storage.ioraDashboardFactory));
      //get initial values loaded from the sessionStorage
      var dashSummaryStats = $scope.ioraDashboardRest.dashSummaryStats;
      var dashResults = $scope.ioraDashboardRest.dashDetails;
      var dashErrors = $scope.ioraDashboardRest.dashErrors;



      var reportIds = $scope.$storage.reportIds;
      var searchObject = $location.search();

      var access_token = $scope.$storage.access_token;
      var instance_url = $scope.$storage.instance_url;

      searchObject.access_token = access_token;
      searchObject.instance_url = instance_url;


      var finalDashSummary = {};



      var dashboardReqIds = [];
      var reportIdList = [];
      dashboardReqIds.push(dashboardId);

      var addlnReqParamsMap = [];
      var dashboardInfoMap = [];
      addlnReqParamsMap.dashboardIds = dashboardReqIds.toString();

      httpReqFactory.promisifyReq($http, '/fetchRecentDashboards', searchObject, addlnReqParamsMap).then(function(dashRecentresponse) {
        if (dashRecentresponse.errorCode === 'INVALID_SESSION_ID') {
           _captureInvalidSession($scope,blockUI);
        }
        angular.forEach(dashRecentresponse, function(value) {
          dashboardInfoMap[value.Id] = value;
        });

        //construct the request data
        addlnReqParamsMap=ioraOrgPrepFactory.populateAddlnReqParamsMap('dashboardIds',dashboardReqIds.toString(),$scope.$storage.version);

        httpReqFactory.promisifyReq($http, '/dashboardsInfo', searchObject, addlnReqParamsMap).then(function(dashDescribeResponseArr) {
          var dashboardRestInfoMap = [];
          angular.forEach(dashDescribeResponseArr, function(dashboardInstance) {
            dashboardIds[dashboardInstance.generalInfo.Id] = dashboardInstance.generalInfo.Id;
            dashboardRestInfoMap[dashboardInstance.generalInfo.Id] = dashboardInstance;

            angular.forEach(dashboardInstance.generalInfo.componentInfo, function(dashboardCmp) {
              if (reportIds[dashboardCmp.componentId] === null || reportIds[dashboardCmp.componentId] === undefined) {
                reportIds[dashboardCmp.componentId] = dashboardCmp.componentId;
                reportIdList.push(dashboardCmp.componentId);
              }
            }); //end of dashboard components iteration.


            //loop through any errors and add to the error modal. Only do if its a dashboard level failure and not component level failures.
            if (dashboardInstance.generalInfo.name === null || dashboardInstance.generalInfo.name === undefined) {
              angular.forEach(dashboardInstance.generalInfo.errorInfos, function(errorInfo) {
                $(".modal").modal({
                  backdrop: 'true',
                  keyboard: false
                });
                $scope.searchErrorMsgs += errorInfo.errorMessage;
                dashErrors.push(errorInfo);
                $scope.searchErrors = true;
                $scope.divStyle = {
                  "display": "block",
                  "position": "relative"
                };
                blockUI.stop();
              }); //end of dashboard errors iteration.
              $scope.$storage.dashboardIds = dashboardIds;
              $scope.$storage.ioraDashboardFactory.dashErrors = dashErrors;
              return;
            }
          }); //end of dashboard response iteration.


          var rptLoopIndex = 0;

          for (var reportIndex = 0; reportIndex < reportIdList.length; reportIndex += 10) {
            rptLoopIndex++;
            var reportsubset = reportIdList.slice(reportIndex, reportIndex + 10);
            //construct the request data
            addlnReqParamsMap=ioraOrgPrepFactory.populateAddlnReqParamsMap('reportIds',reportsubset.toString(),$scope.$storage.version);

            //make the api call to fetch the dashboard describe. Needed to understand the dashboard components


            httpReqFactory.promisifyReq($http, '/reportsInfo', searchObject, addlnReqParamsMap).then(function(rptPromises) {

              var noOfReportsFetched= _processReports(rptPromises,reportPerfMap,reportIds,$scope,blockUI);

              if (reportIdList.length === noOfReportsFetched) {

                var dashboardSummary = dashboardAggFactory.updateDashboards(dashboardRestInfoMap, dashboardInfoMap, reportPerfMap, dashSummaryStats);

                ioraOrgPrepFactory.parsedashResponse(dashboardSummary,dashResults,dashErrors)

                finalDashSummary.dashSummaryStats = dashSummaryStats;
                finalDashSummary.dashDetails = dashResults;
                finalDashSummary.dashErrors = dashErrors;
                $scope.$storage.ioraDashboardFactory = LZString.compressToUTF16(JSON.stringify(finalDashSummary));
                $scope.$storage.dashboardIds = dashboardIds;


                $route.reload();
                blockUI.stop();
                return;
              }
            });
          }

        }); //end of dashboard info HTTP Request.
});

};

return {
  fetchSingleReport: fetchSingleReport,
  fetchSingleDashboard: fetchSingleDashboard
};


});
