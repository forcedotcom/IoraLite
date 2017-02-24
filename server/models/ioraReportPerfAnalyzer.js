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
 * Node.js util function to analyze performance of reports in specific
 */

module.exports = {

    /** Function: analyzeReportPerformance
     * Purpose: Analyze report performance
     * Inputs:
     * @param : describeResponse -> reference to the salesforce JSON response
     * Output : Transformed Iora Report schema
     **/
    analyzeReportPerformance: function(plansArray, _lodash, ioraReportRest, reportSchema, ioraConstants, reportPerfStatistics) {
        var ioraReportInfo = new reportSchema.ioraReportInfo();
        var ioraPerfTagsSet = new Set();

        var ioraReportPerf;

        if (isValidObject(ioraReportRest.reportPerformance)) {
            ioraReportPerf = ioraReportRest.reportPerformance;
        } else {
            ioraReportPerf = new ioraReportInfo.performance();
        }

        ioraReportPerf.perfEncoding = 0;
        ioraReportPerf.healthScore = -100;

        _parseExplainPlans(reportSchema, ioraReportPerf, plansArray, _lodash, ioraReportRest, ioraConstants, reportPerfStatistics, ioraPerfTagsSet);
        ioraReportRest.reportPerformance = ioraReportPerf;
        return ioraReportRest;
    }

};

var _populateReportFilters = function(_lodash, reportFilters, rptFilterObj, planSObjCardinality, ioraConstants, rptFiltersAddlnCondn) {
    if (isValidObject(reportFilters) && reportFilters.length > 0 && rptFiltersAddlnCondn) {
        _lodash.forEach(reportFilters, function(reportFilter) {
            // only standard date filter fields have object names
            _populateReportFilter(reportFilter, rptFilterObj, planSObjCardinality, ioraConstants);
        });
    }
}

var _populateReportFilter = function(reportFilter, rptFilterObj, planSObjCardinality, ioraConstants) {
    if (isValidObject(reportFilter.object) && isValidObject(reportFilter.popOverText) && (!isValidObject(reportFilter.popOverClass))) {
        if (reportFilter.object.indexOf(rptFilterObj) !== -1 || rptFilterObj.indexOf(reportFilter.object) !== -1) {
            // update object name to true object name.
            reportFilter.object = rptFilterObj;

            if (planSObjCardinality > ioraConstants.unhealthyTableScan) {
                reportFilter.popOverClass = 'danger';
            } else if (planSObjCardinality > ioraConstants.unscalableTableScan) {
                reportFilter.popOverClass = 'warning';
            } else {
                reportFilter.popOverClass = 'info';
            }
        }
    }
}

var _populateExecutePlanStrucPerfTags = function(popOverProperty, recTitleProperty, recDescProperty, tagNameProperty, tagIndexProperty, statProperty, _executionPlanStruc, reportPerfStatistics, recommendationMap, ioraReportPerf, ioraPerfTagsSet, ioraConstants) {
    _executionPlanStruc.popOverText = ioraConstants[popOverProperty];

    rectitle = ioraConstants[recTitleProperty];
    recdescription = ioraConstants[recDescProperty];

    if (recommendationMap.get(rectitle) === null) {
        recommendationMap.set(rectitle, recdescription);
    }


    _addPerfTags(ioraConstants[tagNameProperty], ioraConstants[tagIndexProperty], ioraReportPerf, ioraPerfTagsSet);
    reportPerfStatistics[statProperty]++;
}

var _populatePlanPerfTags = function(plan, ioraConstants, _executionPlanStruc, recommendationMap, ioraReportPerf, ioraPerfTagsSet, reportPerfStatistics, chosenPlanCost) {
    if (plan.leadingOperationType === ioraConstants.indexOperation &&
        plan.sobjectCardinality > ioraConstants.nonSelectiveCardinality &&
        chosenPlanCost !== 0
    ) {

        _populateExecutePlanStrucPerfTags('nonSelectivePopOver', 'nonSelectiveRecTitle', 'nonSelectiveRecDescription', 'nonSelectiveTag', 'nonSelectiveIndex', 'nonselectiveHDCnt', _executionPlanStruc, reportPerfStatistics, recommendationMap, ioraReportPerf, ioraPerfTagsSet, ioraConstants);

    } else if (
        plan.fields !== null && (plan.fields[0] === ioraConstants.ownerIdField) &&
        plan.cardinality >= ioraConstants.recordSkewCardinality
    ) {

        _populateExecutePlanStrucPerfTags('recordSkewPopOver', 'recordSkewRecTitle', 'recordSkewRecDescription', 'recordSkewTag', 'recordSkewIndex', 'recordskewHDCnt', _executionPlanStruc, reportPerfStatistics, recommendationMap, ioraReportPerf, ioraPerfTagsSet, ioraConstants);


    }
}

