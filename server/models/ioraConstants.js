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
 * A constants file to store the constants used by the Iora application
 */
 module.exports={
   //design status values
   designOptimal              : 'Optimal',
   designSubOptimal           : 'Suboptimal',

   //design status css class values
   designOptimalClass         : 'success',
   designSubOptimalClass      : 'danger',

   //assign score values for design status
   designOptimalScore         : 1,
   designSubOptimalScore      : 5,

   //scalability dimension status values
   scalabilityOK              : 'OK',
   scalabilityWarning         : 'Warning',
   scalabilityCritical        : 'Critical',

   //design status css class values
   scalabilityOKClass         : 'success',
   scalabilityWarningClass    : 'warning',
   scalabilityCriticalClass   : 'danger',

   //assign score values for scalability status values
   scalabilityOKScore         : 1,
   scalabilityWarningScore    : 2,
   scalabilityCriticalScore   : 5,

   //cardinality thresholds
   nonSelectiveCardinality    : 1000,
   recordSkewCardinality      : 10000,
   unhealthyTableScan         : 1000000,
   unscalableTableScan        : 100000,

   //aggregation variables for in memory report aggregation
   optimalHSCnt               : 0,
   optimalUnscalableHSCnt          : 0,
   suboptimalUnhealthyHSCnt        : 0,
   suboptimalUnscalableHSCnt       : 0,
   optimalDesignCnt           : 0,
   suboptimalDesignCnt        : 0,
   okScalabilityCnt           : 0,
   warningScalabilityCnt      : 0,
   criticalScalabilityCnt     : 0,

   //perf tags count
   undeindexedHDCnt             : 0,
   wildcardfilterHDCnt        : 0,
   nonselectiveHDCnt          : 0,
   recordskewHDCnt              : 0,
   negativefilterHDCnt        : 0,
   nonoptimizableopHDCnt      : 0,
   lastmodifiedoptHDCnt       : 0,

   //aggregation variables for in memory dashboard aggregation
   dashoptimalHSCnt               : 0,
   dashOptimalUnscalable          : 0,
   dashSuboptimalUnhealthy        : 0,
   dashSuboptimalUnscalable       : 0,

   //dash perf tags count
   dashundeindexedHDCnt             : 0,
   dashwildcardfilterHDCnt        : 0,
   dashnonselectiveHDCnt          : 0,
   dashrecordskewHDCnt              : 0,
   dashnegativefilterHDCnt        : 0,
   dashnonoptimizableopHDCnt      : 0,
   dashlastmodifiedoptHDCnt       : 0,

   //field and operation specific names
   ownerIdField               : 'OwnerId',
   indexOperation             : 'Index',
   tableScanOperation         : 'TableScan',
   sharingOperation           : 'Sharing',

   groupingDown               : 'Down',
   groupingsAcross            : 'Across',

   //special fields to be ignored in optimizer notes
   specialFields             : ['IsDeleted','IsClosed','IsArchived','IsRecurrence','IsTask','IsActive','LastActivityDate'],

   // special string in optimizer notes to be ignored when present.
   specialStrings : ['optimization because query'],

   negativeOperators          : ["notEqual","excludes"],
   nonoptimizableOperators    : ["contains","notContain"],

   largeDateRangeOptimizerNote : 'date is more than',

  //Pop over and recommendation for Non-Selective conditions
   nonSelectivePopOver        : '<h4>Non-Selective Filter</h4><p>The optimizer does not use an available index when a filter condition targets too many records or a better plan is available.</p>',

   nonSelectiveRecTitle       : 'Use Selective Filter Value(s) with Indexed Fields',
   nonSelectiveRecDescription    : '<p>The optimizer uses an index to execute a query when a filter condition references an indexed field <em>and selective field value(s)</em>. Consider modifying, so that the indexed filter condition targets fewer records.</p>',

   //Pop over and recommendation for record skew conditions
   recordSkewPopOver          : '<h4>Record Ownership Skew</h4><p>One user owns more than 10,000 records in this object. Data skews such as this can lead to performance problems in many areas of your org.</p>',
   recordSkewRecTitle         : 'Avoid Skewed Record Ownership',
   recordSkewRecDescription   : '<p>When one user owns more than 10,000 records in an object, many performance problems are likely, including unselective filters in reports, list views, and SOQL queries, record locking, and sharing recalculations. Consider implementing a solution to distribute the ownership of records in this object among many users.</p>',

   //Pop over and recommendation for unindexed Fields
   optimizerTextUnindexed     : 'unindexed',
   unindexedPopOver           : '<h4>Non-Indexed Fitler Field</h4><p>Filter fields that do not have an index always require an inefficient full table scan. See the Tuning Advisor for recommendations.</p>',
   unindexedRecTitle          : 'Create indexes to support selective filter conditions',
   unindexedRecDescription    : '<p>Inefficient full scans are necessary when a filter condition references a field that does not have an index. Consider indexing the field(s) that a filter references, <em>provided that the filter condition is selective</em>. Generally speaking, date, datetime, number, currency, and picklist fields are good index candidates to consider, whereas checkbox, text, and formula fields are most often poor index candidates.</p>',

   //Pop over and recommendation for non-optimizable in optimizer notes
   optimizerTextNonOptimizable     : 'operator is not optimizable',
   nonOptimizablePopOver           : '<h4>Non-Optimizable Operator</h4><p>Filter conditions that use negative operators (notEqual, exclude) and leading wildcard operators (contains, notContain) are not optimizable. See the Tuning Advisor for recommendations.</p>',

   nonOptimizableRecTitle          : 'Replace non-optimizable operators in filter conditions',
   nonOptimizableRecDescription    : '<p>Consider revising filter conditions that use negative operators (notEqual, exclude) and leading wildcard operators (contains, notContain) to an optimizable operators. See other recommendations for more specific information related to this advice.</p>',

   //Pop over and recommendation for negative operators
   negativeopPopOver           : '<h4>Negative Operator</h4><p>Filter conditions that use negative operators such as this are not optimizable. See the Tuning Advisor for recommendations.',

   negativeopRecTitle          : 'Replace negative operators in filter conditions',
   negativeopRecDescription    : "<p>Negative operators such as <code class='iora_code'>notEquals</code> and <code class='iora_code'>excludes</code> are not optimizable. Consider the inverse of filters that use negative operators. For example, if myField has values 1,2,3, change the filter from: </p><pre>... WHERE myField notEqual 1</pre><p>to</p><pre>... WHERE myField equals 2,3</pre>",

   //Pop over and recommendation for large date range
   largeDateRangePopOver : '<h4>Large Date Range Filter </h4><p>Filter conditions that use large date range values may not effectively filter data and perform well. See the Tuning Advisor for recommendations.',

   largeDateRangeRecTitle : 'Replace with smaller date range filters',
   largeDateRangeRecDescription : '<p>Filter conditions that use large date range values may not effectively filter data and perform well. They often lead to full table scans potentially hampering indexes. Should the business use case permit, please consider reducing the date filter to a shorter date range to reduce the result set.</p>',

   //Pop over and recommendation for large date range
   wideScopePopOver : '<h4> Wide Scope </h4><p>Filter conditions that use totally open scope values may not effectively filter data and perform well. See the Tuning Advisor for recommendations.',

   wideScopeRecTitle : 'Replace with restricted scope filters',
   wideScopeRecDescription : '<p>Filter conditions that use totally open/unrestricted scope values may not effectively filter data and perform well. They often lead to full table scans potentially hampering indexes. Should the business use case permit, please consider utilizing a one of the available private scope values to reduce the result set.</p>',

   //Pop over and recommendation for LastModifiedDate filter
   lastModifiedDatePopOver : '<h4>Date Filter </h4><p>Filter conditions that use restrictive date ranges with LastModifiedDate might perform better with SystemModStamp field. See the Tuning Advisor for recommendations.',

   lastModifiedDateRecTitle : 'Explore LastModifiedDate optimization',
   lastModifiedDateRecDescription : '<p>The most simple and effective solution to optimize performance is to use SystemModStamp instead of LastModifiedDate to filter data. However, SystemModStamp may not be available for the object you’re querying against or your business requirement may not allow you to simply substitute the two fields<pre><li><b>Use a custom date field: </b> Use workflow field updates or triggers to copy the LastModifiedDate value, then contact Support to request adding a custom index on the custom field</li></pre></p>',

   //Pop over and recommendation for non-optimizable operators
   nonoptimizableopPopOver           : '<h4>Non-Optimizable Operator</h4><p>Filter conditions that use negative operators (notEqual, exclude) and leading wildcard operators (contains, notContain) are not optimizable. See the Tuning Advisor for recommendations.</p>',

   nonoptimizableopRecTitle          : 'Replace leading wildcard operators in filter conditions',
   nonoptimizableopRecDescription    : "<p>Leading wildcard operators such as <code class='iora_code'>contains</code> and <code class='iora_code'>notContains</code> are not optimizable. Consider the <code class=iora_code>startsWith</code> operator to search for text strings with wildcards.",

   //Performance summary for unhealthy reports
   unhealthyPerfSummary        : '<p> Performs a full object scan of a large object to find the target records. Users can expect slow response times. Admins can expect excessive use of system resources that possibly detract from other concurrent org operations.</p><p>Tuning this component in a top priority using the recommendations on the Tuning Advisor.</p>',

   unhealthyhealthStatusClass     : 'danger',
   unhealthyHealthStatus  : 'Suboptimal, unhealthy',
   unhealthyHealthStatusInt : 4,

  //Performance summary for unscalable reports
  unscalablePerfSummary        : '<p> Performs a full object scan of a medium-sized object to find the target records. If this object grows larger, users can expect slow response times and admins can expect excessive use of system resources that possibly detract from other concurrent org operations.</p><p>Tuning this component is a second-level priority using the recommendations on the Tuning Advisor.</p>',

  unscalablehealthStatusClass     : 'warning',
  unscalableHealthStatus  : 'Suboptimal, unscalable',
  unscalableHealthStatusInt  :  3,

  unscalableRecTitle         : 'Add restrictive Date filter condition',
  unscalableRecDescription   : '<p>Date filters are an easy way to make a query efficient, provided that the filter field has an index. If you do not already have a date filter, consider adding one. If you already have a date filter, make the filter condition more restrictive, if possible, and then make sure that the filter field has an index.</p>',

  //Performance summary for not truly scalable reports

  notTrulyScalablehealthStatusClass : 'warning',
  notTrulyScalableHealthStatus : 'Optimal , unscalable',
  notTrulyScalableHealthStatusInt : 2,

  notTrulyScalablePerfSummary    : '<p> Performs a full object scan of a small object to find the target records. No tuning is recommended at this time, which may change if the object grows to contain many records.</p>',

  //Performance Summary for optimal but critical or warning
  optimalUnscalablePerfSummary : '<p>Uses an index (or similar means) to find target records, which is optimal. However, please see the Tuning Advisor for recommendations that can improve the scalability of this report.</p>',

  //Performance summary for optimal reports
  optimalhealthStatusClass : 'success',
  optimalHealthStatus : 'Optimal',
  optimalHealthStatusInt : 1,
  optimalPerfSummary    : '<p>Uses an index (or similar means) to find target records, which is optimal. No tuning is recommended.</p>',

  //constant to store the last modified date name, to check filters using last modified date.
  lastModifiedDateField : 'Last Modified Date',

 //Performance classification/tags for encoding at DB header level.
  nonSelectiveTag : 'NON_SELECTIVE',
  recordSkewTag : 'RECORD_SKEW',
  unhealthyTag: 'UNHEALTHY',
  unscalableTag : 'UNSCALABLE',
  notTrulyScalableTag: 'NOT_TRULY_SCALABLE',
  unindexedTag: 'UNINDEXED',
  nonOptimizableTag: 'NON_OPTIMIZABLE',
  wildCardfilterTag: 'LEADING_WILDCARD_FILTER',
  negativefilterTag:'NEGATIVE_FILTER',
  unknownClassificationTag : 'UNKNOWN_CLASSIFICATION',
  lastModifiedDateTag : 'LST_MDFIED',
  largeDateRangeTag : 'LG_DT_RNG_FILTER',
  wideScopeTag : 'WDE_SPE_FILTER',


  //The indexes are encoded as binary values.

  wildCardfilterIndex: 0,
  nonOptimizableIndex: 1,
  negativefilterIndex:2,
  notTrulyScalableIndex: 3,
  unscalableIndex : 4,
  lastModifiedDateIndex : 5,
  unindexedIndex: 6,
  nonSelectiveIndex : 7,
  recordSkewIndex : 8,
  wideScopeIndex : 9,
  largeDateRangeIndex : 10,
  unhealthyIndex: 11,

   constructRequestParams : function(req,idProperty) {
      var params = new Map();
      //get the necessary inputs from the params
      params.set('instanceURL', req.body.instanceUrl);
      params.set(idProperty, req.body[idProperty].split(','));
      params.set('apiVer', req.body.apiVer);
      params.set('chunkSize', req.body.chunkSize);
      params.set('sessionId', req.body.sessionId);
      return params;
  },

    establishSFDCConnection : function(jsforce,queryParams){
      if (queryParams.sessionId !== null && queryParams.sessionId.length > 0) {
          access_token = queryParams.sessionId.trim();
          endPointUrl = queryParams.instanceUrl.trim();
      }
      var conn = new jsforce.Connection({
        accessToken: access_token,
        instanceUrl: endPointUrl
      });
      return conn;
  }

 } ;
