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

 angular.module('ioraSessionServices',[])
 .factory('ioraGateKeeperFactory',function(){
   var errorMessage = {};

   function set(data) {
     errorMessage = data;
   }

   function get() {
     return errorMessage;
   }

   return {
     set: set,
     get: get
   };
 })
 .factory('ioraReportFactory', function() {
   //placeholder interface to fetch the iora rest data and supply it to the views.
   var ioraRest = {};

   function set(data) {
     ioraRest = data;
   }

   function get() {
     return ioraRest;
   }

   return {
     set: set,
     get: get
   };
 })
 .factory('ioraDashboardFactory', function() {
   //placeholder interface to fetch the iora rest data and supply it to the views.
   var ioraRest = {};

   function set(data) {
     ioraRest = data;
   }

   function get() {
     return ioraRest;
   }

   return {
     set: set,
     get: get
   };
 })
 .factory('userInfoFactory', function() {
   //placeholder interface to fetch the iora rest data and supply it to the views.
   var userInfo = {};

   function set(data) {
     userInfo = data;
   }

   function get() {
     return userInfo;
   }

   return {
     set: set,
     get: get
   };
 }).factory('chartSelectionFactory', function() {
   //placeholder interface to fetch the iora rest data and supply it to the views.
   var chartSelection = {};

   function set(data) {
     chartSelection = data;
   }

   function get() {
     return chartSelection;
   }

   return {
     set: set,
     get: get
   };
 });
