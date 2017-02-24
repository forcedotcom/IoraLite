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
  .factory('orgDetailChartFactory', function($filter, $location, $window, _,ioraServicesFactory,orgOverviewChartFactory, orgDrillDownChartFactory, orgToolTipServicesFactory) {

    var dashboardDetailChart = function(components) {

      var dashComponents = [];
      var dashDetailChart = {};

      for (var componentIdx = 0; componentIdx < components.length; componentIdx++) {
        orgOverviewChartFactory.populateList('label', components[componentIdx].componentId, components[componentIdx].typeName, components[componentIdx].healthScore, dashComponents);
      }

      var sortedDashComponents = $filter('orderBy')(dashComponents, "value", true);

      var c10 = d3.scale.category20c();


      dashDetailChart.chartData = [{
        "key": "Component ID",
        "color": "#dc3912",
        "values": sortedDashComponents
      }];

      var dashDetailChartOptions = orgOverviewChartFactory.definedChartOptionsTemplate('Potential tuning candidates', 'Hover for summary, click for details', './Iora_Target?target=');
      //update title
      dashDetailChartOptions.title.text = 'Dashboard components by cost';
      dashDetailChartOptions.subtitle.text = 'Hover for summary, click for details';

      dashDetailChartOptions.chart.tooltip = {};
      dashDetailChartOptions.chart.tooltip.contentGenerator = function(d) {
        return orgToolTipServicesFactory.customizeMiniTooltip(d);
      };

      dashDetailChart.chartOptions = dashDetailChartOptions;
      return dashDetailChart;

    };

    var defineDetailChartOptions=function(){
      return (orgOverviewChartFactory.definedChartOptionsTemplate('Potential tuning candidates', 'Hover for summary, click for details', './Iora_Target?target='));
    }

    var _groupEntities = function(selectedDimension, reportDetailArr, _, targetType) {
      var object;
      var uniqueId = selectedDimension + "_" + targetType;

      return _.groupBy(reportDetailArr, function(obj) {
        object=orgOverviewChartFactory.fetchAppropriateObj(targetType,obj);
        return object[orgOverviewChartFactory.propertyDimensionMap[uniqueId]];
      });
    }

    var reportDimensionChart = function(selectedDimension, reportDetailArr, groupSmallerBars, targetType, order) {

      if (reportDetailArr === null || reportDetailArr === undefined || reportDetailArr.length === 0) {
        var emptyChart = [];
        emptyChart.hasOtherBlock = false;
        emptyChart.noOfOtherBlocks = 0;
        emptyChart.chartData = [];
        return emptyChart;
      }

      var totalCost = 0;

      var isOrderByCost = (order !== null && order !== undefined && 'Cost' === order.name);

      if(isOrderByCost){
        totalCost=orgOverviewChartFactory.computeTotalCost(reportDetailArr, targetType);
      }


      var groups = _groupEntities(selectedDimension, reportDetailArr, _, targetType);
      return _buildDimensionChart(groups, reportDetailArr, groupSmallerBars, targetType, totalCost, order);
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
          orgOverviewChartFactory.populateList('label', dataArr[otherBarIndex].label, undefined, dataArr[otherBarIndex].value, otherChartData);
        }
        noOfAddedRpts++;
      }
      orgOverviewChartFactory.populateOtherBarChart(otherValCount, otherChartData, otherBarChart);
      return otherBarChart;
    };


    var level1ChartDimensions = function(targetType) {

      var level1Dmns = [];
      //populate the values into level1Dmns list
      orgOverviewChartFactory.populateList('name', 'User', undefined, 'User', level1Dmns);
      if(ioraServicesFactory.isReport(targetType)){
        orgOverviewChartFactory.populateList('name', 'Report Type', undefined, 'Report Type', level1Dmns);
      }
      else{
        orgOverviewChartFactory.populateList('name', 'Running User', undefined, 'Running User', level1Dmns);
      }

      orgOverviewChartFactory.populateList('name', 'Folder', undefined, 'Folder', level1Dmns);
      return level1Dmns;
    };

    var _buildDimensionChart = function(groups, reportDetailArr, groupSmallerBars, targetType, totalCost, order) {
      var reportDimensions = [];
      var currentCost = 0;
      var chartDatumValue = 0;

      for (var key in groups) {
        if ({}.hasOwnProperty.call(groups, key)) {
          currentCost = orgOverviewChartFactory.computeTotalCost(groups[key], targetType);
          if (order !== null && order !== undefined && 'Cost' === order.name) {
            chartDatumValue = Math.round((currentCost / totalCost) * 100);
          } else {
            chartDatumValue = groups[key].length;
          }
          orgOverviewChartFactory.populateList('label', key, undefined, chartDatumValue, reportDimensions);
        }
      }

      var sortedDimensions = $filter('orderBy')(reportDimensions, "value", true);


      // group smaller bars.
      if (groupSmallerBars !== null && groupSmallerBars) {

        var otherChartData = _buildOtherBarData(sortedDimensions);

        var c10 = d3.scale.category10();


        otherChartData.chartData = [{
          "key": targetType + ' ' + order.value,
          "color": "#dc3912",
          "values": otherChartData.labelValues
        }];
        return otherChartData;
      } else {
        var sortedDimChart = {};
        sortedDimChart.chartData = [{
          "key": targetType + ' ' + order.value,
          "color": "#dc3912",
          "values": sortedDimensions
        }];
        sortedDimChart.hasOtherBlock = false;
        sortedDimChart.noOfOtherBlocks = 0;
        return sortedDimChart;
      }
    };

    var reportDetailChart = function(dataSize, targetType, reportDetailArr) {

      var sortedArray = ioraServicesFactory.sortByHealthScore($filter,reportDetailArr,targetType);

      var reportChartData = [];
      var detailChartLength = 0;

      if (dataSize === '*') {
        detailChartLength = 50;
      } else {
        detailChartLength = dataSize;
      }

      reportChartData=orgOverviewChartFactory.populateChartData(sortedArray,detailChartLength,targetType);

      return [{
        "key": targetType + ' Id',
        "color": "#dc3912",
        "values": reportChartData
      }];

    };




    var defineDimensionChartOptions = function($scope) {

      var tmpChartOptions = orgOverviewChartFactory.templateChartOptions();
      //customize the needed options for dimension chart.
      tmpChartOptions.title.text = $scope.targetType + " assessment by " + $scope.chartFilter.dimension.name;

      tmpChartOptions.subtitle.text = "Hover for summary, click for details";
      tmpChartOptions.chart.reduceXTicks = false;
      tmpChartOptions.chart.showXAxis = false;
      tmpChartOptions.chart.showYAxis = false;

      tmpChartOptions.chart.multibar = {};
      tmpChartOptions.chart.multibar.dispatch = {};

      tmpChartOptions.chart.multibar.dispatch.elementClick = function(e) {
        var detailChart = orgDrillDownChartFactory.buildDetailDimensionChart($scope, $scope.chartFilter.dimension.name, $scope.filteredDataSet, e.data.label, null, $scope.targetType, $scope.lowerCaseTargets);

        //send the state for future drill downs.
        var drillDownState = {
          drillDownLevel: 1,
          parentDimensionName: $scope.chartFilter.dimension.name,
          selectedEntity: e.data.label,
          dimensionName: 'Observations',
          parentHiddenCount: $scope.noOfOtherBlocks,
          order: $scope.chartFilter.order,
          parentGroupBars: $scope.chartFilter.groupSmallerBars,
          hiddenCount: 0,
          groupBars: false //default dimension name, on click from a user/report type.
        };
        var rootLevelValues = {};
        rootLevelValues.dimensionName = $scope.chartFilter.dimension.name;
        rootLevelValues.groupBars = $scope.chartFilter.groupSmallerBars;
        rootLevelValues.hiddenCount = $scope.noOfOtherBlocks;
        rootLevelValues.order = $scope.chartFilter.order;
        //save the zero state as well.
        $scope.drillDownStates[0] = rootLevelValues;
        orgOverviewChartFactory.emitChartUpdateEvent($scope,detailChart,drillDownState);
      };
      return tmpChartOptions;
    };

    return {
      reportDetailChart: reportDetailChart,
      reportDimensionChart: reportDimensionChart,
      defineDimensionChartOptions: defineDimensionChartOptions,
      level1ChartDimensions: level1ChartDimensions,
      defineDetailChartOptions : defineDetailChartOptions,
      dashboardDetailChart: dashboardDetailChart
    };

  });
