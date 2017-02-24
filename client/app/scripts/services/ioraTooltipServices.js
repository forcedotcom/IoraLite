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
 * Iora Services to construct angular charts needed for the app.
 * and provide to the controller.
 */

 'use strict';

 angular.module('ioraChartServices')
 .factory('orgToolTipServicesFactory', function() {

   var _createElement=function(parentDom,elementType,d){
     return parentDom.selectAll(elementType)
     .data([d])
     .enter().append(elementType);
   }

   var _styleCellAndRender=function(trowObj,tableObj,footerValue){

     trowObj.selectAll("td").each(function(p) {
       if (p.highlight) {
         var opacityScale = d3.scale.linear().domain([0, 1]).range(["#fff", p.color]);
         var opacity = 0.6;
         d3.select(this)
         .style("border-bottom-color", opacityScale(opacity))
         .style("border-top-color", opacityScale(opacity));

       }
     });

     var html = tableObj.node().outerHTML;
     if (footerValue !== undefined) {
       html += "<div class='footer'>" + footerValue + "</div>";
     }

     return html;

   }


   var _appendRow=function(trowObj,value,rowType,d){
     if('key' === rowType){
     trowObj.append("td")
     .classed(rowType, true)
     .html(function() {
       return value;
     });
   }
   else{
     trowObj.append("td")
     .classed(rowType, true)
     .html(function() {
       return value;
     }).append("tr")
     .classed("highlight", function(p) {
       return p.highlight;
     });
   }
   }

   var _appendHeader=function(theadObj,d){
     theadObj.append("tr")
     .append("td")
     .attr("colspan", 3)
     .append("strong")
     .classed("x-value", true)
     .html('Summary');
   }

  var customizeTooltip = function(d) {
    if (d === null) {
      return '';
    }


    var table = d3.select(document.createElement("table"));
    //create header
    var theadEnter = _createElement(table,'thead',d);
     //append header
    _appendHeader(theadEnter,d);

    //create tbody
    var tbodyEnter = _createElement(table,'tbody',d);

    //create trow
    var trowEnter = _createElement(tbodyEnter,'tr',d).classed("highlight", function(p) {
      return p.highlight;
    });


    _appendRow(trowEnter,d.data.key + ':','key');
    _appendRow(trowEnter,d.value,'value');

    _appendRow(trowEnter,'Name','key');
    _appendRow(trowEnter,d.data.apiName,'value');

    _appendRow(trowEnter,'Last Used:','key');
    _appendRow(trowEnter,d.data.lastUsed,'value');

    _appendRow(trowEnter,'Last Modified:','key');
    _appendRow(trowEnter,d.data.lastModified,'value');

    _appendRow(trowEnter,'Last Modified By:','key');
    _appendRow(trowEnter,d.data.lastModifiedBy,'value');

    return _styleCellAndRender(trowEnter,table,d.footer);

  };

  var customizeMiniTooltip = function(d) {
    if (d === null) {
      return '';
    }

    var table = d3.select(document.createElement("table"));

    //create header
    var theadEnter = _createElement(table,'thead',d);
     //append header
    _appendHeader(theadEnter);

    //create tbody
    var tbodyEnter = _createElement(table,'tbody',d);


    var trowEnter = tbodyEnter.selectAll("tr")
    .data(function(p) {
          return p.series;
        })
    .enter()
    .append("tr")
    .classed("highlight", function(p) {
      return p.highlight;
    });

    _appendRow(trowEnter,d.data.key + ':','key');
    _appendRow(trowEnter,d.value,'value');

    _appendRow(trowEnter,'Name','key');
    _appendRow(trowEnter,d.data.apiName,'value');

    return _styleCellAndRender(trowEnter,table,d.footer);

  };

  return {
    customizeTooltip: customizeTooltip,
    customizeMiniTooltip : customizeMiniTooltip
  };
});
