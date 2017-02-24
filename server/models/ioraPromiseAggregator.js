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
 * Node.js util function to aggregate the different promises from REST API calls to build the desired REST over REST
 */

 module.exports={
   /** 1. Function: reportPromiseAgg
   * Purpose: Aggregate report promises into desired response
   * Inputs:
   * @param : Describe report result after promise resolve
   * @param : Report Header result after promise resolve
   * @param : Report Performance result after promise resolve
   * Output : Transformed Iora Report schema as JSON string
   */
   reportPromiseAgg : function(
                                  reportDescResult
                                , reportHeaderResult
                                , reportPerformanceResult
                                , _lodash
                                , ioraReportPerfAnalyzerModel
                                , reportSchema
                                , ioraConstants
                                , reportPerfStatistics
                              ){
      //var ioraFinalResponse=new Map();
      var ioraFinalResponse=[];
      var planMap =new Map();
      //var planArr=[];
      var reportIds=[];




     for(var reportId in reportDescResult){
        if ({}.hasOwnProperty.call(reportDescResult, reportId)){
          var reportDescRes=reportDescResult[reportId];
          reportIds.push(reportDescRes.generalInfo.Id);
        }
      }

      _lodash.each(reportHeaderResult.records,function(reportHeader){
        if(reportHeader!== null || reportHeader !== undefined){
           var ioraReportRest=reportDescResult[reportHeader.Id];
           if(ioraReportRest!== null && ioraReportRest!== undefined){
              _processReportHeaders(ioraReportRest,reportHeader);
              reportDescResult[reportHeader.Id]=ioraReportRest;
           }

         }
      });



      //iterate through report performance responses


      _lodash.each(reportIds,function(reportId){

          var reportKey=reportId.substring(0, 15);

          var rptIdPerfResult=reportPerformanceResult.get(reportKey);

          if(rptIdPerfResult  && (rptIdPerfResult.result !== null || rptIdPerfResult.result !== undefined)){
              planMap.set(reportId,rptIdPerfResult.result.plans);
          }

      });

      _lodash.each(reportIds,function(reportId){
        var plans=planMap.get(reportId);

        var ioraReportRest=reportDescResult[reportId];


        if(ioraReportRest !== null && ioraReportRest !== undefined )
            ioraReportPerfAnalyzerModel.analyzeReportPerformance(
                                                             plans
                                                           , _lodash
                                                           , ioraReportRest
                                                           , reportSchema
                                                           , ioraConstants
                                                           , reportPerfStatistics);
         reportDescResult[reportId]=ioraReportRest;
         ioraFinalResponse.push(ioraReportRest);
      });
      return ioraFinalResponse;
   }

 };

 _processReportHeaders=function(ioraReportInfo,reportHeader){
   if(ioraReportInfo !== null || ioraReportInfo !== undefined){
       ioraReportInfo.generalInfo.reportFormat=reportHeader.Format;
       ioraReportInfo.generalInfo.description=reportHeader.Description;
       ioraReportInfo.generalInfo.createdById=reportHeader.CreatedById;
       ioraReportInfo.generalInfo.createdByName=reportHeader.CreatedBy.Name;
       ioraReportInfo.generalInfo.lastModifiedByName=reportHeader.LastModifiedBy.Name;
       ioraReportInfo.generalInfo.createdOn=reportHeader.CreatedDate;
       ioraReportInfo.generalInfo.ownedById=reportHeader.OwnerId;
       ioraReportInfo.generalInfo.lastModifiedById=reportHeader.LastModifiedById;
       ioraReportInfo.generalInfo.lastModifiedOn=reportHeader.LastModifiedDate;
       ioraReportInfo.generalInfo.lastRunDate=reportHeader.LastRunDate;
       ioraReportInfo.generalInfo.lastViewedDate=reportHeader.LastViewedDate;
       ioraReportInfo.generalInfo.systemModStamp=reportHeader.SystemModstamp;
       ioraReportInfo.generalInfo.nameSpacePrefix=reportHeader.NamespacePrefix;
     }
 };
