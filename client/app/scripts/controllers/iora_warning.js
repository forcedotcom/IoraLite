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
 * @name ioraliteAngularApp.controller:IoraErrorsCtrl
 * @description
 * # IoraErrorsCtrl
 * Controller of the ioraliteAngularApp
 */
angular.module('ioraliteAngularApp')
  .controller('IoraWarningCtrl', function($scope, _, $timeout, ioraServicesFactory, ioraInitFactory) {


    ioraInitFactory.pageLoad($scope);
    $scope.scopeGroups = {};
    $scope.scopeFilter = {
      selectedValue: ""
    };
    $scope.allScopeFilter = {
      selectedValue: ""
    };
    var genericScopeUpdate=function($scope,wideScopeSelection,privateScopeSelection,tableId,scopeType){
      ioraServicesFactory.updateTotalWarningCount($scope,wideScopeSelection,privateScopeSelection);
      if('private scope' === scopeType)
        updateScopeSection(privateScopeSelection,tableId,scopeType);
      else
        updateScopeSection(wideScopeSelection,tableId,scopeType);
    }
    $scope.updateScopeTable = function() {
       genericScopeUpdate($scope,$scope.scopeGroups[$scope.allScopeFilter.selectedValue],$scope.scopeGroups[$scope.scopeFilter.selectedValue],'#table-scope-warnings','private scope')
    };
    $scope.updateAllScopeTable = function() {
      //update warning count
      genericScopeUpdate($scope,$scope.scopeGroups[$scope.allScopeFilter.selectedValue],$scope.scopeGroups[$scope.scopeFilter.selectedValue],'#table-all-scope-warnings','wide scope')
    };

    $timeout(function() {

      updatewarningspage($scope.ioraReportRest.reportsWithZeroRecs, []);
      ioraServicesFactory.loadReportScopeData($scope);
      updateScopeSection($scope.scopeGroups[$scope.privateScopes[0]],'#table-scope-warnings','private scope');
      updateScopeSection($scope.scopeGroups[$scope.allScopes[0]],'#table-all-scope-warnings','wide scope');
      ioraServicesFactory.updateTotalWarningCount($scope);
    }, 1000);

  });
