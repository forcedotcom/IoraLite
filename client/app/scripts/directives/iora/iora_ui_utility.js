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
 * This Javascript file has the utility functions associated with Iora
 * Author: Salesforce
 */

// global UI config variables
var configVars = {
  logo: "",
  userFirstName: "",
  userLastName: "",
  overviewPage: "./Iora_SM_Org",
  dashboardsPage: "./Iora_SM_Targets?target=dashboards",
  reportsPage: "./Iora_SM_Targets?target=reports",
  viewsPage: "./Iora_SM_Targets?target=views",
  target: "",
  targetType: "",
  targetTypes: "",
  queryTarget: "",
  page: ""
};

// function used to normalize data suitable for dataTables output
function normalize(data) {
  var result = [];
  for (var row in data) {
    if ({}.hasOwnProperty.call(data, row)) {
      result.push(data[row]);
    }
  }
  return result;
}

function mapIDPrefixToObject(idPrefix) {
  if (idPrefix === '00O') {
    return 'reports';
  } else if (idPrefix === '00B') {
    return 'views';
  } else if (idPrefix === '01Z') {
    return 'dashboards';
  } else {
    return 'undefined';
  }
}

function updateConfigVarsTarget(targetType, configVars) {
  // update config variables based on runtime parameters
  if (targetType === 'reports') {
    configVars.targetType = 'report';
    configVars.targetTypes = 'reports';

  } else if (targetType === 'views') {
    configVars.targetType = 'list view';
    configVars.targetTypes = 'list views';
    configVars.queryTarget = 'ListView';
  } else if (targetType === 'dashboards') {
    configVars.targetType = 'dashboard';
    configVars.targetTypes = 'dashboards';
  } else { // invalid query string, so redirect to home page
    //window.location.assign("./Iora_Org");
  }
}

// function used to initialize configVars and redirect to home page if problems
function initConfig(url) {

  // parse query string to get dynamic runtime information
  //var vars = [], hash;
  var hash;
  var targetType; //local variable to store appropriate targetType
  // get query string
  var q = url.split('?')[1];

  // if query string is present, process it
  if (q !== undefined) {
    q = q.split('&');
    for (var i = 0; i < q.length; i++) {
      hash = q[i].split('=');
      configVars.target = hash[1];
    }
  } else { // query string is null, so redirect to home page
    //window.location.assign("./Iora_Org");
  }


  if (configVars.target) {
    // determine this page, Targets or Target, based on 1st query string parameter
    // if Target (starts with '0')
    if (configVars.target.substring(0, 1) === '0') {
      configVars.page = 'target';
      // targetType can be set using key prefix of objectId
      targetType = configVars.target.substring(0, 3);
      //get the object name corresponding to key prefix.
      targetType = mapIDPrefixToObject(targetType);
    } else {
      configVars.page = 'targets';
      targetType = configVars.target;
    }
    //update configVars depending on object name
    updateConfigVarsTarget(targetType, configVars);
  }

}

// render page sections using Mustache template (static resource) and configVars
function renderPageSection(section, staticResource) {
  var selector = "#" + section.toString();
  var elementId = "iora_" + section.toString() + "_template";

  $(selector).load(staticResource, function() {
    var template = document.getElementById(elementId).innerHTML;
    var html = Mustache.render(template, configVars);
    $(selector).html(html);
  });

}


function updatewarningspage(reportWarnings,dashboardWarnings){

  $('#table-report-warnings').dataTable( {
      data: reportWarnings,
          "columns": [
          { "data": "generalInfo.Id"},
          { "data": null, render: function(data) {
            return "<a href=\"./Iora_Target?target="+data.generalInfo.Id+"\">" + data.generalInfo.name+"</a>";
          }},
           { "data": "reportPerformance.rank" },
          { "data": null, render: function(data) {
            var lastRunMoment=moment(data.generalInfo.lastRunDate);
            return  lastRunMoment.format("ddd, MMM D YYYY, h:mm a");
          }}
      ],
      language: {"emptyTable": "No report warnings to display."}
  } );


  $('#table-dashboard-warnings').dataTable( {
      data: dashboardWarnings,
          "columns": [
            { "data": "generalInfo.Id"},
            { "data": null, render: function(data) {
              return "<a href=\"./Iora_Target?target="+data.generalInfo.Id+"\">" + data.generalInfo.name+"</a>";
            }},
            { "data": null, render: function(data) {
              var lastRunMoment=moment(data.generalInfo.lastRunDate);
              return  lastRunMoment.format("ddd, MMM D YYYY, h:mm a");
            }}

      ],
      language: {"emptyTable": "No dashboard warnings to display."}

  } );

}

