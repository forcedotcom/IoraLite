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

angular.module('ioraChartServices')
  .factory('orgDrillDownChartFactory', function($filter, $location, $window, _, ioraServicesFactory,orgOverviewChartFactory, orgToolTipServicesFactory) {



    var _computeCostDataPerDimension = function(dimension, userStats) {
      var costsLineData = [];

      //set the data based on dimension
      if ('Observations' === dimension) {

        orgOverviewChartFactory.populateList('label','Non-Selective', 'NON_SELECTIVE', userStats.percentCost.nonselectiveHD.toFixed(2), costsLineData);
        orgOverviewChartFactory.populateList('label','Unindexed', 'UNINDEXED', userStats.percentCost.unindexedHD.toFixed(2), costsLineData);
        orgOverviewChartFactory.populateList('label','Record Skew', 'RECORD_SKEW', userStats.percentCost.recordskewHD.toFixed(2), costsLineData);
        orgOverviewChartFactory.populateList('label','Last Modified', 'LST_MDFIED', userStats.percentCost.lastmodifiedoptHD.toFixed(2), costsLineData);
        orgOverviewChartFactory.populateList('label','Wild Card Filter', 'LEADING_WILDCARD_FILTER', userStats.percentCost.wildcardfilterHD.toFixed(2), costsLineData);
        orgOverviewChartFactory.populateList('label','Negative Filter', 'NEGATIVE_FILTER', userStats.percentCost.negativefilterHD.toFixed(2), costsLineData);
        orgOverviewChartFactory.populateList('label','Large Date Range', 'LG_DT_RNG_FILTER', userStats.percentCost.largedaterangeHD.toFixed(2), costsLineData);
        orgOverviewChartFactory.populateList('label','Wide Scope', 'WDE_SPE_FILTER', userStats.percentCost.widescopeHD.toFixed(2), costsLineData);

      } else if ('Scalability' === dimension) {

        orgOverviewChartFactory.populateList('label','Critical', undefined, userStats.percentCost.criticalScalability.toFixed(2), costsLineData);
        orgOverviewChartFactory.populateList('label','Warning', undefined, userStats.percentCost.warningScalability.toFixed(2), costsLineData);
        orgOverviewChartFactory.populateList('label','OK', undefined, userStats.percentCost.okScalability.toFixed(2), costsLineData);
      } else if ('Design' === dimension) {

        orgOverviewChartFactory.populateList('label','Optimal', undefined, userStats.percentCost.optimalDesign.toFixed(2), costsLineData);
        orgOverviewChartFactory.populateList('label','Suboptimal', undefined, userStats.percentCost.suboptimalDesign.toFixed(2), costsLineData);

      }
      return costsLineData;
    };

    var _computeChartDataPerDimension = function(dimension, userStats) {

      var drillDownChartData = [];

      //set the data based on dimension
      if ('Observations' === dimension) {

        orgOverviewChartFactory.populateList('label','Non-Selective', 'NON_SELECTIVE', userStats.nonselectiveHDCnt, drillDownChartData);
        orgOverviewChartFactory.populateList('label','Unindexed', 'UNINDEXED', userStats.undeindexedHDCnt, drillDownChartData);
        orgOverviewChartFactory.populateList('label','Record Skew', 'RECORD_SKEW', userStats.recordskewHDCnt, drillDownChartData);
        orgOverviewChartFactory.populateList('label','Last Modified', 'LST_MDFIED', userStats.lastmodifiedoptHDCnt, drillDownChartData);
        orgOverviewChartFactory.populateList('label','Wild Card Filter', 'LEADING_WILDCARD_FILTER', userStats.wildcardfilterHDCnt, drillDownChartData);
        orgOverviewChartFactory.populateList('label','Negative Filter', 'NEGATIVE_FILTER', userStats.negativefilterHDCnt, drillDownChartData);
        orgOverviewChartFactory.populateList('label','Large Date Range', 'LG_DT_RNG_FILTER', userStats.largedaterangeHDCnt, drillDownChartData);
        orgOverviewChartFactory.populateList('label','Wide Scope', 'WDE_SPE_FILTER', userStats.widescopeHDCnt, drillDownChartData);

      } else if ('Scalability' === dimension) {

        orgOverviewChartFactory.populateList('label','Critical', undefined, userStats.criticalScalabilityCnt, drillDownChartData);
        orgOverviewChartFactory.populateList('label','Warning', undefined, userStats.warningScalabilityCnt, drillDownChartData);
        orgOverviewChartFactory.populateList('label','OK', undefined, userStats.okScalabilityCnt, drillDownChartData);

      } else if ('Design' === dimension) {

        orgOverviewChartFactory.populateList('label','Optimal', undefined, userStats.optimalDesignCnt, drillDownChartData);
        orgOverviewChartFactory.populateList('label','Suboptimal', undefined, userStats.suboptimalDesignCnt, drillDownChartData);
      }
      return drillDownChartData;

    };



    var _fetchUserData = function(parentDimension, targetType, reportDetailArr, dimensionName) {
      var userData = [];


      userData = $filter('filter')(reportDetailArr, function(value, index, array) {
        var object;
        var uniqueId = parentDimension + "_" + targetType;
        object=orgOverviewChartFactory.fetchAppropriateObj(targetType,value);
        if (object[orgOverviewChartFactory.propertyDimensionMap[uniqueId]] === dimensionName) {
          return true;
        }

      });
      return userData;
    }

    var _computeStatsByDimension=function(performance, userStats, costsByCategory){
       if (performance !== null && performance !== undefined) {
          _computeDesignStats(performance, userStats, costsByCategory);
          _computeScalabilityStats(performance, userStats, costsByCategory);
          _computeObservationStats(performance, userStats, costsByCategory);
      }
    }

    var buildDetailDimensionChart = function($scope, parentDimension, reportDetailArr, dimensionName, dimension, targetType, targetTypes) {
      //if the drill down level is two, call the report drill down method.
      if ($scope.currentDrillDownLevel === 2) {
        var currentDrillDownState = $scope.drillDownStates[$scope.currentDrillDownLevel];

        return showReportsForDrillDown(reportDetailArr, currentDrillDownState.selectedObject, currentDrillDownState.parentDimension, currentDrillDownState.parentDimensionName, $scope.chartFilter.groupSmallerBars, targetType, targetTypes);
      }

      $scope.userData = _fetchUserData(parentDimension, targetType, reportDetailArr, dimensionName);

      //compute the total cost at a user or report type level.
      var totalCost = 0;

      //HD is the naming stands abbreviated for Health Dimension
      var costsByCategory = {
        optimalDesign: 0,
        suboptimalDesign: 0,
        criticalScalability: 0,
        warningScalability: 0,
        okScalability : 0,
        nonselectiveHD: 0,
        unindexedHD: 0,
        recordskewHD: 0,
        wildcardfilterHD: 0,
        negativefilterHD: 0,
        lastmodifiedoptHD: 0,
        largedaterangeHD: 0,
        widescopeHD: 0
      };

      var userStats =  ioraServicesFactory.genericPerfStats();
      userStats.percentCost=angular.copy(costsByCategory);


      for (var userDataIdx = 0; userDataIdx < $scope.userData.length; userDataIdx++) {
        var performance;
        if (ioraServicesFactory.isReport(targetType)) {
          performance = $scope.userData[userDataIdx].reportPerformance;
          totalCost += performance.healthScoreMult1;
        } else {
          performance = $scope.userData[userDataIdx].dashboardStats;
          totalCost += performance.healthScore
        }
         _computeStatsByDimension(performance, userStats, costsByCategory);
      }


      _computeCostContribution(userStats, costsByCategory, totalCost);

      //default to Observations, if nothing is passed.
      if (dimension === null || dimension === undefined) {
        dimension = 'Observations';
      }

      var detailDimensions = _computeChartDataPerDimension(dimension, userStats);

      var costDimensions = _computeCostDataPerDimension(dimension, userStats);

      var chartData = [{
        "key": "Cost Contribution(%)",

        "color": "darkorange",
        "values": costDimensions
      }, {
        "key": "Observation Count",
        "color": "#dc3912",
        "values": detailDimensions
      }];

      //create an object to rebuild the detail chart
      var detailChart = {};
      detailChart.chartData = chartData;
      detailChart.dimensions = _level2ChartDimensions();
      detailChart.isDrillDown = true;
      detailChart.chartOptions = _defineDetailDimensionChartOptions($scope, dimensionName, dimension);
      detailChart.selectedDimension = {
        name: dimension,
        value: dimension
      };

      return detailChart;
    };

    var _computeCostContribution = function(userStats, costsByCategory, totalCost) {
      //design
      userStats.percentCost.optimalDesign = (costsByCategory.optimalDesign / totalCost) * 100;
      userStats.percentCost.suboptimalDesign = (costsByCategory.suboptimalDesign / totalCost) * 100;
      //Scalability
      userStats.percentCost.criticalScalability = (costsByCategory.criticalScalability / totalCost) * 100;
      userStats.percentCost.warningScalability = (costsByCategory.warningScalability / totalCost) * 100;
      userStats.percentCost.okScalability = (costsByCategory.okScalability / totalCost) * 100;

      //filters / health dimension
      userStats.percentCost.nonselectiveHD = (costsByCategory.nonselectiveHD / totalCost) * 100;
      userStats.percentCost.unindexedHD = (costsByCategory.unindexedHD / totalCost) * 100;
      userStats.percentCost.recordskewHD = (costsByCategory.recordskewHD / totalCost) * 100;
      userStats.percentCost.wildcardfilterHD = (costsByCategory.wildcardfilterHD / totalCost) * 100;
      userStats.percentCost.negativefilterHD = (costsByCategory.negativefilterHD / totalCost) * 100;
      userStats.percentCost.lastmodifiedoptHD = (costsByCategory.lastmodifiedoptHD / totalCost) * 100;
      userStats.percentCost.largedaterangeHD = (costsByCategory.largedaterangeHD / totalCost) * 100;
      userStats.percentCost.widescopeHD = (costsByCategory.widescopeHD / totalCost) * 100;

    };


    var _defineDetailDimensionChartOptions = function($scope, dimensionName, dimension) {
      var _tmpChartOptions = orgOverviewChartFactory.templateChartOptions();
      _tmpChartOptions.title.text = dimension + ' assessment for ' + dimensionName;
      _tmpChartOptions.subtitle.text = "Hover for summary, click for details";
      _tmpChartOptions.chart.showXAxis = true;
      _tmpChartOptions.chart.showLegend = true;
      _tmpChartOptions.chart.showYAxis = true;
      _tmpChartOptions.chart.yAxis.axisLabel = '';
      _tmpChartOptions.chart.showValues = true;
    //  _tmpChartOptions.chart.reduceXTicks = true;
      _tmpChartOptions.chart.multibar = {};
      _tmpChartOptions.chart.multibar.dispatch = {};
      _tmpChartOptions.chart.multibar.dispatch.elementClick = function(e) {
        var reportsForDrillDown = showReportsForDrillDown($scope.userData, e.data, dimension, dimensionName, $scope.groupSmallerBars, $scope.targetType, $scope.lowerCaseTargets);

        //send the state for future drill downs.
        var drillDownState = {
          drillDownLevel: 2,
          parentDimensionName: dimensionName,
          parentDimension: dimension,
          selectedEntity: e.data.label,
          selectedObject: e.data,
          dimensionName: $scope.chartFilter.dimension.name,
          parentHiddenCount: $scope.noOfOtherBlocks,
          parentGroupBars: $scope.chartFilter.groupSmallerBars,
          hiddenCount: reportsForDrillDown.hiddenCount,
          groupBars: reportsForDrillDown.groupBars //default dimension name, on click from a user/report type.
        };
        orgOverviewChartFactory.emitChartUpdateEvent($scope,reportsForDrillDown,drillDownState);

      };
      return _tmpChartOptions;

    };

    var _level2ChartDimensions = function() {
      var level2Dmns = [];
      orgOverviewChartFactory.populateList('name','Design',undefined,'Design',level2Dmns);
      orgOverviewChartFactory.populateList('name','Scalability',undefined,'Scalability',level2Dmns);
      orgOverviewChartFactory.populateList('name','Observations',undefined,'Observations',level2Dmns);
      return level2Dmns;
    };

    var _updatePerfStatsCosts = function(statusType, statusName, statsProperty, costProperty, reportPerf, userStats, costsByCategory) {
      if (reportPerf[statusType] === statusName) {
        userStats[statsProperty]++;
        costsByCategory[costProperty] += reportPerf.healthScoreMult1;
      }
    }

    var _computeDesignStats = function(reportPerf, userStats, costsByCategory) {
      _updatePerfStatsCosts('designStatus', 'Optimal', 'optimalDesignCnt', 'optimalDesign', reportPerf, userStats, costsByCategory);
      _updatePerfStatsCosts('designStatus', 'Suboptimal', 'suboptimalDesignCnt', 'suboptimalDesign', reportPerf, userStats, costsByCategory);
    };

    var _computeScalabilityStats = function(reportPerf, userStats, costsByCategory) {
      _updatePerfStatsCosts('scalabilityStatus', 'Critical', 'criticalScalabilityCnt', 'criticalScalability', reportPerf, userStats, costsByCategory);
      _updatePerfStatsCosts('scalabilityStatus', 'Warning', 'warningScalabilityCnt', 'warningScalability', reportPerf, userStats, costsByCategory);
      _updatePerfStatsCosts('scalabilityStatus', 'OK', 'okScalabilityCnt', 'okScalability', reportPerf, userStats, costsByCategory);
    };

    var _updateStatsByTag = function(tags, tagName, userStatsName, userStats, costsByCategoryName, costsByCategory, cost) {
      if ((tags.indexOf(tagName)) !== -1) {
        userStats[userStatsName]++;
        costsByCategory[costsByCategoryName] += cost
      }
    }

    var _computeObservationStats = function(reportPerf, userStats, costsByCategory) {
      var tags = reportPerf.perfTags;


      if (tags !== null && tags !== undefined && tags.length > 0) {
        _updateStatsByTag(tags, 'NON_SELECTIVE', 'nonselectiveHDCnt', userStats, 'nonselectiveHD', costsByCategory, reportPerf.healthScoreMult1);

        _updateStatsByTag(tags, 'UNINDEXED', 'undeindexedHDCnt', userStats, 'unindexedHD', costsByCategory, reportPerf.healthScoreMult1);

        _updateStatsByTag(tags, 'RECORD_SKEW', 'recordskewHDCnt', userStats, 'recordskewHD', costsByCategory, reportPerf.healthScoreMult1);

        _updateStatsByTag(tags, 'LEADING_WILDCARD_FILTER', 'wildcardfilterHDCnt', userStats, 'wildcardfilterHD', costsByCategory, reportPerf.healthScoreMult1);

        _updateStatsByTag(tags, 'NEGATIVE_FILTER', 'negativefilterHDCnt', userStats, 'negativefilterHD', costsByCategory, reportPerf.healthScoreMult1);

        _updateStatsByTag(tags, 'LST_MDFIED', 'lastmodifiedoptHDCnt', userStats, 'lastmodifiedoptHD', costsByCategory, reportPerf.healthScoreMult1);

        _updateStatsByTag(tags, 'LG_DT_RNG_FILTER', 'largedaterangeHDCnt', userStats, 'largedaterangeHD', costsByCategory, reportPerf.healthScoreMult1);

        _updateStatsByTag(tags, 'WDE_SPE_FILTER', 'widescopeHDCnt', userStats, 'widescopeHD', costsByCategory, reportPerf.healthScoreMult1);
      }

    };


    var _buildOtherBarData = function(dataArr) {

      var otherBarChart = {};
      var otherChartData = [];
      var noOfAddedRpts = 0;
      var otherValCount = 0;

      for (var otherBarIndex = 0; otherBarIndex < dataArr.length; otherBarIndex++) {
        if (noOfAddedRpts >= 10) {
          otherValCount += dataArr[otherBarIndex].value;
        } else {
          orgOverviewChartFactory.populateList('label',dataArr[otherBarIndex].label, dataArr[otherBarIndex].apiName, dataArr[otherBarIndex].value, otherChartData);
        }
        noOfAddedRpts++;
      }
       orgOverviewChartFactory.populateOtherBarChart(otherValCount,otherChartData,otherBarChart);
       return otherBarChart;
    };

    var _findInterestedRptDashboard = function(dataSet, selectedEntity, selectedDimension, targetType) {
      var perfObject;
      var healthScore;
      var sortedEntity;

      if (ioraServicesFactory.isReport(targetType)) {
        healthScore = 'reportPerformance.healthScoreMult1';
      } else {
        healthScore = 'dashboardStats.healthScore';
      }

      var interestedEntities = $filter('filter')(dataSet, function(value, index, array) {

        if (ioraServicesFactory.isReport(targetType)) {
          perfObject = value.reportPerformance;
        } else {
          perfObject = value.dashboardStats;
        }

        if ('Design' === selectedDimension && perfObject.designStatus === selectedEntity.label) {
          return true;
        } else if ('Scalability' === selectedDimension && perfObject.scalabilityStatus === selectedEntity.label) {
          return true;
        } else if ('Observations' === selectedDimension && perfObject.perfTags !== null && perfObject.perfTags !== undefined && perfObject.perfTags.indexOf(selectedEntity.apiName) !== -1) {
          return true;
        }
      });
      sortedEntity = $filter('orderBy')(interestedEntities, healthScore, true);
      return sortedEntity;

    }




    var showReportsForDrillDown = function(dataSet, selectedEntity, selectedDimension, parentDimension, groupSmallerBars, targetType, targetTypes) {

      var reportsForDrillDown = {};
      var sortedEntity;

      sortedEntity = _findInterestedRptDashboard(dataSet, selectedEntity, selectedDimension, targetType);

      var drillDownReports = orgOverviewChartFactory.populateChartData(sortedEntity,null,targetType);

      var chartOptions = orgOverviewChartFactory.definedChartOptionsTemplate('placeHolder', 'placeHolder', './Iora_Target?target=');
      //update the fields relevant to the current chart.
      chartOptions.title.text = selectedEntity.label + ' ' + targetTypes + '  for ' + parentDimension;
      chartOptions.subtitle.text = 'Hover for summary, click for details';

      reportsForDrillDown.chartOptions = chartOptions;
      reportsForDrillDown.isDrillDown = true;
      reportsForDrillDown.dimensions = []; //no chart dimensions necessary
      reportsForDrillDown.selectedDimension = {}; //no applicable chart dimension.

      if (groupSmallerBars) {
        var otherChartData = _buildOtherBarData(drillDownReports);
        reportsForDrillDown.chartData = [{
          "key": targetType + " Id ",
          "color": "#dc3912",
          "values": otherChartData.labelValues
        }];
        reportsForDrillDown.hasOtherBlock = otherChartData.hasOtherBlock;
        reportsForDrillDown.noOfOtherBlocks = otherChartData.noOfOtherBlocks;
      } else {
        reportsForDrillDown.chartData = [{
          "key": targetType + " Id ",
          "color": "#dc3912",
          "values": drillDownReports
        }];
        reportsForDrillDown.hasOtherBlock = false;
        reportsForDrillDown.noOfOtherBlocks = 0;

      }

      return reportsForDrillDown;

    };




    return {
      buildDetailDimensionChart: buildDetailDimensionChart,
      showReportsForDrillDown: showReportsForDrillDown
    };

  });
