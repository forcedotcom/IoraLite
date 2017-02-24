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
 * Node.js util function to transform SFDC REST to Iora REST Schema, for REST over REST implementation

 * 1. Function: transformReportDescribe
 * Purpose: Transform SFDC Rest API information for reports --> Iora SFDC Rest API Schema
 * Inputs:
 * @param : describeResponse -> reference to the salesforce JSON response
 * Output : Transformed Iora Report schema
 */

var moment = require('moment')

module.exports = {

    // function to transform report describe
    transformReportDescribe: function(reportSchema, _lodash, describeResponse, ioraConstants, reportPerfStatistics) {
        // create an instance to store the JSON
        var ioraReportRest = new reportSchema.ioraReportRest()
        // create an instance to get the report info structure
        var ioraReportInfo = new reportSchema.ioraReportInfo()

        // initialize generalInfo report structure
        var generalInfo = new ioraReportInfo.generalInfo()

        var structure = new ioraReportInfo.structure()

        var filters = new ioraReportInfo.filters()

        if (describeResponse.reportMetadata === null || describeResponse.reportMetadata === undefined) {
            // set the error message on filters and structures and return
            structure = new ioraReportInfo.structure()
            structure.errorMessage = describeResponse[0].errorMessage
            ioraReportRest.reportStructure = structure

            filters = new ioraReportInfo.filters()
            filters.errorMessage = describeResponse[0].errorMessage
            ioraReportRest.reportFilters = filters

            generalInfo.Id = describeResponse[0].id

            generalInfo.errorInfo = {}
            generalInfo.errorInfo.errorCode = describeResponse[0].errorCode
            generalInfo.errorInfo.errorMessage = describeResponse[0].errorMessage
            generalInfo.errorInfo.statusMessage = describeResponse[0].statusMessage

            ioraReportRest.generalInfo = generalInfo

            return ioraReportRest
        }

        _buildGeneralInfo(generalInfo, describeResponse.reportMetadata)
        ioraReportRest.generalInfo = generalInfo

        // initialize report structure
        structure = new ioraReportInfo.structure()
        _buildReportStructure(
            structure, reportSchema, describeResponse.reportExtendedMetadata.detailColumnInfo, describeResponse.reportMetadata.groupingsAcross, describeResponse.reportMetadata.groupingsDown, describeResponse.reportTypeMetadata.categories, _lodash, ioraConstants
        )
        ioraReportRest.reportStructure = structure

        // initalize the filters in iora report structure
        filters = new ioraReportInfo.filters()
        _buildFilters(filters, describeResponse.reportMetadata, describeResponse.reportTypeMetadata.categories, describeResponse.reportTypeMetadata.scopeInfo, describeResponse.reportTypeMetadata.standardFilterInfos, ioraReportInfo, ioraReportRest, reportSchema, _lodash, ioraConstants, reportPerfStatistics)
        ioraReportRest.reportFilters = filters

        return ioraReportRest
    }

}

var _buildGeneralInfo = function(
    generalInfo, reportMetadata
) {
    // set the general info values
    generalInfo.Id = reportMetadata.id
    generalInfo.folderId = reportMetadata.folderId
    generalInfo.name = reportMetadata.name
    generalInfo.entityType = 'Report'
    generalInfo.reportType = reportMetadata.reportType.label
    if (reportMetadata.reportType.type !== undefined) {
        var reportTypeAPIName = reportMetadata.reportType.type
        if (reportTypeAPIName.indexOf('@') > -1) {
            generalInfo.reportTypeObjName = reportTypeAPIName.substr(reportTypeAPIName.indexOf('@') + 1)
        } else if (reportTypeAPIName.indexOf('$') > -1) {
            generalInfo.reportTypeObjName = reportTypeAPIName.substr(reportTypeAPIName.indexOf('$') + 1)
            // find other occurences of $. They represent multiple objects in report type
            generalInfo.reportTypeObjName = generalInfo.reportTypeObjName.trim().replace(/\$/g, ',')
        } else {
            generalInfo.reportTypeObjName = reportTypeAPIName
        }
    }
    generalInfo.reportTypeAPI = reportMetadata.reportType.type
    generalInfo.developerName = reportMetadata.developerName
}