function updateScopeSection(scopeData,tableId,scopeName){

  $(tableId).dataTable( {
    "destroy": true,
    "responsive" : true,
      data: scopeData,
          "columns": [
          { "data": "generalInfo.Id"},
          { "data": null, render: function(data) {
            return "<a href=\"./Iora_Target?target="+data.generalInfo.Id+"\">" + data.generalInfo.name+"</a>";
          }},

          { "data": "reportPerformance.rank" },
          { "data": null, render: function(data) {
            var lastUsedMoment=moment(data.generalInfo.lastRunDate);
            return  lastUsedMoment.format("ddd, MMM D YYYY, h:mm a");
          }}

      ],
      language: {"emptyTable": "No "  + scopeName + "  reports to display."}
  } );

}
 


function updateErrorsPage(reportErrors,dashboardErrors,reportPerfErrors){

  $('#table-report-errors').dataTable( {
      data: reportErrors,
          "columns": [
          { "data": "Id"},
          { "data": "errorInfo.errorCode" },
          { "data": "errorInfo.errorMessage" }

      ],
      language: {"emptyTable": "No report errors to display."}
  } );

  $('#table-report-perf-errors').dataTable( {
      data: reportPerfErrors,
          "columns": [
          { "data": "Id"},
          { "data": "name" },
          { "data": "reportFormat" },
          { "data": "lastRunDate" },
          { "data": "lastModifiedByName" }

      ],
      language: {"emptyTable": "No errors in fetching report perf metrics."}
  } );


  $('#table-dashboard-errors').dataTable( {
      data: dashboardErrors,
          "columns": [
            { "data": "Id"},
            { "data": "errorCode" },
            { "data": "errorMessage" }

      ],
      language: {"emptyTable": "No dashboard errors to display."}

  } );

}

function buildIconHtml(dataObject){
  var iconHTML='';
  if (dataObject.reportFilters.hasScope && !dataObject.reportFilters.isAllScope) {
    iconHTML += '&nbsp;<i class=\'fa fa-filter alert-warning\'></i>';
  }

  if (dataObject.reportPerformance.isSharing) {
    iconHTML += '&nbsp;<i class=\'fa fa-share-alt alert-warning\'></i>';
  }

  if (iconHTML !== null && iconHTML.length > 0) {
    var splText = '<br/><span style=\'font-size:22px;color:orange;font-style: italic;font-weight:bold;\'><sup>*</sup></span>';
    iconHTML = splText + iconHTML;
  }
  return iconHTML;
}


