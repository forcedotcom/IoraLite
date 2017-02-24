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
 * Node.js util function to invoke batch rest calls to salesforce
 */
 module.exports={
          /*
          * 1. Function: buildBatchReportRestReqs
          * Purpose: build batch report rest requests for the batch rest api call
          * Inputs:
          * @param : reportIds -> list of reportIds interested for data fetch
          * @param : chunkSize -> current value is 25 for max number of api calls per batch requests. This param provides the *ability to increase chunk size should the platform
          *          support more later
          * Output : list of strings that denote each chunk requests
          */

          // for each report there are two api calls needed: describe and explainPlan
          // currently for the available chunk size (25), a maximum of 12 reports can be fetched in a single batch call.
          buildBatchRestReqs : function(Ids,apiVer,chunkSize,isReport){
            //an array to store all the restRequests
            var restRequests=new Array();
            for(var index=0;index<Ids.length;index++){
              if(isReport){
                 _constructSingleReportRequest(Ids[index],apiVer,restRequests);
              }
              else{
                 _constructSingleDashboardRequest(Ids[index],apiVer,restRequests);
              }

            }

            return _constructJSON(restRequests);
          }
};

 //function to construct the JSON request for the batch request
 _constructJSON =function(restRequests){
     var batchReqInstance = new Object();
     batchReqInstance.batchRequests=restRequests;
     return JSON.stringify(batchReqInstance);
 };

 //function to construct the request for a single dashboardId
 //designed as a seperate function call so as to expand api calls to rest batch in future
 _constructSingleDashboardRequest=function(dashboardId,apiVer,restRequests){
      restRequests.push(_dashboardDescribe(dashboardId,apiVer));
 };

 //function to construct the request for a single reportId
 //designed as a seperate function call so as to expand api calls to rest batch in future
 _constructSingleReportRequest=function(reportId,apiVer,restRequests){
      restRequests.push(_reportExplainPlan(reportId,apiVer));
 };
 
 //function to invoke a dashboard describe call
 _dashboardDescribe=function(dashboardId,apiVer){
      descReq=new Object();
      //"v34.0/analytics/reports/001D000000K0fXOIAZ/describe"
      var url= ["v" + apiVer , "analytics","dashboards", dashboardId , "describe" ].join('/');
      descReq.url=url;
      descReq.richInput=dashboardId;
      descReq.method='GET';
      return descReq;
 };

 //function to invoke a report explainPlan call
 _reportExplainPlan=function(reportId,apiVer){
      expPlanReq=new Object();
      //"v34.0/query?explain=001D000000K0fXOIAZ"
      var url= ["v" + apiVer , "query","?explain=" + reportId].join('/');
      expPlanReq.url=url;
      expPlanReq.method='GET';
      expPlanReq.richInput=reportId;
      return expPlanReq;
 };
