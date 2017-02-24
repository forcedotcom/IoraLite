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
 * REST API service to optionally specify restricted salesforce orgs to use the app by the admin.
 * Customers not part of the non-empty list cannot login or use the application even with the URL.
 */

module.exports = function(req, res) {
  //load the application middleware for the current request
  var app = req.app;

  var errorInfo={};

  var jsforce = require('jsforce');

  //variable to store the JSON response
  var responseStr='';

  /*
  variable to control, if tighter org restriction policy is enforced. By default, it is "true" and hence "strictly enforced".

  If "strictly enforced", only the org IDs that are added to "ioraCustomers" , are allowed to run IoraLite.

  If the variable is set to true, and the "ioraCustomers" list is empty, NO orgs can use IoraLite.

  If the variable is set to false, the behavior is dependent on "ioraCustomers"  list
  1. If the list is empty, then any org can run ioralite. Be CAREFUL and UNDERSTAND COMPLETELY the implications, before turning this setting ON.
  2. If the list is non-empty, then only the org IDs that are added to "ioraCustomers" , are allowed to run IoraLite
   */

  var strictPolicyEnforced=true;

  //define the customers org IDs that can use your Iora App.
  var ioraCustomers=[];

  /* ioraCustomers.push('ALLOW_ORG_ID1'); //First ORG ID to allow access
  ioraCustomers.push('ALLOW_ORG_ID2'); // Second ORG ID allow access
  ioraCustomers.push('ALLOW_ORG_ID3'); //Third ORG ID to allow access
  .......
  .......
  */

  var queryParams = req.body;


  var access_token = '';
  var endPointUrl = '';
  var restEndPoint = '';

  if (queryParams.sessionId !== null && queryParams.sessionId.length > 0) {
    access_token = queryParams.sessionId.trim();
    endPointUrl = queryParams.instanceUrl.trim();
    restEndPoint = queryParams.restEndPoint.trim();
  }

  var conn = new jsforce.Connection({
    accessToken: access_token,
    instanceUrl: endPointUrl
  });


  conn.identity(function(err, identityResponse) {
    //trim the org id to 15 characters from the response
    var orgId_15Chars=identityResponse.organization_id.substring(0,15);
    if (err) {
      //return console.error(err);
      var errorObj=new Error(err);
      errorInfo={};
      errorInfo.errorMessage=errorObj.message;
      responseStr = JSON.stringify(errorInfo);
    }
    else if((!(app.models._.includes(ioraCustomers,orgId_15Chars))) && (strictPolicyEnforced || ioraCustomers.length > 0) ){
      errorInfo={};
      errorInfo.errorMessage='This Salesforce organization is not approved by your administrator to run Iora Lite. You may try logging in with different credentials, if you believe this organization is approved';
      responseStr = JSON.stringify(errorInfo);

    }
    else{
      errorInfo={};
      errorInfo.errorMessage='PROCEED';
      responseStr = JSON.stringify(errorInfo);
    }

    res.header('content-type', 'application/json;charset=UTF-8');
    res.setHeader('Content-Length', responseStr.length);
    res.send(responseStr);
    return res;

  });



};
