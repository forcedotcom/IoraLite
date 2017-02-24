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

         /** 1. Function: genericDescribe
         * Purpose: Generic function to perform both report and dashboard describes
         * Inputs:
         * @param : restUtilModel -> reference to the model that helps with performing promise based SFDC rest API requests
         * @param : _lodash -> reference to the lodash module for iteration
         * @param : promiseModule -> reference to bluebird promise module
         * @param : requestModule -> reference to the module that helps with http/https requests.
         * @param : params        -> input parameters needed for the batch rest call
         * @param : idProperty    -> the name of the property that has the id in the input @params.
         * Output : Report Describe promise
         **/

         genericDescribe : function(restUtilModel,_lodash,promiseModule,requestModule,params,idProperty){
           //create an array to store the promises for each report calls
           var restAPIPromises=[];

           var genericParams=_fetchGenericParams(params);

           //get the necessary inputs from the params
           var Ids=params.get(idProperty);


            _lodash.each(Ids,function(Id){
              if(Id){
               var idPrefix=Id.substring(0,3);
               var _descEndPoint=('00O' === idPrefix)?_reportDescribeURL(Id,genericParams.apiVer):_dashboardDescribeURL(Id,genericParams.apiVer);
               restAPIPromises.push(
                  restUtilModel.sfdcRestReq(
                                             requestModule
                                            , Id
                                            , genericParams.sessionId
                                            , genericParams.instanceURL
                                            , genericParams.apiVer
                                            ,_descEndPoint
                                            ,'GET'
                                            ,' '
                                          )
                                      )
              }
          });
          return restAPIPromises;
        },
        /** 1. Function: genericBatchRest
        * Purpose: generic function to fetch information via the batch rest api call
        * Inputs:
        * @param : buildBatchRequestModel -> reference to the model that helps with constructing batch requests
        * @param : restUtilModel -> reference to the model that helps with performing promise based SFDC rest API requests
        * @param : requestModule -> reference to the request module that helps with performing http/https requests
        * @param : params        -> input parameters needed for the batch rest call
        * @param : idProperty    -> property name of entity IDs in @params input
        * Output : Response promises
        **/

        genericBatchRest : function(buildBatchRequestModel,restUtilModel,requestModule,params,idProperty){
          //get the necessary inputs from the params
          var idString=params.get(idProperty).toString();
          var Ids=idString.split(',');

          var genericParams=_fetchGenericParams(params);

          //call the function to build the JSON for batch rest API post
          var postBody=buildBatchRequestModel.buildBatchRestReqs(
                                                                Ids
                                                              , genericParams.apiVer
                                                              , genericParams.chunkSize
                                                              , (idProperty === 'reportIds')
                                                             );

           var endPoint=["","services","data","v" + genericParams.apiVer,"composite","batch"].join("/");
           var idField="";
           return restUtilModel.sfdcRestReq(
                                     requestModule
                                   , idField
                                   , genericParams.sessionId
                                   , genericParams.instanceURL
                                   , genericParams.apiVer
                                   , endPoint
                                   , 'POST'
                                   , postBody);
        },



          /** 1. Function: reportHeaderInfo
          * Purpose: Fetch header information for interested report IDs
          * Inputs:
          * @param : requestModule -> reference to the module that helps with http/https requests.
          * @param : params        -> input parameters needed for the batch rest call
          * Output : Report Header Info Promise
          **/

          reportHeaderInfo : function(restUtilModel,requestModule,params){

            //get the necessary inputs from the params
            var reportIds=params.get('reportIds');
            var genericParams=_fetchGenericParams(params);

            return restUtilModel.sfdcRestReq(
                                           requestModule
                                         , reportIds
                                         , genericParams.sessionId
                                         , genericParams.instanceURL
                                         , genericParams.apiVer
                                         , _reportHeaderInfo(reportIds,genericParams.apiVer)
                                         , 'GET'
                                         , ' '
                                       );


          }


};

var _fetchGenericParams=function(params){
  var genericParams={};
  genericParams.instanceURL=params.get('instanceURL');
  genericParams.apiVer=params.get('apiVer');
  genericParams.sessionId=params.get('sessionId');
  genericParams.chunkSize=params.get('chunkSize');
  return genericParams;
}

 _reportDescribeURL = function(reportId,apiVer){
   //"v34.0/analytics/reports/001D000000K0fXOIAZ/describe"
   return ["services","data","v" + apiVer , "analytics","reports", reportId , "describe" ].join('/');
};

_dashboardDescribeURL = function(dashboardId,apiVer){
  //"v34.0/analytics/dashboards/01ZD000000K0favDIAZ"
  return ["services","data","v" + apiVer , "analytics","dashboards", dashboardId].join('/');
};

//function to invoke a report explainPlan call
_reportHeaderInfo=function(reportIds,apiVer){
   //"v34.0/query/?q="
   return (["services","data","v" + apiVer , "query"].join("/")) .concat("?q=").concat( _constructHeaderQuery(reportIds)) ;

};

_constructHeaderQuery=function(reportIds){
    var baseQuery='select Id,Description,LastRunDate,LastModifiedDate,LastModifiedBy.name,LastModifiedById,CreatedById,CreatedBy.Name,CreatedDate,Format,NamespacePrefix,OwnerId,SystemModstamp,LastViewedDate,DeveloperName from Report where Id in ';
    baseQuery+=_stringifyQuery(reportIds);
    return baseQuery;
}

_stringifyQuery=function(reportIds){
     //var reportIdArr=reportIds.split(",");
    var queryString="(";
    for(var index=0;index < reportIds.length;index++){
      if(queryString.length > 1){
        queryString+=",";
      }
      queryString+="'" + reportIds[index] + "'";
    }
    queryString+=")";
    return queryString;
}
