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
 * Controller for fetching dashboards information needed for Iora
 */
//load the models and controller to perform salesforce API calls and fetch the response.

module.exports = function(req, res) {
    //load the application middleware for the current request
    var app = req.app;

    //load the application constants
    var ioraConstants = app.models.ioraConstants;

    ioraConstants.dashoptimalHSCnt = 0;
    ioraConstants.dashOptimalUnscalable = 0;
    ioraConstants.dashSuboptimalUnhealthy = 0;
    ioraConstants.dashSuboptimalUnscalable = 0;

    //dash perf tags count
    ioraConstants.dashundeindexedHDCnt = 0;
    ioraConstants.dashwildcardfilterHDCnt = 0;
    ioraConstants.dashnonselectiveHDCnt = 0;
    ioraConstants.dashrecordskewHDCnt = 0;
    ioraConstants.dashnegativefilterHDCnt = 0;
    ioraConstants.dashnonoptimizableopHDCnt = 0;
    ioraConstants.dashlastmodifiedoptHDCnt = 0;

    //load the necessary models
    var batchRestUtilModel = app.models.batchRestUtil;
    var buildBatchRequestModel = app.models.buildBatchRequest;
    var restUtilModel = app.models.restUtil;
    var _lodash = app.models._;
    var requestModule = app.models.request;
    var promiseModule = app.models.promise;
    var ioraDashboardsTransform = app.models.ioraDashboardsTransform;
    var dashboardSchema = app.models.ioraSchema;




    var params = ioraConstants.constructRequestParams(req,'dashboardIds');

    var ioraDashboardRest = [];
    //invoke the function to perform the dashboard describe
    var restAPIPromises = batchRestUtilModel.genericDescribe(restUtilModel, _lodash, promiseModule, requestModule, params, 'dashboardIds');


    promiseModule.all(restAPIPromises).then(function(responses) {
        _lodash.each(responses, function(jsonResponse) {
            var transformResponse = ioraDashboardsTransform.transformDashboardDescribe(
                dashboardSchema, _lodash, jsonResponse, ioraConstants);
            ioraDashboardRest.push(transformResponse);
        });


        var responseStr = JSON.stringify(ioraDashboardRest);
        res.header('content-type', 'application/json;charset=UTF-8');
        res.setHeader('Content-Length', responseStr.length);
        res.send(responseStr);
        res.end();
        return res;

    });

};

/*_constructDashboardRequestParams = function(req) {

    var params = new Map();
    //get the necessary inputs from the params
    params.set('instanceURL', req.body.instanceUrl);
    params.set('dashboardIds', req.body.dashboardIds.split(','));
    params.set('apiVer', req.body.apiVer);
    params.set('chunkSize', req.body.chunkSize);
    params.set('sessionId', req.body.sessionId);
    return params;
};*/