var isValidObject = function(obj) {
    return (obj !== null && obj !== undefined);
}

var _setSharingFlag = function(leadingOperationType, ioraReportPerf, ioraConstants) {
    if (leadingOperationType === ioraConstants.sharingOperation) {
        ioraReportPerf.isSharing = true;
    }
}


var _analyzePlanSubsequentsRows = function(
    _executionPlanStruc, plan, chosenPlanCost, recommendationMap, ioraReportPerf, ioraConstants, reportPerfStatistics, ioraPerfTagsSet, healthScoreArr, reportFilters, _lodash) {
    //variable declaration for recommendation title and description
    var rectitle = '';
    var recDescription = '';
    if (!isValidObject(plan)) {
        return;
    }

    _setSharingFlag(plan.leadingOperationType, ioraReportPerf, ioraConstants);

    // same as first row object in explain plan
    if (plan.sobjectType === ioraReportPerf.object) {
        ioraReportPerf.sumRelativeCosts += plan.relativeCost;
    }


    _populateReportFilters(
        _lodash,
        reportFilters,
        plan.sobjectType, //object
        plan.sobjectCardinality, //planSObjCardinality
        ioraConstants,
        true //rptFilters Additional condition
    );

    _populatePlan(healthScoreArr[plan.sobjectType]);

    _populatePlanPerfTags(plan, ioraConstants, _executionPlanStruc, recommendationMap, ioraReportPerf, ioraPerfTagsSet, reportPerfStatistics, chosenPlanCost);

};

var _assessReportDesign = function(plan, ioraConstants, ioraReportPerf, reportPerfStatistics) {
    if (plan.leadingOperationType === ioraConstants.tableScanOperation) {
        ioraReportPerf.designClass = ioraConstants.designSubOptimalClass;
        ioraReportPerf.designStatus = ioraConstants.designSubOptimal;
        ioraReportPerf.designStatusInt = 1;


        if (plan.cardinality / plan.sobjectCardinality < 0.5) {
            ioraReportPerf.healthStatusInt = ioraConstants.designSubOptimalScore;
        } else {
            ioraReportPerf.healthStatusInt = ioraConstants.designOptimalScore;
        }
        // ioraReportPerf.healthStatusInt=plan.relativeCost;
        reportPerfStatistics.suboptimalDesignCnt++;
    } else {
        ioraReportPerf.designClass = ioraConstants.designOptimalClass;
        ioraReportPerf.designStatus = ioraConstants.designOptimal;
        ioraReportPerf.designStatusInt = 0;

        ioraReportPerf.healthStatusInt = ioraConstants.designOptimalScore;
        reportPerfStatistics.optimalDesignCnt++;
    }
}

var _setScalabilityPerfStats = function(ioraReportPerf, ioraConstants, reportPerfStatistics, scalabilityStatus, overallHealthObj, integerStatus, planSObjCardinality) {
    var scalabilityStatusVal = 'scalability';
    var planMultiplier = 1;
    ioraReportPerf.scalabilityStatus = ioraConstants[scalabilityStatusVal + scalabilityStatus];
    ioraReportPerf.scalabilityStatusClass = ioraConstants[scalabilityStatusVal + scalabilityStatus + 'Class'];
    if (overallHealthObj) {
        planMultiplier = ((planSObjCardinality / ioraConstants[overallHealthObj.healthStatus + 'TableScan']) * overallHealthObj.multiplier);
    }
    ioraReportPerf.healthStatusInt *= ioraConstants[scalabilityStatusVal + scalabilityStatus + 'Score'] * planMultiplier;
    reportPerfStatistics[scalabilityStatus.toLowerCase() + 'ScalabilityCnt']++;
    ioraReportPerf.scalabilityStatusInt = integerStatus;
}

