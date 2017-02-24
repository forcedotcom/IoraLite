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

  var jsforce = require('jsforce');

  var queryParams = req.body;


  var access_token = '';
  var endPointUrl = '';
  var dashboardIds='';
  var limitClause='limit 10';
  var whereClause='';

  if (queryParams.sessionId !== null && queryParams.sessionId !== undefined && queryParams.sessionId.length > 0) {
    access_token = queryParams.sessionId.trim();
    endPointUrl = queryParams.instanceUrl.trim();
    if(queryParams.dashboardIds !== null && queryParams.dashboardIds !== undefined && queryParams.dashboardIds.length > 0){
      dashboardIds=queryParams.dashboardIds.trim();
      whereClause='where Id =\'' + dashboardIds + '\' and LastReferencedDate !=null';
      limitClause="";
    }
    else{
      whereClause='';
    }
  }

  var conn = new jsforce.Connection({
    accessToken: access_token,
    instanceUrl: endPointUrl
  });

  var responseStr = '';

  var records = [];
  conn.query("select CreatedBy.Name ,Folder.Name, FolderId, LastModifiedById, LastModifiedBy.Name, CreatedDate, Description, DeveloperName, Id, LastModifiedDate, LastReferencedDate, LastViewedDate, NamespacePrefix, RunningUser.Name, SystemModstamp, Title, Type from dashboard " + whereClause + " order by SystemModstamp desc NULLS LAST " + limitClause, function(err, result) {
    if (err) {
      //return console.error(err);
      responseStr = JSON.stringify(err);
    }
    else{
      responseStr = JSON.stringify(result.records);
    }


    res.header('content-type', 'application/json;charset=UTF-8');
    res.setHeader('Content-Length', responseStr.length);
    res.send(responseStr);
    return res;

  });

};
