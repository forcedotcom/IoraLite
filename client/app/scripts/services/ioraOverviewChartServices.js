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
 * Services page for display org overview charts.
 *
 **/
'use strict';

angular.module('ioraChartServices', [])
  .factory('orgOverviewChartFactory', function(chartSelectionFactory, ioraServicesFactory, orgToolTipServicesFactory, $window) {

    var _setKeyColorValues = function(reportStats,dashboardStats,key, color, propertyValue, type, keyColorValueArr) {

      keyColorValueArr.push({
        "key": key,
        "color": color,
        "values": [{
            "label": "Reports",
            "type": type,
            "value": reportStats[propertyValue]
          },

          {
            "label": "Dashboards",
            "type": type,
            "value": dashboardStats[propertyValue]
          }

        ]
      });


    }
    var plotDesignChart = function(reportStats, dashboardStats) {
      var keyColorValueArr = [];

      _setKeyColorValues(reportStats, dashboardStats,'Suboptimal', '#d62728', 'suboptimalDesignCnt', 'Design', keyColorValueArr);
      _setKeyColorValues(reportStats, dashboardStats,'Optimal', '#1f77b4', 'optimalDesignCnt', 'Design', keyColorValueArr);
      return keyColorValueArr;
    };

    var fetchAppropriateObj=function(targetType,iterObj){
      var desiredObj;
      if (ioraServicesFactory.isReport(targetType)) {
        desiredObj = iterObj.generalInfo;
      } else {
        desiredObj = iterObj.dashboardInfo.generalInfo
      }
      return desiredObj;
    }

    var computeTotalCost = function(object, targetType) {
      var currentCost = 0;
      for (var keyDataIdx = 0; keyDataIdx < object.length; keyDataIdx++) {
        if (ioraServicesFactory.isReport(targetType)) {
          currentCost += object[keyDataIdx].reportPerformance.healthScoreMult1;
        } else {
          currentCost += object[keyDataIdx].dashboardStats.healthScore;
        }
      }
      return currentCost;
    }
    //create a map between dimensions and property name in the object
    var propertyDimensionMap =  {
        'User_Report':'lastModifiedByName',
        'User_Dashboard' : 'lastModifiedByName',
        'Report Type_Report' : 'reportTypeObjName',
        'Running User_Dashboard' : 'runningUser',
        'Folder_Report' : 'ownedById',
        'Folder_Dashboard': 'folderId'
    }



    var plotScalabilityChart = function(reportStats, dashboardStats) {
      var keyColorValueArr = [];

      _setKeyColorValues(reportStats, dashboardStats,'Critical', '#d62728', 'criticalScalabilityCnt', 'Scalability', keyColorValueArr);
      _setKeyColorValues(reportStats, dashboardStats,'Warning', '#1f77b4', 'warningScalabilityCnt', 'Scalability', keyColorValueArr);
      _setKeyColorValues(reportStats, dashboardStats,'OK', '#109618', 'okScalabilityCnt', 'Scalability', keyColorValueArr);
      return keyColorValueArr;
    };

    var templateChartOptions = function() {
      return {
        chart: {
          type: 'multiBarChart',
          stacked: false,
          useInteractiveGuideline: false,

          height: 450,
          yAxis: {
            axisLabel: 'Count',
            tickFormat: function(d) {
              return d3.format(',.f')(d);
            }
          },
          clipEdge: true,
          x: function(d) {
            if (d.value >= 0) {
              return d.label;
            }
          },
          y: function(d) {
            if (d.value >= 0) {
              return d.value;
            }
          },
          xAxis: {
            "showMaxMin": true
          },

          showControls: false,
          showLegend: false,
          showValues: true
        },
        "title": {
          "enable": true,
          "text": "Placeholder Title",
          "className": "h2",
          "css": {
            "width": "nullpx",
            "textAlign": "center"
          }
        },
        "subtitle": {
          "enable": true,
          "text": "Placeholder subtitle",
          "className": "h3",
          "css": {
            "width": "nullpx",
            "font-weight": "lighter",
            "textAlign": "center"
          }
        }
      };
    };

    function highlightPoints(chart) {
      var data = d3.select('svg').datum();

      d3.select('.nv-groups')
        .selectAll("circle.myPoint")
        .remove();

      var points = d3.select('.nv-groups')
        .selectAll("circle.myPoint")
        .data(data[0].values.filter(function(d) {
          return d.y > 3000;
        }));

      points.enter().append("circle")
        .attr("class", "myPoint")
        .attr("cx", function(d) {
          return chart.xAxis.scale()(d.x);
        })
        .attr("cy", function(d) {
          return chart.yAxis.scale()(d.y);
        })
        .attr("r", 5);
    }

    var definedChartOptionsTemplate = function(titleText, subTitleText, url) {
      var tmpChartOptions = templateChartOptions();
      //customize chart options specific to the detail page chart.
      tmpChartOptions.title.text = titleText;
      tmpChartOptions.subtitle.text = subTitleText;
      tmpChartOptions.chart.showXAxis = false;
      tmpChartOptions.chart.showYAxis = false;
      tmpChartOptions.chart.tooltip = {};
      tmpChartOptions.chart.tooltip.contentGenerator = function(d) {
        return orgToolTipServicesFactory.customizeTooltip(d);
      };

      tmpChartOptions.chart.multibar = {};
      tmpChartOptions.chart.multibar.dispatch = {};

      tmpChartOptions.chart.multibar.dispatch.elementClick = function(e) {
        //var reportURL = './Iora_Target?target=' + e.data.label;
        $window.location.href = url + e.data.label;
      };

      return tmpChartOptions;
    }

    var populateOtherBarChart = function(otherValCount, otherChartData, otherBarChart) {
      if (otherValCount !== null && otherValCount !== undefined && otherValCount > 0) {
        otherBarChart.hasOtherBlock = true;
        otherBarChart.noOfOtherBlocks = otherValCount;
      }
      otherBarChart.labelValues = otherChartData;
    }

    var _populateChartDatum = function(chartDatum, sortedObject, healthscore, entityDate) {
      chartDatum.label = sortedObject.generalInfo.Id;
      chartDatum.apiName = sortedObject.generalInfo.name;
      chartDatum.value = healthscore;
      var lastUsedDt = moment(entityDate);
      chartDatum.lastUsed = lastUsedDt.format("ddd, MMM D YYYY");

      var lastModifiedDt = moment(sortedObject.generalInfo.lastModifiedOn);
      chartDatum.lastModified = lastModifiedDt.format("ddd, MMM D YYYY");
      chartDatum.lastModifiedBy = sortedObject.generalInfo.lastModifiedByName;
    }


    var populateChartData = function(object, objectLengthConstraint,targetType) {

      var chartData = [];
      var secondLength = 0;

      if (objectLengthConstraint === null || objectLengthConstraint === undefined) {
        secondLength = object.length;
      } else {
        secondLength = objectLengthConstraint;
      }

      for (var reportIndex = 0;
        (reportIndex < object.length && reportIndex < secondLength); reportIndex++) {
        var chartDatum = {};
        if (ioraServicesFactory.isReport(targetType)) {
          _populateChartDatum(chartDatum, object[reportIndex], object[reportIndex].reportPerformance.healthScoreMult1, object[reportIndex].generalInfo.lastRunDate);
        } else {
          _populateChartDatum(chartDatum, object[reportIndex].dashboardInfo, object[reportIndex].dashboardStats.healthScore, object[reportIndex].dashboardInfo.generalInfo.refreshDate);

        }
        chartData.push(chartDatum);
      }
      return chartData;
    }

    var populateList = function(labelProperty, label, apiName, value, list) {
      var object = {};
      object[labelProperty] = label;
      if (apiName !== null && apiName !== undefined)
        object.apiName = apiName;
      object.value = value;
      list.push(object);
    }

   var _populateChartFilterDefaultStats=function(object,value){
      object.name=value;
      object.value=value;

   }

   var emitChartUpdateEvent=function($scope,chartObj,drillDownState){
     $scope.$emit('chart-updated', chartObj.chartData, chartObj.chartOptions, chartObj.dimensions, chartObj.selectedDimension, chartObj.isDrillDown, drillDownState.drillDownLevel, drillDownState);
   }



    var defineChartOptions = function($scope) {
      var tmpChartOptions = templateChartOptions();
      tmpChartOptions.title = {};
      tmpChartOptions.subtitle.text = 'Hover for summary, click for details';
      tmpChartOptions.chart.showXAxis = true;
      tmpChartOptions.chart.showYAxis = true;
      tmpChartOptions.chart.showValues = true;
      tmpChartOptions.chart.showLegend = true;
      tmpChartOptions.chart.multibar = {};
      tmpChartOptions.chart.multibar.dispatch = {};
      tmpChartOptions.chart.multibar.dispatch.elementClick = function(e) {
        //check whether reports or dashboards for constructing the right URL

        //populate the default values for chart filter.

        var chartFilter = {
          dataSize: {
            name: 'All',
            value: '*',
            text: 'fifty'
          },
          scalability: {
            name: 'All',
            value: '*'
          },
          design: {
            name: 'All',
            value: '*'
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
        //update the chart filter defaults based on user selections
        _populateChartFilterDefaultStats(chartFilter[e.data.type.toLowerCase()],e.data.key);

        chartSelectionFactory.set(chartFilter);
        $scope.$emit('target-redirect', chartFilter, e.data.label);
      };
      return tmpChartOptions;
    };
    return {
      defineChartOptions: defineChartOptions,
      plotDesignChart: plotDesignChart,
      populateChartData: populateChartData,
      populateOtherBarChart : populateOtherBarChart,
      computeTotalCost: computeTotalCost,
      plotScalabilityChart: plotScalabilityChart,
      templateChartOptions: templateChartOptions,
      definedChartOptionsTemplate: definedChartOptionsTemplate,
      populateList: populateList,
      propertyDimensionMap : propertyDimensionMap,
      fetchAppropriateObj:fetchAppropriateObj,
      emitChartUpdateEvent:emitChartUpdateEvent
    };
  });