var _assessReportScalability = function(plan, ioraConstants, ioraReportPerf, reportPerfStatistics) {
    if (plan.sobjectCardinality > ioraConstants.unhealthyTableScan) {
        _setScalabilityPerfStats(ioraReportPerf, ioraConstants, reportPerfStatistics, 'Critical', {
            healthStatus: 'unhealthy',
            multiplier: 1000
        }, 2, plan.sobjectCardinality);
    } else if (plan.sobjectCardinality > ioraConstants.unscalableTableScan) {
        _setScalabilityPerfStats(ioraReportPerf, ioraConstants, reportPerfStatistics, 'Warning', {
            healthStatus: 'unscalable',
            multiplier: 100
        }, 1, plan.sobjectCardinality);
    } else {
        _setScalabilityPerfStats(ioraReportPerf, ioraConstants, reportPerfStatistics, 'OK', null, 0, null);
    }
}

var _setSubOptimalHealthPerfStats = function(ioraReportPerf, reportPerfStatistics, overallHealthStatus, ioraConstants, ioraPerfTagsSet, statCntProperty) {
    ioraReportPerf.healthStatusClass = ioraConstants[overallHealthStatus + 'healthStatusClass'];
    ioraReportPerf.healthStatus = ioraConstants[overallHealthStatus + 'HealthStatus'];
    ioraReportPerf.perfSummary = ioraConstants[overallHealthStatus + 'PerfSummary'];
    ioraReportPerf.perfClassInt = ioraConstants[overallHealthStatus + 'HealthStatusInt'];
    _addPerfTags(ioraConstants[overallHealthStatus + 'Tag'], ioraConstants[overallHealthStatus + 'Index'], ioraReportPerf, ioraPerfTagsSet);
    reportPerfStatistics[statCntProperty]++;
}

var _assessOverallHealth = function(ioraReportPerf, ioraConstants, ioraPerfTagsSet, reportPerfStatistics, recommendationMap) {
    if (ioraReportPerf.designStatus === ioraConstants.designSubOptimal) {
        if (ioraReportPerf.scalabilityStatus === ioraConstants.scalabilityCritical) {
            _setSubOptimalHealthPerfStats(ioraReportPerf, reportPerfStatistics, 'unhealthy', ioraConstants, ioraPerfTagsSet, 'suboptimalUnhealthyHSCnt');
        } else if (ioraReportPerf.scalabilityStatus === ioraConstants.scalabilityWarning) {
            _setSubOptimalHealthPerfStats(ioraReportPerf, reportPerfStatistics, 'unscalable', ioraConstants, ioraPerfTagsSet, 'suboptimalUnscalableHSCnt');
            var rectitle = ioraConstants.unscalableRecTitle;
            var recdescription = ioraConstants.unscalableRecDescription;
            recommendationMap.set(rectitle, recdescription);
        } else {
            _setSubOptimalHealthPerfStats(ioraReportPerf, reportPerfStatistics, 'notTrulyScalable', ioraConstants, ioraPerfTagsSet, 'optimalUnscalableHSCnt');
        }
    } else {
        if (ioraReportPerf.scalabilityStatus === ioraConstants.scalabilityCritical || ioraReportPerf.scalabilityStatus === ioraConstants.scalabilityWarning) {
            ioraReportPerf.perfSummary = ioraConstants.optimalUnscalablePerfSummary;
        } else {
            ioraReportPerf.perfSummary = ioraConstants.optimalPerfSummary;
        }
        ioraReportPerf.healthStatusClass = ioraConstants.optimalhealthStatusClass;
        ioraReportPerf.healthStatus = ioraConstants.optimalHealthStatus;
        ioraReportPerf.perfClassInt = ioraConstants.optimalHealthStatusInt;
        reportPerfStatistics.optimalHSCnt++;
    }
}

var _populatePlan = function(healthScoreObj, plan) {
    if (!isValidObject(healthScoreObj) || healthScoreObj.relativeCost > plan.relativeCost) {
        healthScoreObj = plan;
    }
}

