'use strict';

/**
 * @ngdoc function
 * @name ioraliteAngularApp.controller:TestCtrl
 * @description
 * # TestCtrl
 * Controller of the ioraliteAngularApp
 */
angular.module('ioraliteAngularApp')
  .controller('TestCtrl', function ($scope,$http,httpReqFactory,$q,$location,$localStorage) {
    $scope.$storage=$localStorage;

    var params={};

    var addlnReqParamsMap=[];

    params.access_token= $scope.$storage.access_token;
    params.instance_url=$scope.$storage.instance_url;
    addlnReqParamsMap.apiVer=$scope.$storage.version

    var reportsToBeFetched = [];

    var rptScorePromises=[];

    var reportHeathScores = [];

    var reportHealthErrors=[];

      httpReqFactory.promisifyReq($http, '/fetchPossibleCandidates', params, addlnReqParamsMap).then(function(candidates) {
         angular.forEach(candidates,function(candidate){
           reportsToBeFetched.push(candidate.Id);
         });

         for (var reportIndex = 0; reportIndex < reportsToBeFetched.length; reportIndex += 25) {

           var reportsubset = reportsToBeFetched.slice(reportIndex, reportIndex + 25);
            addlnReqParamsMap = [];

           //construct the request data
           addlnReqParamsMap.reportIds = reportsubset.toString();
           addlnReqParamsMap.apiVer = $scope.$storage.version;
           addlnReqParamsMap.chunkSize = '25';

           rptScorePromises.push(httpReqFactory.promisifyReq($http, '/reportsPerf', params, addlnReqParamsMap));


           //make the api call to fetch the dashboard describe. Needed to understand the dashboard components
           httpReqFactory.promisifyReq($http, '/reportsPerf', params, addlnReqParamsMap).then(function(perfHealthScores) {
              angular.forEach(perfHealthScores,function(perfHealthScore){

                if(perfHealthScore.statusCode === 200){
                  reportHeathScores.push(perfHealthScore);
                }
                else{
                  reportHealthErrors.push(perfHealthScore);
                }

              });
             var totalFetched=reportHealthErrors.length + reportHeathScores.length; 
              

           });
         }
 
      });

     
  });
