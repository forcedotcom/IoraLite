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

'use strict';

/**
 * @ngdoc function
 * @name ioraliteAngularApp.controller:MainCtrl
 * @description
 * # LoginCtrl
 * Controller of the ioraliteAngularApp
 */
angular.module('ioraliteAngularApp')
.controller("LoginCtrl", ['$scope','$window', '$http','$localStorage','$location','Versions','httpReqFactory','ioraServicesFactory',function($scope,$window, $http,$localStorage,$location,Versions,httpReqFactory,ioraServicesFactory) {
     //reset local storage
     $localStorage.$reset();

     $scope.$storage=$localStorage;

     $scope.termsAgreed=false;
     $scope.username='';
     $scope.orderByAttribute='version';
     $scope.password='';
     $scope.environment= 'Environment' ;
     $scope.version='Version';
     $scope.versionURL='';
     $scope.authMode='';
     $scope.isCustomDomain=false;

     $scope.quickScan={
       selectedValue : true
     };

     $scope.showTerms=false;

     $scope.loginErrors=false;//by default set login errors to false.
     $scope.loginErrorMsgs=''; //no login error messages.

     //variable to store the selected environment
     $scope.endPoint = {
      selected : {name:'Production' , url : 'https://login.salesforce.com'},
      myDomain : '',
      selectedVersion : {version: 'Default (recommended)'}
    };

    $scope.$watch('endPoint.selected',function(newEnv){
      if(newEnv.name === 'Custom Domain'){
        $scope.isCustomDomain=true;
      }
      else{
        $scope.isCustomDomain=false;
      }
    });



     $scope.environments=[
       {name:'Production' , url : 'https://login.salesforce.com'},
       {name:'Sandbox' , url : 'https://test.salesforce.com'},
       {name: 'Custom Domain' , url : ''}
     ];


     //set the oauth flag to false, since default option is standard authentication.
     $scope.isOauth=false;

     $scope.envList=['Production','Sandbox'];

     $http.post('versions').then(function(response){
       $scope.verList=response.data;
       for(var verIndex=0;verIndex<$scope.verList.length;verIndex++){
         $scope.verList[verIndex].verlabel=$scope.verList[verIndex].label + ' - ' + $scope.verList[verIndex].version;
       }
     });


     $scope.setAuthMethod=function(authMethod){
       //set the auth mode based on user selection.
       $scope.authMode=authMethod;
       if(authMethod === 'oauth'){
         $scope.isOauth=true;
       }
       else{
         $scope.isOauth=false;
       }
     };


   $scope.setEnvironment=function(envInput){
     $scope.environment=envInput;
   };


   $scope.setVersion=function(verInput){
     $scope.version=verInput.version;
     $scope.versionURL=verInput.url;
   }

   ioraServicesFactory.defineGoButtonAction($scope,$location);

   $scope.showTermsDialog=function(){
     $scope.showTerms=true;
   };

   $scope.init = function() {
     $scope.$apply($scope.initializeData);
   };

   //function to initiate login depending on user selections
   $scope.initiateLogin = function(){
     var authParams={};

     //check for form validity
     $scope.$broadcast('show-errors-check-validity');
     //if there are any errors in the form, simply return without performing any action
    if($scope.loginForm.$valid){
      //check the value of Version
      if($scope.endPoint.selectedVersion.version === 'Default (recommended)'){
        $scope.$storage.version=$scope.verList[$scope.verList.length-1].version;
      }
      else{
        $scope.$storage.version=$scope.endPoint.selectedVersion.version;
      }

      if(!$scope.isCustomDomain){
        authParams.loginurl=$scope.endPoint.selected.url;

      }
      else{
        authParams.loginurl='https://' + $scope.endPoint.myDomain + '.my.salesforce.com';
       }

      $scope.$storage.endPoint=authParams.loginurl;
      $scope.$storage.quickScan=$scope.quickScan.selectedValue;




      if($scope.authMode === 'oauth'){
         $scope.initiateOAuth();
      }
      else{

       authParams.username=$scope.username;
       authParams.password=$scope.password;


       var request = {
         method: "POST",
         url: '/passwordAuth',
         headers: {
           'Content-Type': 'application/x-www-form-urlencoded'
         },
         data: $.param(authParams)
       };
       // $http returns a promise, which has a then function, which also returns a promise
       $http(request).then(function(response) {
          //an error occurred during the login process. Display error message.
          if(response.data!==null && response.data.errorMessage !== null && response.data.errorMessage !== undefined){
                 $scope.loginErrors=true;
                 $scope.loginErrorMsgs=response.data.errorMessage;
                 $(".modal").modal({
                           backdrop: 'true',
                           keyboard: false
                 });

                 $("#homeButton").click(function(){
                   $('.modal-backdrop').remove();
                 });
                 $scope.divStyle={
                   "display" : "block",
                   "position" : "relative"
                 };
                 return;
          }
          else if(response.data!==null && response.data.access_token !== null && response.data.access_token !== undefined){
            $scope.loginErrors=false;
            $scope.loginErrorMsgs='';
            //redirect user to Iora.
            $location.url('/oauthRedirect?access_token=' + response.data.access_token + '&instance_url=' + response.data.instance_url);
            $location.replace();

          }
       });
     }
   }

   };

   $scope.initiateOAuth = function() {
     var config=$scope.config;
     var redirect_uri=config.callbackPath ? config.callbackPath : window.location.protocol + window.location.pathname;

     var authURL = $scope.$storage.endPoint + '/services/oauth2/authorize?response_type=token&display=page&scope=' + escape(config.scope) + '&client_id=' + escape(config.clientId) + '&redirect_uri=' + escape(redirect_uri);


     window.location.href=authURL;
   };


   $scope.config = CONFIG;


 }]);