var _analyzePlanFirstRow = function(
    reportSchema, ioraReportPerf, plan, recommendationMap, ioraConstants, reportPerfStatistics, ioraPerfTagsSet, healthScoreArr, reportFilters, _lodash
) {
    var recommendation = new reportSchema.recommendationStruc();
    var chosenPlanCost = 0;

    var indexMultiplier = false;
    // if sharing is a leading operation type, set it in the JSON.
    _setSharingFlag(plan.leadingOperationType, ioraReportPerf, ioraConstants);

    // ioraReportPerf.healthStatusInt=plan.relativeCost;

    // Infer/Assess report design
    // Table scan operation is sub-optimal.
    _assessReportDesign(plan, ioraConstants, ioraReportPerf, reportPerfStatistics);

    // Assess object cardinality for scalability
    _assessReportScalability(plan, ioraConstants, ioraReportPerf, reportPerfStatistics);

    _populatePlan(healthScoreArr[plan.sobjectType]);

    // loop through report filters and assign the color based on scalability.
    // dealing with standard date filters only, so not handling for _ in object name.
    if (isValidObject(reportFilters)) {
        _populateReportFilters(
            _lodash,
            reportFilters,
            ioraReportPerf.object, //object
            plan.sobjectCardinality, //planSObjCardinality
            ioraConstants,
            isValidObject(reportFilters.popOverText) //rptFilters Additional condition
        );
    }
    ioraReportPerf.object = plan.sobjectType;

    chosenPlanCost = plan.relativeCost;

    //assess overall health
    _assessOverallHealth(ioraReportPerf, ioraConstants, ioraPerfTagsSet, reportPerfStatistics, recommendationMap);

    ioraReportPerf.healthScoreMult1 = Number(Math.round((plan.relativeCost * plan.sobjectCardinality * ioraReportPerf.healthStatusInt) + 'e2') + 'e-2');


    ioraReportPerf.healthScore = Number(Math.round((plan.relativeCost * plan.sobjectCardinality) + 'e2') + 'e-2');


    return chosenPlanCost;
};

var _addPerfTags = function(perfTagName, perfTagIndex, ioraReportPerf, ioraPerfTagsSet) {
    if (!ioraPerfTagsSet.has(perfTagName)) {
        if (ioraReportPerf.perfTags !== null && ioraReportPerf.perfTags !== undefined && ioraReportPerf.perfTags.length > 0) {
            ioraReportPerf.perfTags += ',';
        } else {
            ioraReportPerf.perfTags = '';
            ioraReportPerf.perfEncoding = 0;
        }
        ioraReportPerf.perfTags += perfTagName;
        ioraReportPerf.perfEncoding += Math.pow(2, perfTagIndex);
        ioraPerfTagsSet.add(perfTagName);
    }
};

var _ignoreOptimizerWarning = function(fields, description, _lodash, ioraConstants) {
    var ignoreOptimizerNote = false;

    var descriptionUpperCase = description.toUpperCase();

    var specialFields = ioraConstants.specialFields;
    _lodash.forEach(specialFields, function(specialField) {
        if (specialField === fields) {
            ignoreOptimizerNote = true;
        }
    });

    var specialStrings = ioraConstants.specialStrings;
    _lodash.forEach(specialStrings, function(specialString) {
        var specialStrUpper = specialString.toUpperCase();

        if (descriptionUpperCase.indexOf(specialStrUpper) !== -1) {
            ignoreOptimizerNote = true;
        }
    });

    return ignoreOptimizerNote;
};

var _populateOptimizeNoteStruc = function(optimizerNote, optimizerNotesStruc, recommendationMap,reportPerfStatistics, ioraReportPerf, ioraPerfTagsSet, _lodash, ioraConstants) {
    var dimensionConditionMap = {
        'lastModifiedDate': (optimizerNotesStruc.field === 'LastModifiedDate'),
        'unindexed': (optimizerNote.description.indexOf(ioraConstants.optimizerTextUnindexed) !== -1),
        'nonOptimizable': (optimizerNote.description.indexOf(ioraConstants.optimizerTextNonOptimizable) !== -1)
    }

    for (var dimension in dimensionConditionMap) {
        if ({}.hasOwnProperty.call(dimensionConditionMap, dimension)) {
            _populateOptimizeNotePerDimension(dimensionConditionMap[dimension],
                optimizerNote,
                optimizerNotesStruc,
                recommendationMap,
                reportPerfStatistics,
                ioraReportPerf,
                ioraPerfTagsSet,
                _lodash,
                ioraConstants,
                dimension
            );
        }
    }
}