function updateTargetsPageData(thisTarget) {
  var tableId;
  tableId = '#targets-table-' + configVars.targetType;

  // same for all types of targets
  $(tableId).dataTable({
    "destroy": true,
    "responsive": true,
    "order": [
      [2, "asc"]
    ],
    "data": thisTarget,
    "columns": [{
        "data": null,
        visible: false,
        render: function(data) {

          switch (configVars.targetType) {
            case "report":
              return data.generalInfo.Id;
              //
            case "list view":
              return data.Id;
              //
            case "dashboard":
              return data.dashboardInfo.generalInfo.Id;
              //
            default:
              return null;
              //
          }

        }
      },
      {
        "data": null,
        render: function(data) {
          switch (configVars.targetType) {
            case "report":

              return "<a href=\"./Iora_Target?target=" + data.generalInfo.Id + "\">" + data.generalInfo.name + "</a>";

            case "list view":
              return "<a href=\"./Iora_Target?target=" + data.Id + "&objectName=" + data.SobjectType + "\">" + data.name + "</a>";
            case "dashboard":

              var noOfComponentErrors = 0;
              var dashboardName = '';
              if (data.dashboardInfo.generalInfo.errorInfos !== undefined && data.dashboardInfo.generalInfo.errorInfos.length > 0) {
                noOfComponentErrors = data.dashboardInfo.generalInfo.errorInfos.length;

                dashboardName = "<a href=\"./Iora_Target?target=" + data.dashboardInfo.generalInfo.Id + "\">" + data.dashboardInfo.generalInfo.name + "<i class=\"fa fa-exclamation-triangle fa-fw\"></i></a> <span class=\"badge\"> " + noOfComponentErrors + " </span> ";
              } else {
                dashboardName = "<a href=\"./Iora_Target?target=" + data.dashboardInfo.generalInfo.Id + "\">" + data.dashboardInfo.generalInfo.name + "</a>";
              }

              return dashboardName;
            default:
              return null;

          }
        }
      },
      {
        "data": null,
        render: function(data) {
          switch (configVars.targetType) {
            case "report":
              return data.reportPerformance.rank;

            case "list view":
              return data.LastViewedDate;

            case "dashboard":
              return data.dashboardStats.rank;

            default:
              return null;

          }
        }
      },
      {
        "data": null,
        render: function(data) {
          switch (configVars.targetType) {
            case "report":
              var lastRun = moment(data.generalInfo.lastRunDate);
              return lastRun.format("ddd, MMM D YYYY, h:mm a");
            case "list view":
              return data.LastViewedDate;
            case "dashboard":
              var lastRefresh = moment(data.dashboardInfo.generalInfo.refreshDate);
              return lastRefresh.format("ddd, MMM D YYYY, h:mm a");
            default:
              return null;

          }
        }
      },
      {
        "data": null,
        render: function(data) {
          switch (configVars.targetType) {
            case "report":
              var iconHTML=buildIconHtml(data);
              return data.reportPerformance.designStatus + iconHTML;
            case "list view":
              return "Slow";

            case "dashboard":
              return data.dashboardStats.designStatus;

            default:
              return null;
          }
        }
      },
      {
        "data": null,
        render: function(data) {
          switch (configVars.targetType) {
            case "report":
              return data.reportPerformance.scalabilityStatus;

            case "list view":
              return "Slow";

            case "dashboard":
              return data.dashboardStats.scalabilityStatus;

            default:
              return null;

          }
        }
      },
      {
        "data": null,
        render: function(data) {
          switch (configVars.targetType) {
            case "report":
              return data.reportPerformance.object;

            case "list view":
              return "Slow";

            case "dashboard":
              return data.dashboardInfo.generalInfo.runningUser;

            default:
              return null;

          }
        }
      },
      {
        "data": null,
        render: function(data) {
          switch (configVars.targetType) {
            case "report":
              return data.generalInfo.reportTypeObjName;

            case "list view":
              return "Slow";

            case "dashboard":
              return "<a href=\"./Iora_Target?target=" + data.dashboardStats.offendingReportId + "\">" + data.dashboardStats.offendingReportName + "</a>";

            default:
              return null;

          }
        }
      },
      {
        "data": null,
        render: function(data) {
          switch (configVars.targetType) {
            case "report":
              return data.generalInfo.lastModifiedByName;

            case "list view":
              return "Slow";

            case "dashboard":
              return data.dashboardInfo.generalInfo.lastModifiedByName;

            default:
              return null;

          }
        }
      },
      {
        "data": null,
        render: function(data) {
          switch (configVars.targetType) {
            case "report":
              var lastModDate = moment(data.generalInfo.lastModifiedOn);
              return lastModDate.format("ddd, MMM D YYYY, h:mm a");

            case "list view":
              return "Slow";

            case "dashboard":
              var dashlastModDate = moment(data.dashboardInfo.generalInfo.lastModifiedOn);
              return dashlastModDate.format("ddd, MMM D YYYY, h:mm a");

            default:
              return null;

          }
        }
      },
      {
        "data": null,
        visible: false,
        render: function(data) {
          switch (configVars.targetType) {
            case "report":
              return data.reportPerformance.healthScoreMult1;

            case "list view":
              return "";

            case "dashboard":
              return data.dashboardStats.healthScore;

            default:
              return null;

          }
        }
      },
      {
        "data": null,
        visible: false,
        render: function(data) {
          switch (configVars.targetType) {
            case "report":
              if (data.reportFilters.hasScope !== null && data.reportFilters.hasScope !== undefined && data.reportFilters.hasScope && !data.reportFilters.isAllScope) {
                return "Scope-based filter";
              }

              if (data.reportPerformance.isSharing) {
                return "Sharing-based filter";
              }

              return " ";

            case "list view":
              return "";

            case "dashboard":
              return data.dashboardStats.healthScore;

            default:
              return null;

          }
        }
      },
      {
        "data": null,
        visible: false,
        render: function(data) {
          switch (configVars.targetType) {
            case "report":
              if (data.reportPerformance.perfTags !== null && data.reportPerformance.perfTags !== undefined && data.reportPerformance.perfTags.length > 0) {
                return data.reportPerformance.perfTags;
              } else {
                return 'NONE';
              }
            case "list view":
              return "";
            case "dashboard":
              return data.dashboardStats.perfTags;
            default:
              return "";
          }
        }
      }

    ],
    "language": {
      "emptyTable": "No targets to show."
    }
    /*mergeColumns: [
      3,4,5,6,7,8,9
    ]*/
  });

}