var _buildReportStructure = function(
    structure, reportSchema, detailColumnInfo, groupAcrossInfos, groupDownInfos, categories, _lodash, ioraConstants
) {
    // initialize report fields array
    structure.reportFields = []
    // initialize report fields array
    structure.reportGroups = []

    _lodash.each(detailColumnInfo, function(colInfo) {
        // instantitate a report fields Object
        var reportField = new reportSchema.reportFieldStruc()
        reportField.fieldName = colInfo.label
        reportField.fieldType = colInfo.dataType
        structure.reportFields.push(reportField)
    })

    _lodash.each(groupAcrossInfos, function(groupAcross) {
        // instantitate a report fields Object
        var groupField = new reportSchema.reportGroupStruc()
        groupField.groupType = ioraConstants.groupingsAcross
        groupField.fieldName = _findColumnLabel(groupAcross.name, categories).label
        groupField.sortOrder = groupAcross.sortOrder
        groupField.granularity = groupAcross.dateGranularity
        groupField.sortAggregate = groupAcross.sortAggregate
        structure.reportGroups.push(groupField)
    })

    _lodash.each(groupDownInfos, function(groupDown) {
        // instantitate a report fields Object
        var groupField = new reportSchema.reportGroupStruc()
        groupField.groupType = ioraConstants.groupingDown
        groupField.fieldName = _findColumnLabel(groupDown.name, categories).label
        groupField.sortOrder = groupDown.sortOrder
        groupField.granularity = groupDown.dateGranularity
        groupField.sortAggregate = ''
        structure.reportGroups.push(groupField)
    })
}

var _isOperatorOfInterest=function(operator, _lodash , desiredOpName,ioraConstants){
  return (_lodash.indexOf(ioraConstants[desiredOpName + 'Operators'], operator) > -1);
}

var _pushRecommendation = function(title, description, ioraReportRest, ioraReportInfo, reportSchema) {
    var recommendationStruc = new reportSchema.recommendationStruc()
    recommendationStruc.title = title
    recommendationStruc.description = description

    // check if the recommendation is already present
    if (ioraReportRest.reportPerformance !== null &&
        ioraReportRest.reportPerformance !== undefined &&
        ioraReportRest.reportPerformance.recommendations !== null &&
        ioraReportRest.reportPerformance.recommendations !== undefined) {
        ioraReportRest.reportPerformance.recommendations.push(recommendationStruc)
    } else {
        if (ioraReportRest.reportPerformance === null || ioraReportRest.reportPerformance === undefined) {
            ioraReportRest.reportPerformance = new ioraReportInfo.performance()
        }
        ioraReportRest.reportPerformance.recommendations = []
        ioraReportRest.reportPerformance.recommendations.push(recommendationStruc)
    }
}



var _addPerfTags = function(perfTagName, perfTagIndex, ioraReportRest, ioraPerfTagsSet) {
    if (!ioraPerfTagsSet.has(perfTagName)) {
        if (ioraReportRest.reportPerformance.perfTags && ioraReportRest.reportPerformance.perfTags.length > 0) {
            ioraReportRest.reportPerformance.perfTags += ','
        } else {
            ioraReportRest.reportPerformance.perfTags = ''
            ioraReportRest.reportPerformance.perfEncoding = 0
        }
        ioraReportRest.reportPerformance.perfTags += perfTagName
        ioraReportRest.reportPerformance.perfEncoding += Math.pow(2, perfTagIndex)
        ioraPerfTagsSet.add(perfTagName)
    }
}
var _deriveObjectName = function(_lodash,objectLabel) {

    if (objectLabel.indexOf(' ') !== -1) {
        var tmpStrs = objectLabel.split(' ')
        var pluralObjName = tmpStrs[1] // last string.
        var trimmedObjName = ''
        if (pluralObjName !== null && pluralObjName !== undefined) {
            // check for ending with ies
            if (_lodash.endsWith(pluralObjName, 'ies')) {
                trimmedObjName = pluralObjName.substring(0, pluralObjName.length - 3)
                trimmedObjName += 'y'
            } else if (_lodash.endsWith(pluralObjName, 'es')) {
                trimmedObjName = pluralObjName.substring(0, pluralObjName.length - 2)
            } else if (_lodash.endsWith(pluralObjName, 's')) {
                trimmedObjName = pluralObjName.substring(0, pluralObjName.length - 1)
            } else {
                trimmedObjName = pluralObjName
            }

            return _lodash.capitalize(trimmedObjName)
        }
    }

}