var _populateOptimizerNoteDetail = function(
    reportSchema, ioraReportPerf, plan, _lodash, recommendationMap, optimizerNoteMap, ioraConstants, reportPerfStatistics, ioraPerfTagsSet
) {
    var recTitle = '';
    var recDescription = '';

    var notesStrucCondition = false;
    _lodash.each(plan.notes, function(optimizerNote) {
        var key = optimizerNote.tableEnumOrId + optimizerNote.fields.toString() + optimizerNote.description;

        var mapValue=optimizerNoteMap.get(key);


        if ((optimizerNoteMap.get(key) !== null &&  optimizerNoteMap.get(key) !== undefined) ||
            (_ignoreOptimizerWarning(optimizerNote.fields.toString(), optimizerNote.description, _lodash, ioraConstants))
        ) {
            // key already exists or is an optimizer note that needs to be ignored.
            return;
        }

        var optimizerNotesStruc = new reportSchema.optimizerNotesStruc();
        optimizerNotesStruc.obj = optimizerNote.tableEnumOrId;
        optimizerNotesStruc.field = optimizerNote.fields.toString();
        optimizerNotesStruc.notes = optimizerNote.description;


        _populateOptimizeNoteStruc(optimizerNote, optimizerNotesStruc,recommendationMap, reportPerfStatistics, ioraReportPerf, ioraPerfTagsSet, _lodash, ioraConstants);


        // populate the map
        optimizerNoteMap.set(key, optimizerNotesStruc);

        if (ioraReportPerf.optimizerNotes === null || ioraReportPerf.optimizerNotes === undefined) {
            ioraReportPerf.optimizerNotes = new Array();
        }
        ioraReportPerf.optimizerNotes.push(optimizerNotesStruc);
    });
};

var _populateOptimizeNotePerDimension = function(
    condition,
    optimizerNote,
    optimizerNotesStruc,
    recommendationMap,
    reportPerfStatistics,
    ioraReportPerf,
    ioraPerfTagsSet,
    _lodash,
    ioraConstants,
    dimension
) {

    var recTitleText = ioraConstants[dimension + 'RecTitle'];
    var recDescText = ioraConstants[dimension + 'RecDescription'];
    var classification = ioraConstants[dimension + 'Tag'];
    var perfTagIndex = ioraConstants[dimension + 'Index'];
    var popOverText = ioraConstants[dimension + 'PopOver'];

    if (optimizerNote.description !== null &&
        condition &&
        !(_ignoreOptimizerWarning(optimizerNote.fields.toString(), optimizerNote.description, _lodash, ioraConstants))
    ) {

        if (recommendationMap.get(recTitleText) === null || recommendationMap.get(recTitleText) === undefined) {
            recommendationMap.set(recTitleText, recDescText);
        }

        _addPerfTags(classification, perfTagIndex, ioraReportPerf, ioraPerfTagsSet);
        if (classification === (ioraConstants.nonOptimizableTag)) {
            reportPerfStatistics.nonoptimizableopHDCnt++;
        } else if (classification === (ioraConstants.unindexedTag)) {
            reportPerfStatistics.undeindexedHDCnt++;
        }


        optimizerNotesStruc.popoverText = popOverText;
        optimizerNotesStruc.classification = classification;
    }

}

var _populateExplainPlanDetail = function(reportSchema, rowIndex, plan) {
    // initialize a new execution plan structure
    var executionPlanStruc = new reportSchema.executionPlanStruc();
    executionPlanStruc.leadingOperationType = plan.leadingOperationType;
    executionPlanStruc.obj = plan.sobjectType;
    if (plan.fields !== null) {
        executionPlanStruc.fields = plan.fields.toString();
    }
    executionPlanStruc.cardinality = plan.cardinality;
    executionPlanStruc.objNoOfRecords = plan.sobjectCardinality;
    executionPlanStruc.relativeCost = plan.relativeCost;
    return executionPlanStruc;
};

