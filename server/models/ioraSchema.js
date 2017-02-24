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
 * Model to define the schema structure of the REST reponse for the API exposed
 * by Iora
 */

 //the higher level dashboard schema
 this.ioraDashboardRest = function(){
   generalInfo = "";
 };

//the higher level report schema
this.ioraReportRest = function(){
  //variables to store the JSON
  generalInfo = "";
  reportStructure = "";
  reportFilters = "";
  reportPerformance = "";
  errorInfo = ""
};

//detailed structures for dashboard info.
this.ioraDashboardInfo = function(){
  this.generalInfo = function()  {
    Id = "";
    folderId = "";
    developerName = "";
    runningUser = "";
    componentInfo = [];
    errorInfos = []
  }


};

this.dashboardComponentInfo = function(){
   componentId = " ";
   componentName = " ";
   componentType = " ";
   refreshDate = " ";
   typeName = " "
}

this.errorInfo = function() {
  Id ="";
  errorCode = "";
  errorMessage = "";
  Name = "";
  errorSeverity = "";
  AddlnInfo = ""
}

//highlest level rest response structure for Iora report REST API
this.ioraReportInfo = function (){
  this.generalInfo = function()  {
       Id="";
       folderId = "";
       developerName = "";
       entityType = "";
       Name= "";
       reportFormat="";
       description="";
       reportType = "";
       createdById = "";
       createdOn = " ";
       ownedById = " ";
       lastModifiedById = " ";
       lastRunDate = " ";
       systemModStamp = " ";
       lastViewedDate = " ";
       nameSpacePrefix = " ";
       lastModifiedOn = " "

  };
  this.errorInfo = function() {
    Id ="";
    errorCode = "";
    errorMessage = "";
    Name = "";
    errorSeverity = "";
    AddlnInfo = ""
  };
  this.structure = function(){
    reportFields = [];
    reportGroups = [];
    errorMessage = " "
  };
  this.filters = function(){
     filterLogic = " ";
     reportFilters = [];
     negativeOperatorCnt = 0;
     nonoptimizableOperatorCnt = 0;
     errorMessage = " "
  };

  this.performance = function(){
     healthSubStatus = "";
     healthStatus="";
     healthScore=	0;
     perfTags = "";
     perfEncoding = 0;
     perfSummary = " ";
     executionPlans = [ ];
     optimizerNotes = [ ];
     recommendations = [ ]
  }

};

//detail data structure needed for Iora report rest API
this.reportFieldStruc = function(){
    fieldName      = "";
    fieldType      = ""
};

this.reportGroupStruc = function(){
    fieldName      = " ";
    groupType      = " ";
    granularity    = " ";
    sortAggregate  = " ";
    sortOrder      = " "
};

this.reportFilterStruc = function(){
   sno              = 0  ;
   filterType       = " ";
   field            = " ";
   operator         = " ";
   value            = " ";
   isnegative       = false;
   isnonoptimizable = false ;
   popOverText      = " ";
   duration         = 0 //optional duration value to compute the duration for date filters.
};

this.executionPlanStruc =  function(){
  sno                   = 0;
  leadingOperationType  = " ";
  obj                   = " ";
  fields                = " ";
  cardinality           = 1 ;
  objNoOfRecords        = 1;
  relativeCost          = 0.25;
  popOverText           = " ";
};

this.optimizerNotesStruc = function(){
  obj         = " ";
  field       = " ";
  notes       = " ";
  popOverText = " "
};

this.recommendationStruc = function(){
   title       = " ";
   description = " ";
   classification = " "
};