var _handleLastModifiedDateField = function(filter, ioraConstants, ioraReportRest, ioraReportInfo, reportSchema, ioraPerfTagsSet, reportPerfStatistics) {
    if (filter.field === ioraConstants.lastModifiedDateField &&
        (filter.operator === 'between' || filter.operator === 'greaterThan')
    ) {
        filter.popOverColumn = 4;
        _handlerecommendPerfTags(filter, ioraConstants, ioraReportRest, ioraReportInfo, reportSchema, ioraPerfTagsSet, 'lastModifiedDate');
        reportPerfStatistics.lastmodifiedoptHDCnt++
    }
}

var _handlerecommendPerfTags = function(filter, ioraConstants, ioraReportRest, ioraReportInfo, reportSchema, ioraPerfTagsSet, dimension) {
    filter.popOverText = ioraConstants[dimension + 'PopOver'];
    _pushRecommendation(ioraConstants[dimension + 'RecTitle'],
        ioraConstants[dimension + 'RecDescription'],
        ioraReportRest,
        ioraReportInfo,
        reportSchema
    )
    if (ioraPerfTagsSet) {
        _addPerfTags(ioraConstants[dimension + 'Tag'],
            ioraConstants[dimension + 'Index'],
            ioraReportRest,
            ioraPerfTagsSet
        );
    }

}

var _initializeCustomFilters = function(filter, sno, filterTypeVal, fieldVal, operatorVal, apiVal) {
    filter.sno = sno;
    filter.filterType = filterTypeVal;
    filter.field = fieldVal;
    filter.operator = operatorVal;
    filter.fieldAPI = apiVal;
}

var _handleOperators=function(filterStats,filter,operator,_lodash,operatorName,ioraConstants,ioraReportRest,ioraReportInfo,reportSchema){
  if (_isOperatorOfInterest(operator, _lodash , operatorName,ioraConstants)) {
      filterStats[operatorName + 'opCnt']++;
      filter['is' + operatorName]  = true;
      _handlerecommendPerfTags(filter, ioraConstants, ioraReportRest, ioraReportInfo, reportSchema, null, operatorName + 'op');
  }
}

var _processCustomFilters = function(_lodash,customFilters, filter, ioraConstants, ioraReportRest, ioraReportInfo, reportSchema, ioraPerfTagsSet, reportPerfStatistics, allFilters, filterStats,categories) {
    if (customFilters && customFilters.length > 0) {
        for (var i = 0; i < customFilters.length; i++) {
            // add custom filter to allFilters array
            filter = new reportSchema.reportFilterStruc();
            _initializeCustomFilters(filter, i + 1, 'Custom', _findColumnLabel(customFilters[i].column, categories).label, customFilters[i].operator, customFilters[i].column)

            // check for last modified date filter. Suggest considering systemModStamp
            _handleLastModifiedDateField(filter, ioraConstants, ioraReportRest, ioraReportInfo, reportSchema, ioraPerfTagsSet, reportPerfStatistics);

            _handleOperators(filterStats,filter,customFilters[i].operator,_lodash,'negative',ioraConstants,ioraReportRest,ioraReportInfo,reportSchema);

            _handleOperators(filterStats,filter,customFilters[i].operator,_lodash,'nonoptimizable',ioraConstants,ioraReportRest,ioraReportInfo,reportSchema);

            filter.value = customFilters[i].value
            allFilters.push(filter)
            filterStats.filterCount += 1
        }
    } // end add custom filters
}

var _processScopeFilters = function(_lodash,reportMetadata, scopeInfo, filterStats, reportSchema, filters, ioraConstants, ioraReportRest, ioraReportInfo, reportPerfStatistics, allFilters) {
    if (reportMetadata.scope) {
        var scopeFilter = _buildScopeFilter(
            reportMetadata.scope,
            scopeInfo.values,
            filterStats.filterCount + 1,
            reportSchema)
        filters.scopeValue = scopeFilter.value
        if (scopeFilter.value && scopeFilter.value.indexOf('All') !== -1) {
            filters.isAllScope = true
            scopeFilter.popOverColumn = 4
            // derive the object name from the label.
            scopeFilter.object = _deriveObjectName(_lodash,scopeFilter.value);
            _handlerecommendPerfTags(scopeFilter, ioraConstants, ioraReportRest, ioraReportInfo, reportSchema, null, 'wideScope');
            reportPerfStatistics.widescopeHDCnt++
        }
        filters.hasScope = true
        allFilters.push(scopeFilter)
        filterStats.filterCount += 1
    }
}