function updateTargetPageData(thisTarget) {
  // page updates, all types of targets


  // page updates, target specific
  switch (configVars.targetType) {
    case "report":
      addUniversalPageData(thisTarget);
      updateReportPage(thisTarget);
      break;
    case "dashboard":
      addUniversalPageData(thisTarget.dashboardInfo);
      updateDashboardPage(thisTarget);
      break;
    case "list view":
      updateListViewPage(thisTarget);
      break;
  }

}

// page updates, all target types
function addUniversalPageData(thisTarget) {


  var createdMoment = moment(thisTarget.generalInfo.createdOn);
  var lastModifiedMoment = moment(thisTarget.generalInfo.lastModifiedOn);


  // General pill
  $('#td-Id').text(thisTarget.generalInfo.Id);
  $('#td-Description').text(thisTarget.generalInfo.description);
  $('#td-CreatedById').text(thisTarget.generalInfo.createdByName);
  $('#td-CreatedDate').text(createdMoment.format("ddd, MMM D YYYY, h:mm a"));
  //$('#td-CreatedDate').text(createdTS.toUTCString());
  $('#td-OwnerId').text(thisTarget.generalInfo.createdByName);
  $('#td-LastModifiedById').text(thisTarget.generalInfo.lastModifiedByName);
  //('#td-LastModifiedDate').text(lastModifiedTS.toUTCString());
  $('#td-LastModifiedDate').text(lastModifiedMoment.format("ddd, MMM D YYYY, h:mm a"));
  $('#td-Name').text(thisTarget.generalInfo.name);
  $('#targetName').text(thisTarget.generalInfo.name);

  $('#td-Entity').text(thisTarget.generalInfo.reportType);

  $('#td-FolderName').text(thisTarget.generalInfo.folderId);

}

