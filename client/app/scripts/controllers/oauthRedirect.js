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
 * @name ioraliteAngularApp.controller:OauthredirectCtrl
 * @description
 * # OauthredirectCtrl
 * Controller of the ioraliteAngularApp
 *
 */
angular.module('ioraliteAngularApp')
  .controller('OauthredirectCtrl', function( $scope, $filter,$location, $localStorage,ioraServicesFactory) {

    //set the session storage for caching the API results
    $scope.$storage=$localStorage;

    var url = $location.url();

    ioraServicesFactory.fixhashinURL(url,$location);

    var searchObject = $location.search();

    //Check the scan selection and redirect appropriately
    /*if($scope.$storage.quickScan===null || $scope.$storage.quickScan===undefined || $scope.$storage.quickScan){
    //  $location.url('./Iora_Org_Quick_Prepare' + '?' + $location.hash());
    url='/Iora_Org_Quick_Prepare' + '?access_token=' + searchObject.access_token + '&instance_url=' + searchObject.instance_url;
    }
    else{*/
    //  $location.url('./Iora_Org_Prepare' + '?' + $location.hash());
    url='/Iora_Org_Prepare?access_token=' + searchObject.access_token + '&instance_url=' + searchObject.instance_url;
    //}

    $location.url(url);

    $location.replace();

  }); // end of function call