var _processStandardDateFilters = function(reportMetadata, filterStats, filter, categories, ioraConstants, ioraReportRest, ioraReportInfo, reportSchema, ioraPerfTagsSet, reportPerfStatistics, allFilters) {
    if (reportMetadata.standardDateFilter) {
        filter = new reportSchema.reportFilterStruc();
        filter.sno = filterStats.filterCount + 1;
        filter.filterType = 'Standard Date';
        var exploreColumn = _findColumnLabel(reportMetadata.standardDateFilter.column,
            categories);

        // something is wrong , if not entering the loop. the column itself is null. Uncomment debug logs and check, if you run into this code segment or issue.
        if (exploreColumn) {
            filter.field = exploreColumn.label;
            filter.object = exploreColumn.objName;
        }

        filter.operator = 'between';
        filter.fieldAPI = reportMetadata.standardDateFilter.column;
        _handleLastModifiedDateField(filter, ioraConstants, ioraReportRest, ioraReportInfo, reportSchema, ioraPerfTagsSet, reportPerfStatistics);

        if (!reportMetadata.standardDateFilter.startDate && !reportMetadata.standardDateFilter.endDate) {
            filter.value = 'all time';
            filter.popOverColumn = 4;
            _handlerecommendPerfTags(filter, ioraConstants, ioraReportRest, ioraReportInfo, reportSchema, ioraPerfTagsSet, 'largeDateRange');
            reportPerfStatistics.largedaterangeHDCnt++;
        } else {
            filter.value = reportMetadata.standardDateFilter.startDate + ' ... ' + reportMetadata.standardDateFilter.endDate;
            var momentStartDate = moment(reportMetadata.standardDateFilter.startDate);
            var momentEndDate = moment(reportMetadata.standardDateFilter.endDate);
            filter.duration = momentEndDate.diff(momentStartDate, 'days');
            if (filter.duration > 179) {
                filter.popOverColumn = 4
                _handlerecommendPerfTags(filter, ioraConstants, ioraReportRest, ioraReportInfo, reportSchema, ioraPerfTagsSet, 'largeDateRange');
                reportPerfStatistics.largedaterangeHDCnt++;
            }
        }
        allFilters.push(filter);
        filterStats.filterCount += 1;
    }
}


var _buildFilters = function(
    filters, reportMetadata, categories, scopeInfo, standardFilterInfos, ioraReportInfo, ioraReportRest, reportSchema, _lodash, ioraConstants, reportPerfStatistics
) {
    var ioraReportPerf = ioraReportRest.reportPerformance

    var filterStats = {
        filterCount: 0,
        negativeopCnt: 0,
        nonoptimizableOpCnt: 0
    }

    // initialize has scope to false.
    filters.hasScope = false
    filters.isAllScope = false

    // create combined array of report filters from standard and custom filters
    var filterCount = 0
    var allFilters = []

    var ioraPerfTagsSet = new Set()

    // initialize filter elements
    filters.reportFilters = []

    // begin add custom filters
    var customFilters = reportMetadata.reportFilters
    var negativeopCnt = 0
    var nonoptimizableOpCnt = 0
    var filter = new reportSchema.reportFilterStruc()

    // date regex : ^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$

    //process custom filters
    _processCustomFilters(_lodash,customFilters, filter, ioraConstants, ioraReportRest, ioraReportInfo, reportSchema, ioraPerfTagsSet, reportPerfStatistics, allFilters, filterStats,categories);

    // add scope filter, when present
    _processScopeFilters(_lodash,reportMetadata, scopeInfo, filterStats, reportSchema, filters, ioraConstants, ioraReportRest, ioraReportInfo, reportPerfStatistics, allFilters);

    // begin add standard date filter
    _processStandardDateFilters(reportMetadata, filterStats, filter, categories, ioraConstants, ioraReportRest, ioraReportInfo, reportSchema, ioraPerfTagsSet, reportPerfStatistics, allFilters);
    // end add standard date filter

    // add standard filters
    if (reportMetadata.standardFilters) {
        for (i = 0; i < reportMetadata.standardFilters.length; i++) {
            allFilters.push(_buildStandardFilter(
                reportMetadata.standardFilters[i],
                standardFilterInfos,
                filterStats.filterCount + 1,
                reportSchema))
            filterStats.filterCount += 1
        }
    }

    filters.reportFilters = allFilters
    filters.negativeopCnt = filterStats.negativeopCnt
    filters.nonoptimizableOpCnt = filterStats.nonoptimizableOpCnt

    // negative filter operators are present. The number of negative operators doesn't matter at
    // this point. They carry the same weight.

    _addPerfTagsForOperators(filterStats,'negativeopCnt','negativefilter',ioraReportRest, ioraPerfTagsSet,reportPerfStatistics,ioraConstants);

    _addPerfTagsForOperators(filterStats,'nonoptimizableOpCnt','wildCardfilter',ioraReportRest, ioraPerfTagsSet,reportPerfStatistics,ioraConstants);

    // Filter Logic builder for allFilters
    reportBooleanFilterLogic = reportMetadata.reportBooleanFilter
    // compute the boolean filter Logic
    filters.filterLogic = _mergeStdCustomFilterLogic(reportBooleanFilterLogic, allFilters.length, customFilters.length)
}