// dashboard page specific updates
function updateDashboardPage(thisTarget) {

  var lastUsedMoment = moment(thisTarget.dashboardInfo.generalInfo.refreshDate);
  $('#td-LastUsedDate').text(lastUsedMoment.format("ddd, MMM D YYYY, h:mm a"));



  $('#td-Name').text(thisTarget.dashboardInfo.generalInfo.name);
  $('#targetName').text(thisTarget.dashboardInfo.generalInfo.name);
  $('#td-RunningUserId').text(thisTarget.dashboardInfo.generalInfo.runningUser);

  $('#td-Design').addClass(thisTarget.dashboardStats.designStatusClass).text(thisTarget.dashboardStats.designStatus);
  $('#td-Scalability').addClass(thisTarget.dashboardStats.scalabilityStatusClass).text(thisTarget.dashboardStats.scalabilityStatus);
  $('#td-HealthScore').addClass('warning').text(thisTarget.dashboardStats.healthScore);
  $('#performanceOverviewText').html(thisTarget.dashboardStats.perfSummary);

  // Structure pill
  var components = thisTarget.dashboardInfo.generalInfo.componentInfo;

  $('#components').dataTable({
    data: components,
    "columns": [{
        "data": null,
        render: function(data) {
          if (data.typeName === null) {
            data.typeName = "Unnamed";
          }
          if (data.componentType === "Report") {
            return "<a href=\"./Iora_Target?target=" + data.componentId + "\">" + data.typeName + "</a>";
          } else {
            return data.componentType;
          }
        }
      },
      {
        "data": "componentType"
      },
      {
        "data": "componentName"
      },
      {
        "data": "visualizationType"
      }

    ],
    language: {
      "emptyTable": "No dashboard components to display."
    },
    rowsGroup: [
      0, 1, 2
    ]

  });

  if (thisTarget.dashboardInfo.generalInfo.errorInfos !== undefined && thisTarget.dashboardInfo.generalInfo.errorInfos.length > 0) {

    $('#dash-errors-table').dataTable({
      data: thisTarget.dashboardInfo.generalInfo.errorInfos,
      "columns": [{
          "data": "Id"
        },
        {
          "data": "Name"
        },
        {
          "data": "errorCode"
        },
        {
          "data": "errorMessage"
        },
        {
          "data": "errorSeverity"
        }

      ],
      language: {
        "emptyTable": "No dashboard errors to display."
      }


    });
  }

  $('#tr-Entity').hide();
  $('#tr-Description').hide();
  $('#tr-OwnerId').hide();
  $('#div-Fields').hide();
  $('#div-Groups').hide();
  $('#filters-pills').hide();
  $('#tuning-pills').hide();
  $('#nav-filters').hide();
  $('#nav-performance').hide();
  $('#nav-tuning').hide();

}

// add filter recommendation and popover
function addPopOver(row, data, column, uiClass) {

  if (data.popOverColumn !== null && data.popOverColumn !== undefined) {
    column = data.popOverColumn;
    if (data.popOverClass !== null && data.popOverClass !== undefined) {
      uiClass = data.popOverClass;
    } else {
      uiClass = 'warning';
    }
  }
  if (data.popOverText !== undefined && data.popOverText !== null && data.popOverText.length > 0) {
    ($(row).find("td").eq(column)).addClass(uiClass).attr('data-toggle', "popover").attr('data-placement', "top").attr('data-content', data.popOverText).popover({
      container: 'body',
      trigger: 'hover',
      html: 'true'
    });
  }
}

