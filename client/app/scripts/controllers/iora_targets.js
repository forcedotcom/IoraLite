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
 * @name ioraliteAngularApp.controller:IoraTargetsCtrl
 * @description
 * # IoraTargetsCtrl
 * Controller of the ioraliteAngularApp
 */
angular.module('ioraliteAngularApp')
  .controller('IoraTargetsCtrl', function($scope, _, $filter, $localStorage, $location, $timeout, ioraReportFactory, ioraDashboardFactory, userInfoFactory, ioraInitFactory, ioraServicesFactory, orgOverviewChartFactory, orgDetailChartFactory, orgDrillDownChartFactory, chartSelectionFactory) {

    var _initializeChartFilter = function($scope) {
      $scope.chartFilter = {
        dataSize: {
          name: 'Top 25',
          value: 25,
          text: 'twenty five'
        },
        scalability: {
          name: 'Critical',
          value: 'Critical'
        },
        design: {
          name: 'Suboptimal',
          value: 'Suboptimal'
        },
        dimension: {
          name: 'User',
          value: 'User'
        },
        order: {
          name: 'Cost',
          value: 'Cost %',
          lowercase: 'cost '
        },
        groupSmallerBars: false
      };
    }


    var _loadPropertiestoArray = function(arrayObj, nameText, valueText, additionalProperties) {
      if(!arrayObj)
         arrayObj = [];
      //additional properties defined. lets' add other properties to the same object
      if (additionalProperties) {
        additionalProperties.name = nameText;
        additionalProperties.value = valueText;
      } else {
        additionalProperties = {
          name: nameText,
          value: valueText
        };
      }
       arrayObj.push(additionalProperties);
    }

    var _setChartOptionsToScope = function(reportByDimensions, dimensionOptions, chartDimensions, otherBlocks, groupSmallerBars, chartFilterDimension, chartFilterOrder) {
      $scope.reportByDimensions = reportByDimensions;
      $scope.dimensionOptions = dimensionOptions;

      $scope.chartDimensions = chartDimensions;
      $scope.hasDimensions = $scope.chartDimensions.length > 0;


      $scope.noOfOtherBlocks = otherBlocks;
      $scope.hasOtherBlock = otherBlocks > 0;

      $scope.chartFilter.groupSmallerBars = groupSmallerBars;
      $scope.chartFilter.dimension = chartFilterDimension;
      $scope.chartFilter.order = chartFilterOrder;

    }

    var _populateRptDashScopeVars = function(dataObj, statsObj, pluralLabel, singularLabel, isReport) {
      $scope.summaryStats = statsObj;
      restData = dataObj;
      $scope.targetTypes = pluralLabel;
      $scope.targetType = singularLabel;
      $scope.lowerCaseTarget = singularLabel.toLowerCase();
      $scope.lowerCaseTargets = pluralLabel.toLowerCase();

      $scope.isReportPage = isReport;
      $scope.isDashboardPage = !isReport;
    }

    var _loadUIFilterOptions = function($scope) {
      _loadPropertiestoArray($scope.orderOptions, 'Count', 'Count', {
        lowercase: 'count'
      });
      _loadPropertiestoArray($scope.orderOptions, 'Cost', 'Cost %', {
        lowercase: 'cost'
      });

      _loadPropertiestoArray($scope.dataSizeOptions, 'Top 10', 10, {
        text: 'ten'
      });
      _loadPropertiestoArray($scope.dataSizeOptions, 'Top 25', 25, {
        text: 'twenty five'
      });
      _loadPropertiestoArray($scope.dataSizeOptions, 'Top 50', 50, {
        text: 'fifty'
      });
      _loadPropertiestoArray($scope.dataSizeOptions, 'All', '*', {
        text: 'fifty'
      });

      _loadPropertiestoArray($scope.scalabilityStatuses, 'Critical', 'Critical');
      _loadPropertiestoArray($scope.scalabilityStatuses, 'Warning', 'Warning');
      _loadPropertiestoArray($scope.scalabilityStatuses, 'OK', 'OK');
      _loadPropertiestoArray($scope.scalabilityStatuses, 'All', '*');

      _loadPropertiestoArray($scope.designStatuses, 'Optimal', 'Optimal');
      _loadPropertiestoArray($scope.designStatuses, 'Suboptimal', 'Suboptimal');
      _loadPropertiestoArray($scope.designStatuses, 'All', '*');
    }

    var _initializer=function($scope){
      ioraInitFactory.pageLoad($scope);
      //variable to store the drill down states as the user navigates the charts.
      $scope.drillDownStates = [];
      //variable that sets, if the update charts are called by navigating up one level or user changes
      $scope.isFilterUpdated = true;
      //variable to tell if chart dimensions are applicable in current context.
      $scope.hasDimensions = true;
      //variable to store the current drill down level.
      $scope.currentDrillDownLevel = 0;
      //variable to store user selections in all levels (3) for drill down charts.
      $scope.userSelections = [];
      //variable to store the ui options
      $scope.orderOptions = [];
      $scope.dataSizeOptions = [];
      $scope.scalabilityStatuses = [];
      $scope.designStatuses = [];
    }

    var restData;
    _initializer($scope);

    _loadUIFilterOptions($scope);
    if(!$scope.chartFilter)
       _initializeChartFilter($scope);

    //load chart selection and see, if a true value exists.
    var preselectedChartFilter = chartSelectionFactory.get();

    if (preselectedChartFilter !== null && preselectedChartFilter !== undefined && preselectedChartFilter.dataSize !== null && preselectedChartFilter.dataSize !== undefined) {
      $scope.chartFilter = preselectedChartFilter.chartFilter;
    }

    var queryParams = $location.search();
    var rptDimensionsObject;

    var isReportTarget = (queryParams.target === 'reports');

    if (isReportTarget) {
      _populateRptDashScopeVars($scope.ioraReportRest.reportDetails, $scope.ioraReportRest.reportSummaryStats, 'Reports', 'Report', isReportTarget);
    } else if (queryParams.target === 'dashboards') {
      _populateRptDashScopeVars($scope.ioraDashboardRest.dashDetails, $scope.ioraDashboardRest.dashSummaryStats, 'Dashboards', 'Dashboard', isReportTarget);
    }

    $scope.chartDimensions = orgDetailChartFactory.level1ChartDimensions($scope.targetType);

    $scope.upOneLevel = function() {
      //set the filter updated flag to false.
      $scope.isFilterUpdated = false;
      //reduce current drill down level, if not at the top.
      if ($scope.currentDrillDownLevel > 0) {
        $scope.currentDrillDownLevel -= 1;
        $scope.isDrillDown = true;
      }

      //at the top level.
      if ($scope.currentDrillDownLevel === 0) {
        //set drill down to false.
        $scope.isDrillDown = false;
      }

      //call the update dimension chart method.
      $scope.updateDimesionChart();
    };


    $scope.$on('chart-updated', function(event, chartObj, chartOptions, dimensionOptions, selectedDimension, isDrillDown, drillDownLevel, drillDownState) {
      //set the passed drill down state to the scope variable.
      $scope.drillDownStates[drillDownLevel] = drillDownState;
      $scope.currentDrillDownLevel = drillDownLevel;
      $scope.isDrillDown = isDrillDown;

      _setChartOptionsToScope(chartObj, chartOptions, dimensionOptions, drillDownState.hiddenCount, drillDownState.groupBars, selectedDimension, drillDownState.order);

      $scope.$apply();
      // profileObj contains; name, country and email from emitted event
    });

    //method to update the dimension chart based on selection changes
    $scope.updateDimesionChart = function() {
      $scope.filteredDataSet = _dataSetWithFilters($scope.targetType);

      var currentDrillDownState = $scope.drillDownStates[$scope.currentDrillDownLevel]; //get the current drill down state.



      //check user updated filters, if so update the drill down setting for the level.
      if($scope.isFilterUpdated){
        if (currentDrillDownState !== null && currentDrillDownState !== undefined) {
          currentDrillDownState.dimensionName = $scope.chartFilter.dimension.name;
          currentDrillDownState.groupBars = $scope.chartFilter.groupSmallerBars;
          currentDrillDownState.hiddenCount = $scope.noOfOtherBlocks;
          currentDrillDownState.order = $scope.chartFilter.order;
          $scope.drillDownStates[$scope.currentDrillDownLevel] = currentDrillDownState;
        }
      }
      else{
        $scope.isFilterUpdated = true; // set the filter as updated for future invocations
      }

      //invoke drill down chart methods
      if ($scope.isDrillDown) {
        //read the drilldown data based on current drill down level.

        var detailChart = orgDrillDownChartFactory.buildDetailDimensionChart($scope, currentDrillDownState.parentDimensionName, $scope.filteredDataSet, currentDrillDownState.selectedEntity, currentDrillDownState.dimensionName, $scope.targetType, $scope.lowerCaseTargets);
        //set the chart options.
        _setChartOptionsToScope(detailChart.chartData, detailChart.chartOptions, detailChart.dimensions, currentDrillDownState.hiddenCount, currentDrillDownState.groupBars, detailChart.selectedDimension, currentDrillDownState.order);

      }
      //invoke top level chart draws
      else if (currentDrillDownState !== null && currentDrillDownState !== undefined) {
        //user dimension
        rptDimensionsObject = orgDetailChartFactory.reportDimensionChart(
          currentDrillDownState.dimensionName, $scope.filteredDataSet, currentDrillDownState.groupBars, $scope.targetType, currentDrillDownState.order
        );
        //set the scope variables

        var selectedDimension = {
          name: currentDrillDownState.dimensionName,
          value: currentDrillDownState.dimensionName
        };
        //set appropriate chart dimensions
        _setChartOptionsToScope(rptDimensionsObject.chartData, orgDetailChartFactory.defineDimensionChartOptions($scope), orgDetailChartFactory.level1ChartDimensions($scope.targetType), rptDimensionsObject.noOfOtherBlocks, rptDimensionsObject.hasOtherBlock, selectedDimension, currentDrillDownState.order);

        //rest current drill down states as the user has navigated back to root.
        currentDrillDownState = null;
        $scope.drillDownStates = [];
      }
      //user never drill down and is playing with options at root level.
      else {

        $scope.dimensionOptions = orgDetailChartFactory.defineDimensionChartOptions($scope);

        //user dimension
        rptDimensionsObject = orgDetailChartFactory.reportDimensionChart(
          $scope.chartFilter.dimension.name, $scope.filteredDataSet, $scope.chartFilter.groupSmallerBars, $scope.targetType, $scope.chartFilter.order
        );
        //set the scope variables

        $scope.reportByDimensions = rptDimensionsObject.chartData;
        $scope.chartFilter.groupSmallerBars = rptDimensionsObject.hasOtherBlock;
        $scope.hasOtherBlock = rptDimensionsObject.noOfOtherBlocks > 0;
        $scope.noOfOtherBlocks = rptDimensionsObject.noOfOtherBlocks;

      }
    };


    $scope.updateChart = function() {

      var targetDataSet = _dataSetWithFilters($scope.targetType);
      //set the last filtered data set to scope
      $scope.filteredDataSet = targetDataSet;
      $scope.options = orgDetailChartFactory.defineDetailChartOptions();
      $scope.topReportConcerns = orgDetailChartFactory.reportDetailChart($scope.chartFilter.dataSize.value, $scope.targetType, targetDataSet);

      $scope.updateDimesionChart();
      updateTargetsPageData(targetDataSet);
    };

    var _checkFilterByType = function(rptPerfObj, $scope, type) {
      return ($scope.chartFilter[type].value === '*' || ($scope.chartFilter[type].value === rptPerfObj[type + 'Status']));
    }

    var _filterData=function(valueProperty){
      return $filter('filter')(restData, function(value, index, array,valueProperty) {
        var perfObj=value[valueProperty];
        return (_checkFilterByType(perfObj, $scope, 'design') && _checkFilterByType(perfObj, $scope, 'scalability'));
      });
    }

    var _dataSetWithFilters = function(targetType) {
      //read the scalability status and design status depending on target selection.
      var targetDataSet;
      //has a specific design value defined

      var valueProperty=(ioraServicesFactory.isReport(targetType))?'reportPerformance':'dashboardStats';

      targetDataSet= $filter('filter')(restData, function(value, index, array) {
        return (_checkFilterByType(value[valueProperty], $scope, 'design') && _checkFilterByType(value[valueProperty], $scope, 'scalability'));
      });
      //filter data based on data size.
      //a top count is selected
      if ($scope.chartFilter.dataSize.value !== '*') {
        var sortedArray=ioraServicesFactory.sortByHealthScore($filter,targetDataSet,targetType);

        var filteredResultSet = [];

        for (var sortedIndex = 0; sortedIndex < $scope.chartFilter.dataSize.value && sortedIndex < sortedArray.length; sortedIndex++) {
          filteredResultSet.push(sortedArray[sortedIndex]);
        }
        targetDataSet = filteredResultSet;
      }
      return targetDataSet;
    };

    $timeout(function() {
      initConfig(document.URL);

      $scope.updateChart();
    }, 1000);
  });