var _addPerfTagsForOperators=function(filterStats,operatorCntProperty,perfTagProperty,ioraReportRest, ioraPerfTagsSet,reportPerfStatistics,ioraConstants){

  if (filterStats[operatorCntProperty] > 0) {
      _addPerfTags(ioraConstants[perfTagProperty + 'Tag'], ioraConstants[perfTagProperty + 'Index'], ioraReportRest, ioraPerfTagsSet)
      reportPerfStatistics[perfTagProperty + 'HDCnt']++
  }

}

// build scope filter
var _buildScopeFilter = function(
    scope, scopeInfo, index, reportSchema
) {
    var filter = new reportSchema.reportFilterStruc()
    filter.sno = index
    filter.filterType = 'Scope'
    filter.field = '-'
    filter.operator = '-'
    filter.fieldAPI = ' '

    // translate scope using matching scopeInfo for this reportType
    for (i = 0; i < scopeInfo.length; i++) {
        if (scopeInfo[i].value === scope) {
            filter.value = scopeInfo[i].label
            break
            // TODO: Division needs testing
            // filter.value = scopeInfo[i].label + " (" + scopeInfo[i].allowsDivision + ")";
        }
    }

    return filter
}

// find the label given a field API name
var _findColumnLabel = function(
    column, categories
) {
    var fieldInfos = {}
    var tmpLabelStrs = [];
    for (k = 0; k < categories.length; k++) {
        if (categories[k].columns[column]) {
            var objLabel = categories[k].label

            fieldInfos.label = categories[k].columns[column].label

            if (fieldInfos.label.indexOf(':') !== -1) {
                tmpLabelStrs = fieldInfos.label.split(':')
                fieldInfos.objName = tmpLabelStrs[0]
            } else if (objLabel.indexOf(':') !== -1) {
                tmpLabelStrs = objLabel.split(':')
                fieldInfos.objName = tmpLabelStrs[0]
            } else if (objLabel.indexOf(' ') !== -1) {
                tmpLabelStrs = objLabel.split(' ')
                fieldInfos.objName = tmpLabelStrs[0]
            } else {
                fieldInfos.objName = objLabel
            }
            return fieldInfos
        }
    }
}

// build standard filter
var _buildStandardFilter = function(
    standardFilter, standardFilterInfos, index, reportSchema
) {
    var filter = new reportSchema.reportFieldStruc()
    filter.sno = index
    filter.filterType = 'Standard'
    filter.field = standardFilterInfos[standardFilter.name].label
    filter.operator = 'equals'
    filter.fieldAPI = standardFilter.name

    // translate standardFilter using matching standardFilterInfos for this reportType
    for (j = 0; j < standardFilterInfos[standardFilter.name].filterValues.length; j++) {
        if (standardFilterInfos[standardFilter.name].filterValues[j].name === standardFilter.value) {
            filter.value = standardFilterInfos[standardFilter.name].filterValues[j].label
            break
        }
    }

    return filter
}

var _mergeStdCustomFilterLogic = function(
    apiFilterLogic, allFiltersLength, customFiltersLength
) {
    if (!apiFilterLogic) {
        apiFilterLogic = '1'
        for (i = 0; i < allFiltersLength - 1; i++) {
            apiFilterLogic = apiFilterLogic + ' AND ' + (i + 2)
        }
    } else {
        apiFilterLogic = '(' + apiFilterLogic + ')'
        if (allFiltersLength > customFiltersLength) {
            for (i = customFiltersLength + 1; i < allFiltersLength + 1; i++) {
                apiFilterLogic = apiFilterLogic + ' AND ' + i
            }
        }
    }
    return apiFilterLogic
}
