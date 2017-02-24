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

module.exports = function(req, res) {

    //load the application middleware for the current request
    var app = req.app;

    //load the application constants
    var ioraConstants = app.models.ioraConstants;


    //load the necessary models
    var batchRestUtilModel = app.models.batchRestUtil;
    var buildBatchRequestModel = app.models.buildBatchRequest;
    var restUtilModel = app.models.restUtil;

    var _lodash = app.models._;
    var requestModule = app.models.request;
    var promiseModule = app.models.promise;
    var ioraReportTransform = app.models.ioraReportTransform;
    var reportSchema = app.models.ioraSchema;

    var ioraPromiseAggregator = app.models.ioraPromiseAggregator;
    var ioraReportPerfAnalyzer = app.models.ioraReportPerfAnalyzer;



    var params = ioraConstants.constructRequestParams(req,'reportIds');
    var perfHealthScoreArr = [];

    //report performance promise
    batchRestUtilModel.genericBatchRest(buildBatchRequestModel, restUtilModel, requestModule, params, 'reportIds').then(function(batchResponse) {


        if (batchResponse.results !== null && batchResponse.results !== undefined) {

            _lodash.each(batchResponse.results, function(explainPlan) {

                var perfHealthScore = {};
                if (explainPlan.result !== null && explainPlan.result !== undefined && explainPlan.statusCode === 200 && explainPlan.result.plans !== undefined && explainPlan.result.plans.length > 0) {
                    var healthScore = _computeHealthScore(explainPlan.result.plans[0], ioraConstants);
                    perfHealthScore.reportId = explainPlan.result.sourceQuery;
                    perfHealthScore.statusCode = 200;
                    perfHealthScore.healthScore = healthScore;
                    perfHealthScoreArr.push(perfHealthScore);
                }

            });
        }
        var responseStr = JSON.stringify(perfHealthScoreArr);
        res.header('content-type', 'application/json;charset=UTF-8');
        res.setHeader('Content-Length', responseStr.length);
        res.send(responseStr);
        res.end();
        return res;
    });
};

/*_constructRequestParams = function(req) {
    var params = new Map();
    //get the necessary inputs from the params
    params.set('instanceURL', req.body.instanceUrl);
    params.set('reportIds', req.body.reportIds.split(','));
    params.set('apiVer', req.body.apiVer);
    params.set('chunkSize', req.body.chunkSize);
    params.set('sessionId', req.body.sessionId);
    return params;
};*/

var _computeHealthScore = function(plan, ioraConstants) {

    var healthStatusInt = 0;


    if (plan.leadingOperationType === ioraConstants.tableScanOperation) {
        healthStatusInt = ioraConstants.designSubOptimalScore;
    } else {
        healthStatusInt = ioraConstants.designOptimalScore;
    }

    if (plan.sobjectCardinality > ioraConstants.unhealthyTableScan) {
        healthStatusInt *= ioraConstants.scalabilityCriticalScore;
    } else if (plan.sobjectCardinality > ioraConstants.unscalableTableScan) {
        healthStatusInt *= ioraConstants.scalabilityWarningScore;
    } else {
        healthStatusInt *= ioraConstants.scalabilityOKScore;
    }


    var healthScore = Number(Math.round((plan.relativeCost * plan.sobjectCardinality * healthStatusInt) + 'e2') + 'e-2');


    return healthScore;

};