// report page specific updates
function updateReportPage(thisTarget) {

  // hide non-applicable page elements
  $('#tr-RunningUserId').hide();
  $('#div-DashboardComponents').hide();

  //var lastUsedTS=new Date(thisTarget.generalInfo.lastRunDate);
  var lastUsedMoment = moment(thisTarget.generalInfo.lastRunDate);
  $('#td-LastUsedDate').text(lastUsedMoment.format("ddd, MMM D YYYY, h:mm a"));

  $('#td-Design').addClass(thisTarget.reportPerformance.designClass).text(thisTarget.reportPerformance.designStatus);
  $('#td-Scalability').addClass(thisTarget.reportPerformance.scalabilityStatusClass).text(thisTarget.reportPerformance.scalabilityStatus);
  $('#td-HealthScore').addClass('warning').text(thisTarget.reportPerformance.healthScore);
  $('#performanceOverviewText').html(thisTarget.reportPerformance.perfSummary);


  // check for joined format/multiblock reports (not supported)

  // Structure pill, fields
  $('#fields').dataTable({
    "data": thisTarget.reportStructure.reportFields,
    "columns": [{
        "data": "fieldName"
      },
      {
        "data": "fieldType"
      }
    ],
    "language": {
      "emptyTable": "No fields to display."
    }
  });

  // Structure pill, groupings

  $('#groupingsAll').dataTable({
    "data": thisTarget.reportStructure.reportGroups,
    "columns": [{
        "data": "groupType"
      },
      {
        "data": "fieldName"
      },
      {
        "data": "granularity"
      },
      {
        "data": "sortAggregate"
      },
      {
        "data": "sortOrder"
      }
    ],
    "language": {
      "emptyTable": "No groupings to display."
    }
  });

  // Filters pill
  // output custom filters table in Filters tab

  $('#filters').dataTable({
    "data": thisTarget.reportFilters.reportFilters,
    "ordering": false,
    "searching": false,
    "paging": false,
    "columns": [{
        "data": "sno"
      },
      {
        "data": "filterType"
      },
      {
        "data": "field"
      },
      {
        "data": "operator"
      },
      {
        "data": "value"
      }
    ],
    "language": {
      "emptyTable": "No filters to display."
    },
    "rowCallback": function(row, data, index) {
      addPopOver(row, data, 3, 'danger');
    } // end rowCallback
  }); // end dataTable

  // output filter logic in Filters pill, below Filters table
  $('#targetBooleanFilter').text(thisTarget.reportFilters.filterLogic);


  outputPerformancePill(thisTarget);

}



// list view page specific updates
function updateListViewPage(thisTarget) {

  // General pill
  $('#th-Entity').text("Object");
  $('#td-Entity').text(thisTarget.general.SobjectType);
  $('#td-Name').text(thisTarget.general.Name);
  $('#targetName').text(thisTarget.general.Name);
  $('#tr-Description').hide();
  $('#tr-OwnerId').hide();
  $('#tr-RunningUserId').hide();
  $('#div-Groups').hide();
  $('#div-DashboardComponents').hide();

  // Structure pill
  var fields = thisTarget.columns;
  fields = normalize(fields);
  $('#fields').dataTable({
    "data": fields,
    "columns": [{
        "data": "label"
      },
      {
        "data": "type"
      }
    ]
  });

}


// output Performance pill information, which should be common across target types
function outputPerformancePill(thisTarget) {

  // Performance pill, Execution Plans table
  var chosenPlanCost = 0; // used to determine if unused index is unselective
  var plansTable = $('#plans').dataTable({
    "data": thisTarget.reportPerformance.executionPlans,
    "ordering": false,
    "searching": false,
    "paging": false,
    "columns": [{
        "data": function() {
          return 1;
        }
      },
      {
        "data": "leadingOperationType"
      },
      {
        "data": "obj"
      },
      {
        "data": "fields"
      },
      {
        "data": "cardinality"
      },
      {
        "data": "objNoOfRecords"
      },
      {
        "data": "relativeCost"
      }
    ],
    "language": {
      "emptyTable": "No optimizer plans to display."
    },
    "rowCallback": function(row, data, index) {
      ($(row).find("td").eq(0)).text(index + 1);
      addPopOver(row, data, 4, 'warning');
    }
  });

  // Performance pill, Observations table
  $('#notes').dataTable({
    "data": thisTarget.reportPerformance.optimizerNotes,
    "ordering": false,
    "searching": false,
    "paging": false,
    "columns": [{
        "data": "obj"
      },
      {
        "data": "field"
      },
      {
        "data": "notes"
      }
    ],
    "language": {
      "emptyTable": "No optimizer notes to display."
    },
    "rowCallback": function(row, data, index) {
      addPopOver(row, data, 2, 'danger');
    }

  });

  $('#recommendations').dataTable({
    "data": thisTarget.reportPerformance.recommendations,
    "ordering": false,
    "searching": false,
    "paging": false,
    "columns": [{
        "data": "title"
      },
      {
        "data": "description"
      }
    ],
    "language": {
      "emptyTable": "No tuning recommendations at this time."
    }
  });

}