var _computeRecClassification = function(ioraConstants, recommendationStruc) {
    var recommendationStrucMap = [{
            title: ioraConstants.nonSelectiveRecTitle,
            classification: ioraConstants.nonSelectiveTag
        },
        {
            title: ioraConstants.recordSkewRecTitle,
            classification: ioraConstants.recordSkewTag
        },
        {
            title: ioraConstants.unindexedRecTitle,
            classification: ioraConstants.unindexedTag
        },
        {
            title: ioraConstants.nonOptimizableNotesRecTitle,
            classification: ioraConstants.nonOptimizableTag
        },
        {
            title: ioraConstants.negativeopRecTitle,
            classification: ioraConstants.negativefilterTag
        },
        {
            title: ioraConstants.nonoptimizableopRecTitle,
            classification: ioraConstants.wildCardfilterTag
        },
        {
            title: ioraConstants.unscalableRecTitle,
            classification: ioraConstants.unscalableTag
        },
        {
            title: ioraConstants.largeDateRangeRecTitle,
            classification: ioraConstants.largeDateRangeFilterTag
        },
        {
            title: ioraConstants.lastModifiedDateRecTitle,
            classification: ioraConstants.lastModifiedDateTag
        }
    ];

    if (recommendationStrucMap.hasOwnProperty(recommendationStruc.title)) {
        recommendationStruc.classification = recommendationStrucMap[recommendationStruc.title];
    } else {
        recommendationStruc.classification = ioraConstants.unknownClassificationTag;
    }
};

var _parseExplainPlans = function(reportSchema, ioraReportPerf, plans, _lodash, ioraReportRest, ioraConstants, reportPerfStatistics, ioraPerfTagsSet) {
    var healthScoreArr = [];
    var firstPlanAnalyzed = false;
    var chosenPlanCost = 0;
    var rowIndex = 1;
    var title;

    // create a recommendation map to store the title and description of the recommendation with title as key.
    var recommendationMap = new Map();

    // create a optimizerNoteMap map to store the title, fields and notes with the combination as key.
    var optimizerNoteMap = new Map();

    if (ioraReportPerf.recommendations !== null || ioraReportPerf.recommendations !== undefined) {
        _lodash.each(ioraReportPerf.recommendations, function(recommendation) {
            recommendationMap.set(recommendation.title, recommendation.description);
        });
    }

    ioraReportPerf.sumRelativeCosts = 0;

    // set sharing as false as default.
    ioraReportPerf.isSharing = false;

    // iterate through each plan
    _lodash.each(plans, function(plan) {
        var _executionPlanStruc = _populateExplainPlanDetail(reportSchema, rowIndex, plan);
        // analyzing the top most plan
        if (!firstPlanAnalyzed) {
            chosenPlanCost = _analyzePlanFirstRow(reportSchema, ioraReportPerf, plan, recommendationMap, ioraConstants, reportPerfStatistics, ioraPerfTagsSet, healthScoreArr, ioraReportRest.reportFilters.reportFilters, _lodash);
            firstPlanAnalyzed = true;

            _populateOptimizerNoteDetail(reportSchema, ioraReportPerf, plan, _lodash, recommendationMap, optimizerNoteMap, ioraConstants, reportPerfStatistics, ioraPerfTagsSet);

            // push execution plans for first row
            if (ioraReportPerf.executionPlans === null || ioraReportPerf.executionPlans === undefined) {
                ioraReportPerf.executionPlans = new Array();
            }
            ioraReportPerf.executionPlans.push(_executionPlanStruc);

            return;
        }
        _analyzePlanSubsequentsRows(_executionPlanStruc, plan, chosenPlanCost, recommendationMap, ioraReportPerf, ioraConstants, reportPerfStatistics, ioraPerfTagsSet, healthScoreArr, ioraReportRest.reportFilters.reportFilters, _lodash);
        // push execution plans
        ioraReportPerf.executionPlans.push(_executionPlanStruc);

        rowIndex++;
    });

    var mapKeys = recommendationMap.keys();

    // re-initialize the recommendations array even if values were present from filters.
    // The values have been re-populated in the map.
    ioraReportPerf.recommendations = new Array();

    // loop through the map and set the values
    while ((title = mapKeys.next().value)) {
        var recommendationStruc = new reportSchema.recommendationStruc();
        recommendationStruc.title = title;
        recommendationStruc.description = recommendationMap.get(title);
        // compute and set the recommendation classification based on rec title for now.
        _computeRecClassification(ioraConstants, recommendationStruc);
        ioraReportPerf.recommendations.push(recommendationStruc);
    }

    ioraReportRest.reportPerformance = ioraReportPerf;
};
