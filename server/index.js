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


var helmet = require('helmet');
// Load the routes.
var routes = require('./routes');

var fs = require('fs'),
    https = require('https'),
    express = require('express'),
    app = express();



// Create the application.
//var app = require('express').createServer(options);
app.use(helmet());
app.use(helmet.frameguard());
app.use(helmet.noSniff());

app.use(helmet.hsts({
  maxAge: 10886400000,
  includeSubdomains: true,
  preload: true
}));

/*app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", 'salesforce.com','force.com'] ,
    styleSrc: ["'self'" ,'fonts.googleapis.com']
  }
}));*/

//load the application models
app.models=require('./models/index');


  app.set('views', 'client/app');
  app.use(express.static('client/app'));
  app.use('/bower_components',  express.static('client/bower_components'));



// Add Middleware necessary for REST API's
app.use(app.models.bodyParser.urlencoded({extended: false}));
//app.use(bodyParser.json());
app.use(app.models.methodOverride('X-HTTP-Method-Override'));


app.post(function(req, res, next) {
  if("http" === req.protocol && "localhost" !== req.headers.host) {
    return res.redirect("https://" + req.headers.host + req.path);
  }

  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('content-type', 'application/json;charset=UTF-8');
  next();
});

app.models._.each(routes, function(controller,route) {
  app.all(route, function (req, res){
    controller(req,res);
  });
});

app.get('*', function(request, response) {
  response.sendFile('index.html',{root : 'client/app/' });
});


app.set('port', (process.env.PORT || 3000));
//var httpsServer = https.createServer(app);

//httpsServer.listen(3000);

var server=app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
