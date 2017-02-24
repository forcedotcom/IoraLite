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
 * Node.js util to perform promise based REST API calls to salesforce

 * 1. Function: sfdcRestReq
 * Purpose: perform promise based REST API calls to salesforce
 * Inputs:
 * @param : requestModule -> Reference to the module to perform https request
 * @param : idField      -> ID value that needs to be set, if the response doesn't have one.pass null or empty, if not needed
 * @param : sessionId    -> SFDC session id needed to make the API call
 * @param : instanceURL  -> SFDC host URL that corresponds to the session ID passed
 * @param : apiVer       -> API version to use
 * @param : endPoint     -> REST endPoint to be invoked at the specified host
 * @param : httpMethod   -> The httpMethod associated with the REST call
 * @param : postBody     -> http post content, if POST Method
 * Output : Promise based JSON response from salesforce
 */

var promise = require('bluebird');
var https = require('https');


module.exports = {
  sfdcRestReq: promise.method(function(requestModule, idField, sessionId, instanceURL, apiVer, endPoint, httpMethod, postBody) {
    var options = {
      method: httpMethod,
      baseUrl: instanceURL.indexOf('http') === -1 ? 'https://' + instanceURL : instanceURL,
      url: endPoint,
      timeout : 28000,
      body: postBody,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Content-Length': postBody.length,
        'Authorization': 'Bearer ' + sessionId
      }
    };





    return new promise(function(resolve, reject) {
      requestModule(options, function(error, response, body) {

        var bodyObj;
        var restErrors=[];
        var restErrorInstance = {};

        if (error !== null) {


          restErrorInstance.id = idField;
          restErrorInstance.URL=options.url;
           restErrorInstance.errorCode = error.code;
          restErrorInstance.errorMessage = (error.code === 'ETIMEDOUT'? ('The request to the below URL timed out. <br/>' + options.url) :'') ;
          restErrors.push(restErrorInstance);
          resolve(restErrors);

        }

        //error response
        else if (response!==null && response!==undefined && response.statusCode !== 200) {

          try{
            bodyObj=JSON.parse(body);

            for(var bodyIndex=0;bodyIndex<bodyObj.length;bodyIndex++){

              restErrorInstance.id = idField;
              restErrorInstance.statusMessage = response.statusMessage;
              restErrorInstance.errorCode = bodyObj[bodyIndex].errorCode;
              restErrorInstance.URL=options.url;
              restErrorInstance.errorMessage = bodyObj[bodyIndex].message;
              restErrors.push(restErrorInstance);
            }
          }
          catch(Exception){
            restErrorInstance.id = idField;
            restErrorInstance.statusMessage = response.statusMessage;
            restErrorInstance.errorCode = 'UNKNOWN';
            restErrorInstance.URL=options.url;
            restErrorInstance.errorMessage = body;
            restErrors.push(restErrorInstance);
          }


         resolve(restErrors);
        }
         else {
          body.id = idField;
          resolve(JSON.parse(body));
        }
      }).on('error', function(e){
       // TODO:Improve error handling and messaging.
        /*console.log("===ERROR HANDLER====");
        console.log(e);*/
  });
    });
  })
};
