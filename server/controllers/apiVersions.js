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
   var nforce = app.models.nforce;
   var org = nforce.createConnection({
     clientId: '3MVG9sG9Z3Q1Rlbf_SZ4GkXuJFnrj7skeLWqgrt0ax6EVN2wEtKVNYUKKrzYnaeCpiKptXyag_bZos_bW9ulb',
     clientSecret: 'DUMMY_SECRET',
     redirectUri: 'https://localhost:3000/oauth/_callback',
     environment: 'production', // optional, salesforce 'sandbox' or 'production', production default
     mode: 'multi' // optional, 'single' or 'multi' user mode, multi default
   });

   org.getVersions(function(err, resp) {
     var responseStr = JSON.stringify(resp);
     res.header('content-type', 'application/json;charset=UTF-8');
     res.setHeader('Content-Length', responseStr.length);
     res.send(responseStr);
     return res;
   });


 };
