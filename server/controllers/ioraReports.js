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
 * Controller for fetching reports information needed for Iora
 */
var async = require('async');

//load the models and controller to perform salesforce API calls and fetch the response.

module.exports = function(req, res) {

    //load the application middleware for the current request
    var app = req.app;

    //load the application constants
    var ioraConstants = app.models.ioraConstants;

    var reportPerfStatistics = {};
    _resetPerfStatCounts(reportPerfStatistics);



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

    //build params map from req

    var params = _constructRequestParams(req);



    //invoke the function to perform the report describe
    var restAPIPromises = batchRestUtilModel.genericDescribe(restUtilModel, _lodash, promiseModule, requestModule, params, 'reportIds');


    var ioraReportRest = [];
    var pendingReportInfoPromises = [];

    //report describe promise
    var reportDescribePromise = promiseModule.all(restAPIPromises).then(promiseModule.method(function(responses) {
        _lodash.each(responses, function(jsonResponse) {
            var transformResponse = ioraReportTransform.transformReportDescribe(
                reportSchema, _lodash, jsonResponse, ioraConstants, reportPerfStatistics);
            ioraReportRest.push(transformResponse);
        });

        return new promiseModule(function(resolve, reject) {
            resolve(ioraReportRest);
        });
    }));


    pendingReportInfoPromises.push(reportDescribePromise);

    //report performance promise
    var reportPerformancePromise = batchRestUtilModel.genericBatchRest(buildBatchRequestModel, restUtilModel, requestModule, params, 'reportIds');

    pendingReportInfoPromises.push(reportPerformancePromise);


    //report header promise
    var reportHeaderPromise = batchRestUtilModel.reportHeaderInfo(
        restUtilModel, requestModule, params
    );

    pendingReportInfoPromises.push(reportHeaderPromise);



    promiseModule.all(pendingReportInfoPromises).then(function(promiseResponses) {



        //create a map for describe
        var reportDescribeMap = [];
        var index = 0;
        _lodash.each(promiseResponses[0], function(descResponse) {
            reportDescribeMap[descResponse.generalInfo.Id] = descResponse;
            index++;
        });

        //create a map for performance result grouped by reportId
        var reportPerformanceMap = new Map();
        var reportIdList = params.get('reportIds');
        index = 0;
        _lodash.each(promiseResponses[1].results, function(perfResponse) {
            //always set 15 digit SF Id to be consistent.
            var reportKey = reportIdList[index].substring(0, 15);
            reportPerformanceMap.set(reportKey, perfResponse);
            index++;
        });

        var ioraResArr = ioraPromiseAggregator.reportPromiseAgg(
            reportDescribeMap, promiseResponses[2] // reportHeaderInfo
            , reportPerformanceMap // reportPerformance
            , _lodash, ioraReportPerfAnalyzer, reportSchema, ioraConstants, reportPerfStatistics
        );

        var reportRestResponse = new Object();
        reportRestResponse.reportStats = reportPerfStatistics;
        reportRestResponse.reportsInfo = ioraResArr;

        var responseStr = JSON.stringify(reportRestResponse);
        res.header('content-type', 'application/json;charset=UTF-8');
        res.setHeader('Content-Length', responseStr.length);
        res.send(responseStr);
        res.end();
        return res;

    });



};

_resetPerfStatCounts=function(statsObj){
  //reset perf numbers
  statsObj.optimalHSCnt = 0;
  statsObj.optimalUnscalableHSCnt = 0;
  statsObj.suboptimalUnhealthyHSCnt = 0;
  statsObj.suboptimalUnscalableHSCnt = 0;

  //reset perf numbers
  statsObj.optimalDesignCnt = 0;
  statsObj.suboptimalDesignCnt = 0;
  statsObj.criticalScalabilityCnt = 0;
  statsObj.warningScalabilityCnt = 0;
  statsObj.okScalabilityCnt = 0;

  //perf tags count
  statsObj.undeindexedHDCnt = 0;
  statsObj.wildcardfilterHDCnt = 0;
  statsObj.nonselectiveHDCnt = 0;
  statsObj.recordskewHDCnt = 0;
  statsObj.negativefilterHDCnt = 0;
  statsObj.nonoptimizableopHDCnt = 0;
  statsObj.lastmodifiedoptHDCnt = 0;
  statsObj.largedaterangeHDCnt = 0;
  statsObj.widescopeHDCnt = 0;
}

_constructRequestParams = function(req) {
    var params = new Map();
    //get the necessary inputs from the params
    params.set('instanceURL', req.body.instanceUrl);
    params.set('reportIds', req.body.reportIds.split(','));
    params.set('apiVer', req.body.apiVer);
    params.set('chunkSize', req.body.chunkSize);
    params.set('sessionId', req.body.sessionId);
    return params;
}
