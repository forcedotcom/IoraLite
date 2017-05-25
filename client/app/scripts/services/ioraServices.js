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

/* Generic Services */
'use strict';

angular.module('ioraServices', [])
  .factory('ioraAuthFactory', function($location,ioraServicesFactory){

    var ensureUserAppContext=function(pageContext){
        //make sure the page context is not going to authentication or caching process
        if(pageContext.controller !== 'LoginCtrl' && pageContext.controller !== 'OauthredirectCtrl' && pageContext.controller !== 'IoraOrgPrepareCtrl'){
             ioraServicesFactory.ensureUserAppContext(null,$location);
        }
    }

    return {
      ensureUserAppContext:ensureUserAppContext
    };

  })
  .factory('ioraInitFactory', function($localStorage, $location, ioraServicesFactory) {

    var _initializeFilters = function($scope) {
      $scope.scopeFilter = {
        selectedValue: ""
      };

      $scope.allScopeFilter = {
        selectedValue: ""
      };

    }

    var _initalizeLinks = function($scope) {
      //set the link and image values
      $scope.logo = 'images/iora_logo.png';
      $scope.dashboardsPage = '/Iora_Targets?target=dashboards';
      $scope.overviewPage = '/Iora_Org';
      $scope.errorsPage = '/Iora_Errors';
      $scope.warningsPage = '/Iora_Warning';
      $scope.reportsPage = '/Iora_Targets?target=reports';
    }

    var _loadSearchData = function($scope,$location) {
      //define action to be taken on click of go button
      ioraServicesFactory.defineGoButtonAction($scope,$location);

      //function to capture the enter key on search box to trigger the search.
      $scope.ioraSearchKey = function(event) {
        if (event.keyCode === 13) {
          $scope.ioraSearch();
        }
      };

      $scope.ioraSearch = function() {
        var re = new RegExp('^(0(0O|1Z)[a-zA-Z0-9]{12}([A-Z][A-Z][A-Z0-9])*$)');
        var isValid = (re.test($scope.searchID));
        if (!isValid) {
          $scope.searchID = '';
          $scope.isSearchError = true;
          $scope.placeHolder = 'Enter valid ID';
        } else {
          $location.url('/Iora_Target?target=' + $scope.searchID);
          $location.replace();
          $scope.placeHolder = "Search by ID..";
          $scope.isSearchError = false;
        }
      };

    }

    var _loadFromLocalStorage = function($scope) {
      //update session sessionStorage
      $scope.$storage = $localStorage;
      $scope.reportIds = $scope.$storage.reportIds;
      $scope.dashboardIds = $scope.$storage.dashboardIds;

      $scope.userInfo = $scope.$storage.userInfoFactory;
      $scope.userFirstName = $scope.userInfo.firstName;
      $scope.userLastName = $scope.userInfo.lastName;

      $scope.ioraDashboardRest = JSON.parse(LZString.decompressFromUTF16($scope.$storage.ioraDashboardFactory));
      $scope.ioraReportRest = JSON.parse(LZString.decompressFromUTF16($scope.$storage.ioraReportFactory));

      $scope.reportStats = $scope.ioraReportRest.reportSummaryStats;
      $scope.dashboardStats = $scope.ioraDashboardRest.dashSummaryStats;

      if ($scope.$storage.chartFilter !== null && $scope.$storage.chartFilter !== undefined) {
        $scope.chartFilter = $scope.$storage.chartFilter;
        delete $scope.$storage.chartFilter;
      }
    }

    

    var _setDefaults = function($scope) {
      $scope.placeHolder = "Search by ID..";
      $scope.isSearchError = false;
    }

    var _genericErrorCount=function($scope,entityType){
      var restObject=('report' === entityType)?$scope.ioraReportRest:$scope.ioraDashboardRest;
      if (restObject[entityType + 'Errors']) {
         return restObject[entityType + 'Errors'].length;
      }
    }

    var _loadErrorsWarnings = function($scope) {
      $scope.totalNoOfErrors = _genericErrorCount($scope,'report') + _genericErrorCount($scope,'dash');
    }

    var _calculateNetWarningErrors = function($scope) {
      ioraServicesFactory.updateTotalWarningCount($scope);
      $scope.isRenderErrors = ($scope.totalNoOfErrors > 0);
      $scope.isRenderWarnings = ($scope.totalNoOfWarnings > 0);
    }

    var pageLoad = function($scope) {
      _setDefaults($scope);
      _initalizeLinks($scope);
      _initializeFilters($scope);
      _loadSearchData($scope,$location);
      _loadFromLocalStorage($scope);
      ioraServicesFactory.ensureUserAppContext($scope,$location);
      _loadErrorsWarnings($scope);
      ioraServicesFactory.loadReportScopeData($scope);
      _calculateNetWarningErrors($scope);
    };

    return {
      pageLoad: pageLoad 
    };

  })
  .factory('ioraServicesFactory', function($localStorage) {

    var _getAppContext=function(contextObject){
      if(contextObject === null || contextObject === undefined){
         contextObject=$localStorage
         return (contextObject.userInfoFactory)
      }
      else{
        return (contextObject.ioraDashboardRest && contextObject.ioraReportRest && contextObject.userInfo) 
      }
    }

    var ensureUserAppContext = function(contextObject,$location) {
      if (!_getAppContext(contextObject)) {
        $location.url('/Iora_No_Org_Context');
        $location.replace();
      }
    }

    var fixhashinURL=function(url,$location){
      if (url !== null && url.indexOf("#access_token") > -1) {
        $location.url($location.path() + '?' + $location.hash());
        $location.replace();
      }
    }

    var sortByHealthScore=function($filter,ioraObj,targetType){
      var sortedArray = [];
      if (isReport(targetType)) {
        sortedArray = $filter('orderBy')(ioraObj, "reportPerformance.healthScoreMult1", true);
      } else {
        sortedArray = $filter('orderBy')(ioraObj, "dashboardStats.healthScore", true);
      }
      return sortedArray;
    }

    var defineGoButtonAction=function($scope,$location){
      $scope.go = function(path) {
        $location.url(path);
        $location.replace();
        $('body').removeClass('modal-open');
      };
    }

    var loadReportScopeData = function($scope) {
      $scope.privateScopes = [];
      $scope.allScopes = [];

      $scope.scopeGroups = _.groupBy($scope.ioraReportRest.reportDetails, function(obj) {
        return obj.reportFilters.scopeValue;
      });

      for (var key in $scope.scopeGroups) {
        if ({}.hasOwnProperty.call($scope.scopeGroups, key) && key !== 'undefined') {
          _pushPrivateAllScopes(key, $scope);
        }
      }
      $scope.scopeFilter.selectedValue = $scope.privateScopes[0];
      $scope.allScopeFilter.selectedValue = $scope.allScopes[0];
    }

    var _pushPrivateAllScopes = function(key, $scope) {

      if (key.indexOf('All') === -1)
        $scope.privateScopes.push(key)
      else
        $scope.allScopes.push(key);
    }

    var _calculateObjectLength = function(obj) {
      if (obj) {
        return obj.length;
      }
      else{
        return 0;
      }
    }

    var updateTotalWarningCount = function($scope,selectedWideScope,selectedPrivateScope) {
      //variable initialization
      if(!selectedWideScope){
        selectedWideScope=$scope.scopeGroups[$scope.allScopes[0]];
      }

      if(!selectedPrivateScope){
        selectedPrivateScope=$scope.scopeGroups[$scope.privateScopes[0]];
      }

      var zeroRecLength = 0;
      var wideScopeLength = 0;
      var privateScopeLength = 0;
      if ($scope.ioraReportRest && $scope.scopeGroups) {
        zeroRecLength = _calculateObjectLength($scope.ioraReportRest.reportsWithZeroRecs);
        wideScopeLength = _calculateObjectLength(selectedWideScope);
        privateScopeLength = _calculateObjectLength(selectedPrivateScope);
      }
      $scope.totalNoOfWarnings = zeroRecLength + wideScopeLength + privateScopeLength;
    }

    var genericPerfStats = function() {
      var genericStatObject = {
        //reset perf numbers
        optimalHSCnt: 0,
        optimalUnscalableHSCnt: 0,
        suboptimalUnhealthyHSCnt: 0,
        suboptimalUnscalableHSCnt: 0,
        //reset design perf numbers
        optimalDesignCnt: 0,
        suboptimalDesignCnt: 0,

        //reset scalability perf numbers
        criticalScalabilityCnt: 0,
        warningScalabilityCnt: 0,
        okScalabilityCnt: 0,


        //perf tags count
        undeindexedHDCnt: 0,
        wildcardfilterHDCnt: 0,
        nonselectiveHDCnt: 0,
        recordskewHDCnt: 0,
        negativefilterHDCnt: 0,
        nonoptimizableopHDCnt: 0,
        lastmodifiedoptHDCnt: 0,
        largedaterangeHDCnt: 0,
        widescopeHDCnt: 0
      };

      return angular.copy(genericStatObject);
    }

    var resetGenericStatCounts = function(statObject) {
      //reset  perf tag counts for each.
      statObject.optimalHSCnt = 0;
      statObject.optimalUnscalableHSCnt = 0;
      statObject.suboptimalUnhealthyHSCnt = 0;
      statObject.suboptimalUnscalableHSCnt = 0;

      //reset  perf tag counts for each.
      statObject.optimalDesignCnt = 0;
      statObject.suboptimalDesignCnt = 0;
      statObject.okScalabilityCnt = 0;
      statObject.warningScalabilityCnt = 0;
      statObject.criticalScalabilityCnt = 0;

      // perf tags count
      statObject.undeindexedHDCnt = 0;
      statObject.wildcardfilterHDCnt = 0;
      statObject.nonselectiveHDCnt = 0;
      statObject.recordskewHDCnt = 0;
      statObject.negativefilterHDCnt = 0;
      statObject.nonoptimizableopHDCnt = 0;
      statObject.lastmodifiedoptHDCnt = 0;
      statObject.largedaterangeHDCnt = 0;
      statObject.widescopeHDCnt = 0;
    };


    var isReport = function(targetType) {
      return ('Report' === targetType);
    }

    return {
      genericPerfStats: genericPerfStats,
      resetGenericStatCounts: resetGenericStatCounts,
      isReport: isReport,
      updateTotalWarningCount: updateTotalWarningCount,
      loadReportScopeData: loadReportScopeData,
      defineGoButtonAction : defineGoButtonAction,
      ensureUserAppContext : ensureUserAppContext,
      fixhashinURL : fixhashinURL,
      sortByHealthScore : sortByHealthScore

    };

  })
  .factory('httpReqFactory', function() {
    return {
      promisifyReq: function($http, urlEndPoint, params, additionalData) {
        //construct the request data map
        var postData = {};
        postData.sessionId = params.access_token;
        postData.instanceUrl = params.instance_url;


        if (additionalData) {
          for (var datumKey in additionalData) {
            if ({}.hasOwnProperty.call(additionalData, datumKey)) {
              postData[datumKey] = additionalData[datumKey];
            }
          }
        }

        var request = {
          method: "POST",
          url: urlEndPoint,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: $.param(postData)
        };
        // $http returns a promise, which has a then function, which also returns a promise
        var promise = $http(request).then(function(response) {
         // The then function here is an opportunity to modify the response
          // The return value gets picked up by the then in the controller.
          return response.data;
        });
        // Return the promise to the controller
        return promise;
        //return $http(request);
      }
    };
  })
  .factory('dashboardAggFactory', function(ioraServicesFactory) {

      var updateDashboards = function(dashboardRestInfoMap, dashboardInfoMap, reportPerfMap, dashSummaryStats) {
         var perDashboardStats = ioraServicesFactory.genericPerfStats();
         var dashboardSummary = {};

         var dashboardRestArr = [];
          for (var key in dashboardRestInfoMap) {
            if ({}.hasOwnProperty.call(dashboardRestInfoMap, key)) {
              //reset dashboardstats for every dashboard
              perDashboardStats = ioraServicesFactory.genericPerfStats();
              //reset counts for the new object
              ioraServicesFactory.resetGenericStatCounts(perDashboardStats);
              var value = dashboardRestInfoMap[key];
              if (value !== null) {
                var dashboardRestRes = {};
                var queryDashboardResult = dashboardInfoMap[value.generalInfo.Id];
                //populate the rest values in the general section from SOQL query
                value.generalInfo.description = queryDashboardResult.Description;
                value.generalInfo.reportType = queryDashboardResult.Type;
                value.generalInfo.createdByName = queryDashboardResult.CreatedBy.Name;
                value.generalInfo.createdOn = queryDashboardResult.CreatedDate;
                value.generalInfo.lastModifiedByName = queryDashboardResult.LastModifiedBy.Name;
                value.generalInfo.lastModifiedOn = queryDashboardResult.LastModifiedDate;
                value.generalInfo.lastViewedDate = queryDashboardResult.LastViewedDate;
                // a folder name exist
                if (queryDashboardResult.Folder !== null) {
                  value.generalInfo.folderId = queryDashboardResult.Folder.Name;
                }
                // its personal folders
                else {
                  if (queryDashboardResult.LastModifiedById === queryDashboardResult.FolderId) {
                    value.generalInfo.folderId = 'Personal Folder - ' + queryDashboardResult.LastModifiedBy.Name;
                  } else {
                    value.generalInfo.folderId = queryDashboardResult.FolderId;
                  }
                }
                updateDashboardComponents(value.generalInfo.componentInfo, reportPerfMap, perDashboardStats, dashSummaryStats);
                dashboardRestRes.dashboardStats = perDashboardStats;
                dashboardRestRes.dashboardInfo = value;
                dashboardRestArr.push(dashboardRestRes);
              }
            }
          }
          dashboardSummary.dashSummaryStats = dashSummaryStats;
          dashboardSummary.dashDetails = dashboardRestArr;
          return dashboardSummary;
    };

    var _updateMinScoresPerfTags = function(reportPerformance, compValue,minimumScores, perDashboardStats, dashSummaryStats) {
      //execute only if we have a valid perf instance available
      if (reportPerformance) {
        compValue.healthScore=reportPerformance.healthScoreMult1;
        //aggregate design and scalability stats for all components
        _updateDashPerfStats(perDashboardStats, reportPerformance);

        //get the worst health score of all components and store
        if (minimumScores.healthScore < reportPerformance.healthScoreMult1) {
          minimumScores.healthScore = reportPerformance.healthScoreMult1;

          minimumScores.offendingReportId = compValue.componentId;
          minimumScores.offendingReportName = compValue.typeName;
        }

        if (minimumScores.designStatusScore < reportPerformance.designStatusInt) {
          minimumScores.designStatusScore = reportPerformance.designStatusInt;
        }

        if (minimumScores.scalabilityStatusScore < reportPerformance.scalabilityStatusInt) {
          minimumScores.scalabilityStatusScore = reportPerformance.scalabilityStatusInt;
        }



        if (minimumScores.dashboardStatusInt < reportPerformance.perfClassInt) {
          minimumScores.dashboardStatusInt = reportPerformance.perfClassInt;
        }

        _updatePerfTagStats(reportPerformance, perDashboardStats, dashSummaryStats)
      }
    }

    var _updatePerfTagStats = function(reportPerformance, perDashboardStats, dashSummaryStats) {
      //perf tags are aggregated at the report component level.
      var perfTags = reportPerformance.perfTags;
      perDashboardStats.perfTags += perfTags;
      //multiple perf tags
      if (perfTags !== null && perfTags !== undefined && (perfTags.indexOf(',') > -1)) {
        var tagArr = perfTags.split(',');
        for (var tagIndex = 0; tagIndex < tagArr.length; tagIndex++) {

          _updateDashboardStatCounts(tagArr[tagIndex], perDashboardStats, dashSummaryStats);

        } //end of for tags loop
      } //end of multiple perf tags if
      else {
        _updateDashboardStatCounts(perfTags, perDashboardStats, dashSummaryStats);
      }
    }


    var updateDashboardComponents = function(componentRest, reportPerfMap, perDashboardStats, dashSummaryStats) {
      var dashboardReportMap = [];

      var minimumScores = {
        healthScore: -100,
        designStatusScore: -100,
        scalabilityStatusScore: -100,
        leastScalabilityRating : '',
        leastDesignRating : '',
        leastDashboardStatus :'',
        offendingReportId: '',
        offendingReportName: '',
        dashboardStatusInt: -1
      }

      perDashboardStats.perfTags = "";
      angular.forEach(componentRest, function(compValue, compKey) {
        //fetch the report performance stats for the report included.
        var reportPerformance = reportPerfMap[compValue.componentId];

        if (dashboardReportMap[compValue.componentId]) {
          var existingCount = dashboardReportMap[compValue.componentId];
          dashboardReportMap[compValue.componentId] = existingCount + 1;
        } else {
          dashboardReportMap[compValue.componentId] = 1;
        }
        _updateMinScoresPerfTags(reportPerformance, compValue,minimumScores, perDashboardStats, dashSummaryStats);
      }); //end angular forEach component loop

      //set the report performance map to include the report occurrences in Dashboards
      for (var dashReportKey in dashboardReportMap) {
        if ({}.hasOwnProperty.call(dashboardReportMap, dashReportKey)) {
          var dashReportvalue = dashboardReportMap[dashReportKey];
          //get the report performance Map
          var reportPerfInstance = reportPerfMap[dashReportKey];
          if (reportPerfInstance) {
            reportPerfInstance.noOfDashboardReferences = dashReportvalue;
          }
        }
      }

      //update the dashboard health status based on its components
      _updateDashPerfSummary(minimumScores.dashboardStatusInt, minimumScores.designStatusScore, minimumScores.scalabilityStatusScore, perDashboardStats, dashSummaryStats, minimumScores.healthScore, minimumScores.offendingReportId, minimumScores.offendingReportName);

    };

    var _updatePerfStatsCount=function(perfObject,perfType,dimension){
      var countProperty=dimension + perfType + 'Cnt';
      perfObject[countProperty]++;
    }

    var _updateDashPerfStats = function(perDashboardStats, reportPerformance) {
       if(reportPerformance.designStatus)
          _updatePerfStatsCount(perDashboardStats,'Design',reportPerformance.designStatus.toLowerCase());
      if(reportPerformance.scalabilityStatus)
          _updatePerfStatsCount(perDashboardStats,'Scalability',reportPerformance.scalabilityStatus.toLowerCase());
    };

    var _updatePerfStatusClass=function(object,type,statusValue,classValue,perfSummary){
      var statusProperty=type + 'Status';
      var classProperty= type + 'StatusClass';
      object[statusProperty]=statusValue;
      object[classProperty]=classValue;
      if(perfSummary)
      {
        object['perfSummary']=perfSummary;
      }
    }

    var _updateDesignScoreSummary = function(designStatusScore, dashSummaryStats, perDashboardStats) {
      switch (designStatusScore) {
        case 0:
          _updatePerfStatsCount(dashSummaryStats,'Design','optimal');
          _updatePerfStatusClass(perDashboardStats,'design','Optimal','success',null);
           break;
        case 1:
          _updatePerfStatsCount(dashSummaryStats,'Design','suboptimal');
          _updatePerfStatusClass(perDashboardStats,'design','Suboptimal','danger',null);
          break;
      }
    }

    var _updateScalabilityScoreSummary = function(scalabilityStatusScore, dashSummaryStats, perDashboardStats) {
      switch (scalabilityStatusScore) {
        case 0:
          _updatePerfStatsCount(dashSummaryStats,'Scalability','ok');
          _updatePerfStatusClass(perDashboardStats,'scalability','OK','success',null);
           break;
        case 1:
          _updatePerfStatsCount(dashSummaryStats,'Scalability','warning');
          _updatePerfStatusClass(perDashboardStats,'scalability','Warning','warning',null);
          break;
        case 2:
          _updatePerfStatsCount(dashSummaryStats,'Scalability','critical');
          _updatePerfStatusClass(perDashboardStats,'scalability','Critical','danger',null)
           break;

      }
    }

    var _updatedashboardStatsSummary = function(dashboardStatusInt, dashSummaryStats, perDashboardStats) {
      switch (dashboardStatusInt) {
        case 1:
          _updatePerfStatsCount(dashSummaryStats,'HS','optimal');
          _updatePerfStatusClass(perDashboardStats,'health','Optimal','success','<p>Uses an index (or similar means) to find target records, which is optimal. No tuning is recommended.</p>');

          break;
        case 2:
          _updatePerfStatsCount(dashSummaryStats,'HS','optimalUnscalable');
          _updatePerfStatusClass(perDashboardStats,'health','Optimal, Unscalable','warning','<p> Performs a full object scan of a small object to find the target records. No tuning is recommended at this time, which may change if the object grows to contain many records.</p>');

          break;
        case 3:
           _updatePerfStatsCount(dashSummaryStats,'HS','suboptimalUnscalable');
           _updatePerfStatusClass(perDashboardStats,'health','Suboptimal, Unscalable','warning','<p> Performs a full object scan of a medium-sized object to find the target records. If this object grows larger, users can expect slow response times and admins can expect excessive use of system resources that possibly detract from other concurrent org operations.</p><p>Tuning this component is a second-level priority using the recommendations on the Tuning Advisor.</p>');

          break;
        case 4:
          _updatePerfStatsCount(dashSummaryStats,'HS','suboptimalUnhealthy');
          _updatePerfStatusClass(perDashboardStats,'health','Suboptimal, Unhealthy','danger','<p> Performs a full object scan of a large object to find the target records. Users can expect slow response times. Admins can expect excessive use of system resources that possibly detract from other concurrent org operations.</p><p>Tuning this component in a top priority using the recommendations on the Tuning Advisor.</p>');
          break;
      }
    }


    var _updateDashPerfSummary = function(dashboardStatusInt, designStatusScore, scalabilityStatusScore, perDashboardStats, dashSummaryStats, healthScore, offendingReportId, offendingReportName) {
      perDashboardStats.healthScore = healthScore;
      perDashboardStats.offendingReportId = offendingReportId;
      perDashboardStats.offendingReportName = offendingReportName;

      _updateDesignScoreSummary(designStatusScore, dashSummaryStats, perDashboardStats);
      _updateScalabilityScoreSummary(scalabilityStatusScore, dashSummaryStats, perDashboardStats);
      _updatedashboardStatsSummary(dashboardStatusInt, dashSummaryStats, perDashboardStats);
    };


    var _updateDashboardStatCounts = function(tagName, perDashboardStats, dashSummaryStats) {
      //create a map for tagName and stats to be updated
      var tagNameStatsMap =
         { 'NON_SELECTIVE': 'nonselectiveHDCnt',
           'RECORD_SKEW': 'recordskewHDCnt' ,
           'UNINDEXED': 'undeindexedHDCnt',
           'LEADING_WILDCARD_FILTER' : 'wildcardfilterHDCnt',
           'NEGATIVE_FILTER' : 'negativefilterHDCnt',
           'NON_OPTIMIZABLE' : 'nonoptimizableopHDCnt',
           'LST_MDFIED' : 'lastmodifiedoptHDCnt',
           'LG_DT_RNG_FILTER' : 'largedaterangeHDCnt',
           'WDE_SPE_FILTER' : 'widescopeHDCnt'
        }

      var propertyName = tagNameStatsMap[tagName];
      //update dashSummaryStats and dashboardStats
      dashSummaryStats[propertyName]++;
      perDashboardStats[propertyName]++;
    };
    return {
      updateDashboards: updateDashboards
    };

  })
  .factory('reportAggFactory', function() {

    var _initializeHealthScores = function(object, healthScoreProperty) {
      if (!object[healthScoreProperty]) {
        object[healthScoreProperty] = -100;
      }
    }

    return {
      summarizeReports: function(reportResponse, reportPerfMap, reportSummaryStats) {
        var reportsInfo = [];
        //aggregate report Stats
        var indReportStat = reportResponse.reportStats;

        //aggregate design stats
        reportSummaryStats.optimalDesignCnt += indReportStat.optimalDesignCnt;
        reportSummaryStats.suboptimalDesignCnt += indReportStat.suboptimalDesignCnt;

        //aggregate scalability stats
        reportSummaryStats.criticalScalabilityCnt += indReportStat.criticalScalabilityCnt;
        reportSummaryStats.warningScalabilityCnt += indReportStat.warningScalabilityCnt;
        reportSummaryStats.okScalabilityCnt += indReportStat.okScalabilityCnt;

        reportSummaryStats.optimalHSCnt += indReportStat.optimalHSCnt;
        reportSummaryStats.optimalUnscalableHSCnt += indReportStat.optimalUnscalableHSCnt;
        reportSummaryStats.suboptimalUnhealthyHSCnt += indReportStat.suboptimalUnhealthyHSCnt;
        reportSummaryStats.suboptimalUnscalableHSCnt += indReportStat.suboptimalUnscalableHSCnt;

        reportSummaryStats.undeindexedHDCnt += indReportStat.undeindexedHDCnt;
        reportSummaryStats.wildcardfilterHDCnt += indReportStat.wildcardfilterHDCnt;
        reportSummaryStats.nonselectiveHDCnt += indReportStat.nonselectiveHDCnt;
        reportSummaryStats.recordskewHDCnt += indReportStat.recordskewHDCnt;
        reportSummaryStats.negativefilterHDCnt += indReportStat.negativefilterHDCnt;
        reportSummaryStats.nonoptimizableopHDCnt += indReportStat.nonoptimizableopHDCnt;
        reportSummaryStats.lastmodifiedoptHDCnt += indReportStat.lastmodifiedoptHDCnt;
        reportSummaryStats.largedaterangeHDCnt += indReportStat.largedaterangeHDCnt;
        reportSummaryStats.widescopeHDCnt += indReportStat.widescopeHDCnt;

        var indReportInfos = reportResponse.reportsInfo;
        angular.forEach(indReportInfos, function(indReportInfo) {

          if (indReportInfo !== null && indReportInfo !== undefined) {

            _initializeHealthScores(indReportInfo.reportPerformance, 'healthScore');
            _initializeHealthScores(indReportInfo.reportPerformance, 'healthScoreMult3');
            _initializeHealthScores(indReportInfo.reportPerformance, 'healthScoreMult4');
            _initializeHealthScores(indReportInfo.reportPerformance, 'healthScoreMult5');

            reportPerfMap[indReportInfo.generalInfo.Id] = indReportInfo.reportPerformance;
            reportsInfo.push(indReportInfo);
          }
        });
        return reportsInfo;
      }
    };
  });
