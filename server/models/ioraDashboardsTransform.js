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
 * Node.js util function to transform SFDC REST to Iora REST Schema, for REST over REST implementation

 * 1. Function: transformReportDescribe
 * Purpose: Transform SFDC Rest API information for dashboards --> Iora SFDC Rest API Schema
 * Inputs:
 * @param : describeResponse -> reference to the salesforce JSON response
 * Output : Transformed Iora Dashboard schema
 */


module.exports = {
    //function to transform dashboard describe
    transformDashboardDescribe: function(dashboardSchema, _lodash, describeResponse, ioraConstants) {
        //create an instance to store the JSON for dashboards
        var ioraDashboardRest = new dashboardSchema.ioraDashboardRest();
        //create an instance to get the dashboard info structure
        var ioraDashboardInfo = new dashboardSchema.ioraDashboardInfo();
        //initialize generalInfo dashboard structure
        var generalInfo = new ioraDashboardInfo.generalInfo();

        generalInfo = _buildGeneralInfo(dashboardSchema, generalInfo, describeResponse, _lodash);
        ioraDashboardRest.generalInfo = generalInfo;
        return ioraDashboardRest;
    }
};

var _fetchComponentName = function(component) {
    return ((component.title === null || component.title === undefined) ? ((component.header === null || component.header === undefined) ? 'Unnamed' : component.header) : component.title);
}

var _pushErrorInfos = function(generalInfo, dashboardSchema) {
    generalInfo.errorInfos = [];
    var errorInfo = new dashboardSchema.errorInfo();
    errorInfo.Id = errorDescribe.id;
    errorInfo.errorCode = errorDescribe.errorCode;
    errorInfo.errorMessage = errorDescribe.errorMessage;
    errorInfo.errorSeverity = 'FATAL';

    generalInfo.errorInfos.push(errorInfo);

}

var _checkError = function(dashboardDescribe, dashboardSchema, _lodash, generalInfo) {
    if (!dashboardDescribe.dashboardMetadata || !dashboardDescribe.componentData) {

        _lodash.each(dashboardDescribe, function(errorDescribe) {
            generalInfo.Id = errorDescribe.id;
            _pushErrorInfos(generalInfo, dashboardSchema);
        });

    }
}

var _populateErrorMap = function(componentDataInstance, dashboardSchema, errorMap) {
    var errorInfo = new dashboardSchema.errorInfo();
    errorInfo.errorCode = componentDataInstance.status.errorCode;
    errorInfo.errorMessage = componentDataInstance.status.errorMessage;
    errorInfo.errorSeverity = componentDataInstance.status.errorSeverity;

    errorMap[componentDataInstance.componentId] = errorInfo;
}

var _populateComponentMap = function(componentDataInstance, dashboardSchema,componentMap) {

    var componentInfo = new dashboardSchema.dashboardComponentInfo();
    componentInfo.refreshDate = componentDataInstance.status.refreshDate;
    componentInfo.typeName = null;
    if (componentDataInstance.reportResult !== null) {
        componentInfo.typeName = componentDataInstance.reportResult.reportMetadata.name;
    }
    componentMap[componentDataInstance.componentId] = componentInfo;

}

var _populateDashGeneralInfo = function(dashboardDescribe, generalInfo) {
    generalInfo.Id = dashboardDescribe.dashboardMetadata.id;
    generalInfo.folderId = dashboardDescribe.dashboardMetadata.folderId;
    generalInfo.developerName = dashboardDescribe.dashboardMetadata.developerName;
    generalInfo.name = dashboardDescribe.dashboardMetadata.name;
    generalInfo.runningUser = dashboardDescribe.dashboardMetadata.runningUser.displayName;
    generalInfo.componentInfo = [];
    generalInfo.errorInfos = [];
}

var _buildGeneralInfo = function(dashboardSchema, generalInfo, dashboardDescribe, _lodash) {
    //iterate through componentData to check for any errors and build the error json
    var errorMap = {};
    //component objects for error free components
    var componentMap = {};

    //error situation
    _checkError(dashboardDescribe, dashboardSchema, _lodash, generalInfo);

    _lodash.each(dashboardDescribe.componentData, function(componentDataInstance) {
        //if the status is valid.
        if (componentDataInstance.status.errorCode !== null) {
            _populateErrorMap(componentDataInstance, dashboardSchema,errorMap);
        } else {
            _populateComponentMap(componentDataInstance, dashboardSchema,componentMap);
        }

    });

    if (dashboardDescribe.componentData !== null && dashboardDescribe.componentData.length > 0)
        generalInfo.refreshDate = dashboardDescribe.componentData[0].status.refreshDate;
       if (dashboardDescribe !== null && dashboardDescribe.dashboardMetadata !== null) {
          _populateDashGeneralInfo(dashboardDescribe, generalInfo);
          //initialize component index
          var componentIndex = 0;
          //iterate through dashboard components and populate the data.
         _lodash.each(dashboardDescribe.dashboardMetadata.components, function(component) {
            if (componentMap[component.id]) {
                var componentInfo = componentMap[component.id];
                componentInfo.componentId = component.reportId;
                componentInfo.componentName = _fetchComponentName(component);
                if (!componentInfo.typeName) {
                    componentInfo.typeName = componentInfo.componentName
                }
                componentInfo.componentType = component.type;
                if (component.properties !== null && component.properties.visualizationType !== null) {
                    componentInfo.visualizationType = component.properties.visualizationType;
                } else {
                    componentInfo.visualizationType = '-';
                }
                generalInfo.componentInfo.push(componentInfo);
            }

            if (errorMap[component.id] !== null && errorMap[component.id] !== undefined) {
                var errorInfo = errorMap[component.id];
                errorInfo.Id = component.reportId;
                errorInfo.Name = _fetchComponentName(component);
                generalInfo.errorInfos.push(errorInfo);
            }
          componentIndex++;
        });
    }
    return generalInfo;
}
