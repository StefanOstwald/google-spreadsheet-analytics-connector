// ##################################################
// ############## public ############################
// ##################################################

function runTests() {
    var devLogSheet = "1CTqDO_-F1tIuZrEBWe16bN65x52cV86eo2HlHfFl_aA";
    // https://docs.google.com/spreadsheets/d/1CTqDO_-F1tIuZrEBWe16bN65x52cV86eo2HlHfFl_aA/edit#gid=1854668337
    gasc.logger.useBetterLogOnExternalSpreadsheet(devLogSheet);

    gasc.test.runAllTests();
}


/**
 * Creates the menu item.
 */
function onOpen() {
    gasc.logger.useBetterLogOnOpenSpreadsheet();

    var ui = SpreadsheetApp.getUi();
    // Or DocumentApp or FormApp.
    ui.createMenu('Analytics')
        .addItem('Run query in active range', 'directQuery')
        .addSeparator()
        .addSubMenu(ui.createMenu('debug')
            .addItem('Schedule queries in active range to queue', 'scheduleActiveRangeForDailyUpdate'))
        .addToUi();
}

function directQuery() {
    gasc.logger.useBetterLogOnOpenSpreadsheet();
    gasc.logger.log("directQuery started");
    var env = gasc.env.generateProductionEnvironment();
    gasc.workflow.directQuery.run(env);
}

function scheduleActiveRangeForDailyUpdate() {
    gasc.logger.useBetterLogOnOpenSpreadsheet();
    gasc.logger.log("scheduleActiveRangeForDailyUpdate started");
    var env = gasc.env.generateProductionEnvironment();
    gasc.workflow.schedule.scheduleQueriesInActiveRangeToSheet(env, env.getScheduledDataDailyUpdateSheet());
}



/**
 * Runs a request against the Google Analytics API and writes result to the below the formula cell.
 * In this debug mode, the log is shown in a modalwindow after the function was executed.
 * Definitions: https://developers.google.com/analytics/devguides/reporting/core/dimsmets
 *
 * example call:
 * =ANALYTICSB("ga:53113218";"2015-01-01";"2015-01-31";"ga:sessions")
 * =ANALYTICSB("ga:53113218";"2015-01-01";"2015-01-31";"ga:sessions";"sessions::conditions::ga:pagePath==/";"";"";"";0,1,true,true)
 *
 * @param {string} analyticsId The Google Analytics API Key. It can be retrieved via the menu: Google Analytics -> Find Profile / Ids
 * @param {string} startDate The first day starting at 00:00:00 which shall be included in the analysis. Value has to be a constant, so references to now() are not accepted.
 * @param {string} endDate The last day ending at 23:59:59 which shall be included in the analysis. Value has to be a constant, so references to now() are not accepted.
 * @param {string} metrics The metric of the analysis like ga:pagePath
 * @param {string} [segment] the segment as a string which shall be applied
 * @param {string} [filter] the filter as a string which shall be applied
 * @param {string} [dimension] The dimension according to which the result is split upon.
 * @param {string} [sort] the sorting order as a string which shall be applied
 * @param {int} [startIndex] the offset of the resultset starting at 0
 * @param {int} [maxResults] the maximum number of results. WARNING >1 overwrites the columns below and on the right
 * @param {boolean} [showHeadersInResult] if true the description of the data is added to the result numbers
 * @param {string} [samplingLevel] the sample level of analytics. Options: DEFAULT or FASTER or HIGHER_PRECISION
 * @param {string} [fields] Selector specifying a subset of fields to include in the response.
 * @return The resulting array of the request.
 * @customfunction
 */

function ANALYTICSB(analyticsId, startDate, endDate, metrics, segment, filter, dimension, sort, startIndex, maxResults, showHeadersInResult,  samplingLevel, fields) {
    var config =  gasc.customFunction.baseFunction(analyticsId, startDate, endDate, metrics, segment, filter, dimension, sort, startIndex, maxResults,showHeadersInResult,  samplingLevel, fields);
    config.presParam.positionOfResults = gasc.model.PresParam.PositionOfResults.BELOW;
    return JSON.stringify(config);
}

/**
 * Runs a request against the Google Analytics API and writes result to the below the formula cell.
 * In this debug mode, the log is shown in a modalwindow after the function was executed.
 * Definitions: https://developers.google.com/analytics/devguides/reporting/core/dimsmets
 *
 * example call:
 * =ANALYTICSR("ga:53113218";"2015-01-01";"2015-01-31";"ga:sessions")
 * =ANALYTICSR("ga:53113218";"2015-01-01";"2015-01-31";"ga:sessions";"sessions::conditions::ga:pagePath==/";"";"";"";0,1,true,true)
 *
 * @param {string} analyticsId The Google Analytics API Key. It can be retrieved via the menu: Google Analytics -> Find Profile / Ids
 * @param {string} startDate The first day starting at 00:00:00 which shall be included in the analysis. Value has to be a constant, so references to now() are not accepted.
 * @param {string} endDate The last day ending at 23:59:59 which shall be included in the analysis. Value has to be a constant, so references to now() are not accepted.
 * @param {string} metrics The metric of the analysis like ga:pagePath
 * @param {string} [segment] the segment as a string which shall be applied
 * @param {string} [filter] the filter as a string which shall be applied
 * @param {string} [dimension] The dimension according to which the result is split upon.
 * @param {string} [sort] the sorting order as a string which shall be applied
 * @param {int} [startIndex] the offset of the resultset starting at 0
 * @param {int} [maxResults] the maximum number of results. WARNING >1 overwrites the columns below and on the right
 * @param {boolean} [showHeadersInResult] if true the description of the data is added to the result numbers
 * @param {string} [samplingLevel] the sample level of analytics. Options: DEFAULT or FASTER or HIGHER_PRECISION
 * @param {string} [fields] Selector specifying a subset of fields to include in the response.
 * @return The resulting array of the request.
 * @customfunction
 */

function ANALYTICSR(analyticsId, startDate, endDate, metrics, segment, filter, dimension, sort, startIndex, maxResults,showHeadersInResult,  samplingLevel, fields) {
    var config =  gasc.customFunction.baseFunction(analyticsId, startDate, endDate, metrics, segment, filter, dimension, sort, startIndex, maxResults,showHeadersInResult,  samplingLevel, fields);
    config.presParam.positionOfResults = gasc.model.PresParam.PositionOfResults.RIGHT;
    return JSON.stringify(config);
}

// ##########################################
// ##############  gasc.namespace ###########
// ##########################################

var gasc = gasc || {};
gasc.namespace = gasc.namespace || {};

/**
 * Based up Kenneth Truyers' Work
 * http://www.kenneth-truyers.net/2013/04/27/javascript-namespaces-and-modules/
 */
gasc.namespace.createNs = function (namespace) {
    var nsparts = namespace.split(".");
    var parent = gasc;

    // we want to be able to include or exclude the root namespace so we strip
    // it if it's in the namespace
    if (nsparts[0] === "gasc") {
        nsparts = nsparts.slice(1);
    }

    // loop through the parts and create a nested namespace if necessary
    for (var i = 0; i < nsparts.length; i++) {
        var partname = nsparts[i];
        // check if the current parent already has the namespace declared
        // if it isn't, then create it
        if (typeof parent[partname] === "undefined") {
            parent[partname] = {};
        }
        // get a reference to the deepest element in the hierarchy so far
        parent = parent[partname];
    }
    // the parent is now constructed with empty namespaces and can be used.
    // we return the outermost namespace
    return parent;
};


// ##########################################
// ##############  gasc.logger ##############
// ##########################################

(function(undefined ){

    var logFine = true;
    var logInfo = true;
    var logSevere = true;


    this.useBetterLogOnExternalSpreadsheet = function (loggingSpreadsheetId) {
        this.logInterface = BetterLog.useSpreadsheet(loggingSpreadsheetId); // for BetterLog https://sites.google.com/site/scriptsexamples/custom-methods/betterlog
    };

    this.useBetterLogOnOpenSpreadsheet = function () {
        this.logInterface = BetterLog.useSpreadsheet();
    };


    this.useGasConsole = function () {
        this.logInterface = console; // for GAS Console https://github.com/tyskdm/gas-console
    };

    this.logError = function (e) {
        e = (typeof e === 'string') ? new Error(e) : e;
        this.severe('%s: %s (line %s, file "%s"). Stack: "%s" . While processing %s.',e.name||'',
            e.message||'', e.lineNumber||'', e.fileName||'', e.stack||'', e.processingMessage||'');
    };

    this.severe = function (data) {
        if (logSevere) {
            this.log(data);
        }
    };

    this.log = function(data) {
        if (this.logInterface) {
            this.logInterface.log(data);
        }
    };

    this.info = function(data) {
        if (logInfo) {
            this.log(data);
        }
    };

    this.fine = function(data) {
        if (logFine) {
            this.log(data);
        }
    };

}).apply(gasc.namespace.createNs("gasc.logger"));


// ##################################################
// ##############  gasc.customFunction ##############
// ##################################################

(function(undefined ){

    // TODO ?? seperate function into smaller functions?
    this.baseFunction = function (analyticsId, startDate, endDate, metrics, segment, filter, dimension, sort, startIndex, maxResults, showHeadersInResult,  samplingLevel, fields) {
        gasc.logger.info('Running ANALYTICSB on: ' + new Date());

        var config = new gasc.model.Config();

        config.queryParam.analyticsId = analyticsId;
        config.queryParam.setStartDateInGaFormat(startDate);
        config.queryParam.setEndDateInGaFormat(endDate);
        config.queryParam.metrics = metrics;
        config.queryParam.setSegmentToValueOrDefault(segment);
        config.queryParam.setFilterToValueOrDefault(filter);
        config.queryParam.setDimensionToValueOrDefault(dimension);
        config.queryParam.setSortToValueOrDefault(sort);
        config.queryParam.setStartIndexToIntegerValueOrDefault(startIndex);
        config.queryParam.setMaxResultsToIntegerValueOrDefault(maxResults);
        //Todo convert to enum
        config.queryParam.setSamplingLevelToValueOrDefault(samplingLevel);
        config.queryParam.setFieldsToValueOrDefault(fields);

        config.presParam.setShowHeadersInResultToValueOrDefault(showHeadersInResult);

        gasc.logger.info("Config with default values applied: " + JSON.stringify(config));

        //        if (!configIsValid(config)) throw "config is not valid";
        return config;
    };

}).apply(gasc.namespace.createNs("gasc.customFunction"));


// ##################################################
// ##############  gasc.model.Config ################
// ##################################################

gasc.namespace.createNs("gasc.model");

gasc.model.Config = function (obj) {
    this.queryParam = new gasc.model.QueryParam();
    this.presParam = new gasc.model.PresParam();

    if (obj) {
        for (var prop in obj) this[prop] = obj[prop];
    }
};



// ##################################################
// ##############  gasc.model.QuerySet ################
// ##################################################

gasc.namespace.createNs("gasc.model");

gasc.model.QuerySet = function (obj) {
    if (obj) {
        for (var prop in obj) this[prop] = obj[prop];
    }
};

(function (undefined) {

    this.prototype.containsValidConfig = function () {
        if (!this.config) {
            gasc.logger.info("config is falsey");
            return false;
        } else {
            gasc.logger.info("config: " + JSON.stringify(this.config));
        }
        if (!this.config.queryParam.analyticsId) {
            gasc.logger.info("config.queryParam.analyticsId is falsey");
            return false;
        }
        if (!this.config.queryParam.startDate) {
            gasc.logger.info("config.queryParam.startDate is falsey");
            return false;
        }
        if (!this.config.queryParam.endDate) {
            gasc.logger.info("config.queryParam.endDate is falsey");
            return false;
        }
        if (!this.config.queryParam.metrics) {
            gasc.logger.info("config.queryParam.metrics is falsey");
            return false;
        }

        //TODO    if (!dateIsValid(config[START_DATE])) return false;
        //TODO    if (!dateIsValid(config[END_DATE])) return false;
        //TODO if (SAMPLING_LEVEL_POSSIBILITES.indexOf(config[SAMPLING_LEVEL])<=-1) return false;

        return true;
    };

    this.queryType = {
        DIRECT : "DIRECT",
        SCHEDULED_ONCE : "SCHEDULED_ONCE",
        SCHEDULED_DAILY : "SCHEDULED_DAILY"
    };


    this.prototype.getOutputStartRow = function () {
        switch (this.config.presParam.positionOfResults) {
            case gasc.model.PresParam.PositionOfResults.BELOW :
                return this.row + 1;

            case gasc.model.PresParam.PositionOfResults.RIGHT :
                return this.row;

            default:
                throw "config.presParam.positionOfResult has no valid value";
        }
    };


    this.prototype.getOutputStartColumn = function () {
        switch (this.config.presParam.positionOfResults) {
            case gasc.model.PresParam.PositionOfResults.BELOW :
                return this.column;

            case gasc.model.PresParam.PositionOfResults.RIGHT :
                return this.column + 1;

            default:
                throw "config.presParam.positionOfResult has no valid value";
        }
    };


    this.prototype.getOutputNumRows = function () {
        return this.output.length;
    };


    this.prototype.getOutputNumColumns = function () {
        return this.output[0].length;
    };

    // TODO how can the function definition and this call be merged into one, so no duplicate naming generation
}).apply(gasc.model.QuerySet);

// ##################################################
// ##############  gasc.model.QueryParam ############
// ##################################################

gasc.namespace.createNs("gasc.model");

gasc.model.QueryParam = function (obj) {
    if (obj) {
        for (var prop in obj) this[prop] = obj[prop];
    }
};

(function (undefined) {

    this.prototype.setStartDateInGaFormat = function(startDate) {
        this.startDate =  convertDateToGaFormatIfNeeded(startDate);
    };

    this.prototype.setEndDateInGaFormat = function(startDate) {
        this.endDate =  convertDateToGaFormatIfNeeded(startDate);
    };

    function convertDateToGaFormatIfNeeded(inputDate) {
        if (inputDate instanceof Date) {
            return convertDateToGaFormat(inputDate);
        } else {
            return inputDate;
        }
    }

    /**
     * Author: Nick Mihailovski
     * Source: https://developers.google.com/analytics/solutions/report-automation-magic
     */
    function convertDateToGaFormat(inputDate) {
        var year = inputDate.getFullYear();

        var month = inputDate.getMonth() + 1;
        if (month < 10) {
            month = '0' + month;
        }

        var day = inputDate.getDate();
        if (day < 10) {
            day = '0' + day;
        }
        return [year, month, day].join('-');
    }


    this.prototype.setSegmentToValueOrDefault = function(segment) {
        this.segment = segment || "";
    };

    this.prototype.setFilterToValueOrDefault = function (filter){
        this.filter = filter || "";
    };

    this.prototype.setDimensionToValueOrDefault = function(dimension) {
        this.dimension = dimension || "";
    };

    this.prototype.setSortToValueOrDefault = function(sort) {
        this.sort = sort  || "";
    };

    this.prototype.setStartIndexToIntegerValueOrDefault = function(startIndex) {
        this.startIndex = parseInt(startIndex) || 0;
    };

    this.prototype.setMaxResultsToIntegerValueOrDefault = function(maxResults) {
        this.maxResults = parseInt(maxResults) || 1;
    };

    this.prototype.setSamplingLevelToValueOrDefault = function(samplingLevel){
        //Todo convert to enum
        this.samplingLevel = samplingLevel || "";
    };

    this.prototype.setFieldsToValueOrDefault = function(fields) {
        this.fields = fields || "";
    };


    this.prototype.genOptParamList = function() {
        gasc.logger.info("generating optional parameter list");

        var optParam = {};

        if (this.dimension) {
            optParam["dimensions"] = this.dimension;
        }
        if (this.sort) {
            optParam["sort"] = this.sort;
        }
        if (this.filters) {
            optParam["filters"] = this.filters;
        }
        if (this.segment) {
            optParam["segment"] = this.segment;
        }
        if (this.samplingLevel) {
            optParam["samplingLevel"] = this.samplingLevel;
        }
        if (this.startIndex) {
            optParam["start-index"] = this.startIndex;
        }
        if (this.maxResults) {
            optParam["max-results"] = this.maxResults;
        }
        if (this.fields) {
            optParam["fields"] = this.fields;
        }

        return optParam;
    }
}).apply(gasc.model.QueryParam);


// ##################################################
// ##############  gasc.model.PresParam #############
// ##################################################

gasc.namespace.createNs("gasc.model");

gasc.model.PresParam = function (obj) {
    if (obj) {
        for (var prop in obj) this[prop] = obj[prop];
    }
};

(function (undefined) {

    this.PositionOfResults = {
        RIGHT : "RIGHT",
        BELOW : "BELOW"
    };


    this.prototype.setShowHeadersInResultToValueOrDefault = function (showHeadersInResult){
        this.showHeadersInResult = showHeadersInResult || false;
    };

}).apply(gasc.model.PresParam);


// ##################################################
// ##############  gasc.util ########
// ##################################################


(function ( undefined ) {

    /**
     * The function tests if the jsonString is valid.
     * @param jsonString The string which shall be checked and parsed
     * @returns {*} return false if json is not valid else the parsed json
     */
    this.tryParseJSON = function (jsonString) {
        //Source http://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try
        try {
            var o = JSON.parse(jsonString);

            // Handle non-exception-throwing cases:
            // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
            // but... JSON.parse(null) returns 'null', and typeof null === "object",
            // so we must check for that, too.
            if (o && typeof o === "object" && o !== null && o !== "undefined") {
                return o;
            }
        }
        catch (e) { }

        return false;
    }




}).apply(gasc.namespace.createNs("gasc.util"));


// ##################################################
// ##################    gasc.env    ################
// ##################################################


(function ( undefined ) {

    this.generateProductionEnvironment = function () {
        var env = {
            getScheduledDataDailyUpdateSheet : function() {
                return gasc.spreadsheet.getOrCreateSheetByName(this.activeSpreadsheet,this.scheduledDataDailyUpdateSheetName);
            },
            getLock : function() {
                return LockService.getScriptLock();
            }
        };
        env.apiFunctionCore = Analytics.Data.Ga.get;
        env.activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        gasc.logger.info("activeSpreadsheet url: " + env.activeSpreadsheet.getUrl());
        gasc.logger.info("retrieve activeRange");
        env.activeRange = SpreadsheetApp.getActiveRange();
        gasc.logger.info("initializing  production environment successfull");
        env.scheduledDataDailyUpdateSheetName = "daily_updates";

        return env;
    };

}).apply(gasc.namespace.createNs("gasc.env"));


// ##################################################
// ##############  gasc.workflow.directQuery ########
// ##################################################

(function ( undefined ) {

    this.run = function (env){
        gasc.logger.info("generating querySets for active range - start");
        var querySets = gasc.spreadsheet.getQuerySetsInRange(env.activeRange);
        gasc.logger.info("generating querySets for active range - finished");

        var iQuerySet;
        for (var i=0; i<this.querySets.length; i++) {
            iQuerySet = this.querySets[i];

            gasc.logger.fine("iQuerySet: " + JSON.stringify(iQuerySet));
            iQuerySet.analyticsResponse = gasc.analytics.executeAndRetryIfUnsuccessfull(iQuerySet.config.queryParam, env.apiFunctionCore);
            gasc.logger.info("analytics query received.");
            iQuerySet.output = gasc.view.generateOutputArray(iQuerySet.analyticsResponse,iQuerySet.config.presParam.showHeadersInResult);

            gasc.spreadsheet.writeOutputOfQuerySetToSheet(iQuerySet,env.activeSpreadsheet);
        }
    };

}).apply(gasc.namespace.createNs("gasc.workflow.directQuery"));


// ##################################################
// ##############  gasc.workflow.schedule ###########
// ##################################################

(function ( undefined ) {

    this.scheduleQueriesInActiveRangeToSheet = function(env, sheet) {
        gasc.logger.info("generating querySets for active range - start");

        var querySets = gasc.spreadsheet.getQuerySetsInRange(env.activeRange);
        gasc.logger.info("generating querySets for active range - finished");
        removeConfigInEachQuerySet(querySets);

        var querySetsAsJson = gasc.view.transformArrayelementsToJson(querySets);
        var scheduledDataArray = gasc.view.transform1dArrayTo2dArrayWithDatapointsBelowEachOther(querySetsAsJson);

        gasc.spreadsheet.lock.wait(env.getLock());

        var rowIndexOfFirstDatapoint = gasc.spreadsheet.addRows(sheet,scheduledDataArray.length);
        gasc.logger.info("rows successfully added");
        var firstColumn = 1;
        gasc.spreadsheet.writeDataToSheet(sheet, rowIndexOfFirstDatapoint, firstColumn, scheduledDataArray);
        gasc.logger.info("rows successfully added");

        gasc.spreadsheet.lock.release(env.getLock());


        function removeConfigInEachQuerySet(querySets) {
            var i;
            for (i=0;i<querySets.length;i++) {
                delete querySets[i].config;
            }
        }
    };
}).apply(gasc.namespace.createNs("gasc.workflow.schedule"));


// ##################################################
// ##############  gasc.workflow.dailyTrigger ###########
// ##################################################

(function ( undefined ) {

    /**
     * Maximum execution duration for a trigger. Google sets this limit to 6min.
     */
    var TRIGGER_MAX_EXECUTION_TIME = 1000*60*6;

    /**
     * Since the execution time is limited a new query shall be started with this value in ms before the timeout.
     */
    var TRIGGER_MIN_EXECUTION_TIME_LEFT_FOR_QUERY_EXECUTION = 1000 * 20;


    this.triggerExecuter = function(env, sheet) {
        gasc.logger.info("trigger function started");

        gasc.spreadsheet.lock.wait(env.getLock());
        var querySetQueue = retrieveEntireQueue(sheet);
        var handledQuerySets = 0;
        var startDate = new Date();

        while (moreQuerySetsAreAvailable(handledQuerySets,querySetQueue) && enoughTimeForAnotherQueryIsLeft(startDate)) {
            var iQuerySet = gasc.spreadsheet.getQuerySet(env.activeSpreadsheet,querySetQueue[handledQuerySets].sheet,querySetQueue[handledQuerySets].row,querySetQueue[handledQuerySets].column);
            gasc.logger.fine("iQuerySet: " + JSON.stringify(iQuerySet));
            iQuerySet.analyticsResponse = gasc.analytics.executeAndRetryIfUnsuccessfull(iQuerySet.config.queryParam, env.apiFunctionCore);
            gasc.logger.info("analytics query received.");
            iQuerySet.output = gasc.view.generateOutputArray(iQuerySet.analyticsResponse,iQuerySet.config.presParam.showHeadersInResult);
            gasc.spreadsheet.writeOutputOfQuerySetToSheet(iQuerySet,env.activeSpreadsheet);
            handledQuerySets++;
        }

        gasc.spreadsheet.lock.release(env.getLock());

        function enoughTimeForAnotherQueryIsLeft(startDate) {
            var now = new Date();
            return ((now.getTime() - startDate.getTime()) < TRIGGER_MAX_EXECUTION_TIME - TRIGGER_MIN_EXECUTION_TIME_LEFT_FOR_QUERY_EXECUTION);
        }

        function moreQuerySetsAreAvailable(handledQuerySets,querySetQueue) {
            return handledQuerySets<querySetQueue.length;
        }
    };
}).apply(gasc.namespace.createNs("gasc.workflow.dailyTrigger"));



// ##################################################
// ##############  gasc.analytics ###################
// ##################################################

(function ( undefined ) {

    var API_QUERY_SLEEP_MS_BETWEEN_TRIES = 1000;
    var API_QUERY_TRYS_BEFORE_ABORT = 5;

    this.executeAndRetryIfUnsuccessfull = function (queryParam, apiFunction) {
        var apiQueryTries = 0;
        var apiQuerySuccess = false;
        var apiResult;

        while (apiQueryTries < API_QUERY_TRYS_BEFORE_ABORT) {
            try {
                gasc.logger.info("starting query to Google Analytics for the "+apiQueryTries+". time");
                apiResult = gasc.analytics.executeQuery(queryParam, apiFunction);
                gasc.logger.info("query was successfull");
                apiQuerySuccess = true;
            } catch (error) {
                gasc.logger.logError(error);
                Utilities.sleep(API_QUERY_SLEEP_MS_BETWEEN_TRIES);
            } finally {
                apiQueryTries++;
            }
        }

        if (!apiQuerySuccess) {
            throw "Analytics request failed " + apiQueryTries + " times. It is not further tried for this request.";
        }
        return apiResult;
    };


    this.executeQuery = function (queryParam, apiFunction) {
        gasc.logger.info("starting to generate optParameter");
        gasc.logger.fine("queryParam: " + JSON.stringify(queryParam));

        var optParameter = queryParam.genOptParamList();
        gasc.logger.info("optParameter for query: " + JSON.stringify(optParameter));

        return apiFunction(
            queryParam.analyticsId,
            queryParam.startDate,
            queryParam.endDate,
            queryParam.metrics,
            optParameter
        );
    }

}).apply(gasc.namespace.createNs("gasc.analytics"));



// ##################################################
// ##############  gasc.view ########################
// ##################################################

(function ( undefined ) {

    function generateHeaderRow(apiResponse) {
        var headerRow = [];
        for (var i = 0; i < apiResponse.columnHeaders.length; i++) {
            headerRow.push(apiResponse.columnHeaders[i].name);
        }
        return headerRow;
    }


    this.generateOutputArray = function (apiResponse,showHeadersInResult) {
        if (showHeadersInResult) {
            gasc.logger.info("Header is generated in output array");
            var output = [];
            output.push(generateHeaderRow(apiResponse));
            return output.concat(apiResponse.rows);
        } else {
            gasc.logger.info("No header is generated in output array");
            return apiResponse.rows;
        }
    };

    this.transform1dArrayTo2dArrayWithDatapointsBelowEachOther = function(oneDimArray) {
        var newArr = [];
        while(oneDimArray.length) {
            newArr.push(oneDimArray.splice(0,1));
        }
        return newArr;
    };

    this.transformArrayelementsToJson= function(origArray) {
        var jsonArray = [];
        var iIndex;
        for (iIndex = 0; iIndex < origArray.length;iIndex++ ) {
            jsonArray.push(JSON.stringify(origArray[iIndex]));
        }
        return jsonArray;
    }

}).apply(gasc.namespace.createNs("gasc.view"));


// ##################################################
// ##############  gasc.spreadsheet #################
// ##################################################

(function ( undefined ) {

    /**
     * writes an 2d array of data on a sheet.
     * @param sheet the sheet object in which the data shall be written
     * @param firstRowIndex the highes row in which the data shall be written
     * @param leftColumnIndex the most left column in which the data shall be written
     * @param data has to be a 2 dimensional rectangular grid of values
     */
    this.writeDataToSheet = function(sheet, firstRowIndex, leftColumnIndex, data) {
        var rangeOnSheetToBeFilled = sheet.getRange(firstRowIndex, leftColumnIndex, data.length, data[0].length);
        rangeOnSheetToBeFilled.setValue(data);
    };

    this.writeOutputOfQuerySetToSheet = function (querySet, spreadsheet) {
        var sheet = spreadsheet.getSheetByName(querySets.sheet);
        this.writeDataToSheet(sheet,querySets.getOutputStartRow(), querySets.getOutputStartColumn(),querySets.output);
    };

    this.getQuerySetsInRange = function (range) {
        var querySets = [];

        for (var iRow=1; iRow <= range.getNumRows(); iRow++) {
            for (var iColumn=1; iColumn <= range.getNumColumns(); iColumn++) {
                gasc.logger.info("starting to verify if range["+iRow+","+iColumn+"] contains a valid QuerySet");
                var iQuerySet = this.getQuerySetFromCell(range.getCell(iRow,iColumn));
                if (iQuerySet.containsValidConfig()) {
                    gasc.logger.info("valid config found in range["+iRow+","+iColumn+"]");
                    querySets.push(iQuerySet);
                } else {
                    gasc.logger.info("no valid config found in range["+iRow+","+iColumn+"]");
                }
            }
        }
        return querySets;
    };


    this.getQuerySetFromCell = function (cell){
        gasc.logger.info("initializing new querySets");
        var iQuerySet = new gasc.model.QuerySet();

        gasc.logger.info("starting to parse cell row: " + cell.getRow() + " column " + cell.getColumn());

        // TODO is there a better waz for creating type Config from json
        var configFromCell = gasc.util.tryParseJSON(cell.getValue());
        iQuerySet.config = new gasc.model.Config(configFromCell);

        var queryParam = new gasc.model.QueryParam(configFromCell.queryParam);
        iQuerySet.config.queryParam = queryParam;

        var presParam = new gasc.model.PresParam(configFromCell.presParam);
        iQuerySet.config.presParam = presParam;

        iQuerySet.sheet = cell.getSheet().getName();
        iQuerySet.row = cell.getRow();
        iQuerySet.column = cell.getColumn();

        return iQuerySet;
    };


    /**
     * The function add numberOfRows rows to the sheet. They are added after the last row that has content.
     * @param numberOfRows the amount of rows which shall be added.
     * @param sheet the sheet object in which the rows are added.
     * @returns The index of first row which was added.
     */
    this.addRows = function (sheet, numberOfRows) {
        var firstAddedRowIndex = sheet.getLastRow() + 1;
        gasc.logger.info("Last row with content in sheet:" + firstAddedRowIndex);
        sheet.insertRowsBefore(firstAddedRowIndex,numberOfRows);
        gasc.logger.info("Rows in sheet successfully added. Index of first added row is " + firstAddedRowIndex);
        return firstAddedRowIndex;
    };


    this.getOrCreateSheetByName = function(activeSpreadsheet, name) {
        var sheet = activeSpreadsheet.getSheetByName(name);
        if (sheet) {
            gasc.logger.info("Sheet with the name " + name + " was found.");
        } else {
            gasc.logger.info("Sheet with the name " + name + " was not found.");
            sheet = activeSpreadsheet.insertSheet(name);
            gasc.logger.info("Sheet with the name " + name + " was created.");
        }
        return sheet;
    };

    this.getQuerySet = function(activeSpreadsheet, sheetName, row, column) {
        var sheet = activeSpreadsheet.getSheetByName(sheetName);
        if (!sheet) throw "sheet with name " + sheetName + " was not found.";
        var cell = sheet.getCell(row, column);
        return getQuerySetFromCell(cell);
    };

}).apply(gasc.namespace.createNs("gasc.spreadsheet"));


// ##################################################
// ###########  gasc.spreadsheet.lock  ##############
// ##################################################

(function ( undefined ) {

   this.TRIGGER_LOCK_TIMEOUT = 5000;

   this.wait = function (lock) {
        var result = lock.waitLock(this.TRIGGER_LOCK_TIMEOUT);
        gasc.logger.info("lock is set");
        return result;
    };

   this.attempt = function (lock) {
       var result = lock.tryLock(this.TRIGGER_LOCK_TIMEOUT);
       gasc.logger.info("lock is set");
       return result;
   };

   this.release = function(lock) {
       var result = lock.releaseLock();
       gasc.logger.info("lock released");
       return result;
   };

}).apply(gasc.namespace.createNs("gasc.spreadsheet.lock"));


// ##################################################
// ##############  gasc.test ########################
// ##################################################

(function ( undefined ) {

    this.analyticsIdForTesting = "ga:53113218";

    this.runAllTests = function () {
        gasc.logger.log("########## Start: "+new Date()+" ##########");

        gasc.test.namespaceCreator.createNsTestWithoutHierarchy();
        gasc.test.namespaceCreator.createNsTestWithHierarchy();
        gasc.test.logger.loggerTests();
        gasc.test.customFunction.analyticsBTest();
        gasc.test.customFunction.analyticsBShowHeadersInResultFalse();
        gasc.test.customFunction.analyticsBShowHeadersInResultTrue();
        gasc.test.customFunction.analyticsRTest();
        gasc.test.spreadsheet.getQuerySetFromCellTest();
        gasc.test.spreadsheet.getQuerySetsInRangeTestValidConfig();
        gasc.test.spreadsheet.getQuerySetsInRangeTestInvalidConfig();
        gasc.test.spreadsheet.getOrCreateSheetByNameCaseGet();
        gasc.test.spreadsheet.getOrCreateSheetByNameCaseCreate();
        gasc.test.model.QuerySet.containsValidConfigTestFalseSimple();
        gasc.test.model.QuerySet.getOutputStartRowTestResultsBelow();
        gasc.test.model.QuerySet.getOutputStartRowTestResultsRight();
        gasc.test.model.QuerySet.getOutputStartColumnTestResultsBelow();
        gasc.test.model.QuerySet.getOutputStartColumnTestResultsRight();
        gasc.test.model.QueryParam.genOptParamListTest();
        gasc.test.util.tryParseJSONTestValid();
        gasc.test.analytics.executeQueryAndRetryIfUnsuccessfullSuccessfullQueryTest();
        gasc.test.view.generateOutputArrayTestHeadlineNoDimensionAllOf0();
        gasc.test.view.generateOutputArrayTestHeadlineNoDimensionAllOf1();
        gasc.test.view.generateOutputArrayTestHeadlineNoDimensionAllOf2();
        gasc.test.view.generateOutputArrayTestHeadlineYesDimensionAllOf0();
        gasc.test.view.generateOutputArrayTestHeadlineYesDimensionAllOf1();
        gasc.test.view.generateOutputArrayTestHeadlineYesDimensionAllOf2();
        gasc.test.view.transform1dArrayTo2dArrayWithDatapointsBelowEachOther();
        gasc.test.workflow.schedule.basicTest();

        gasc.test.analytics.analyticsAPITest(this.analyticsIdForTesting);


        // the following tests contain intentionally triggered exceptions
        // gasc.test.util.tryParseJSONTestInvalid();
        // FIXME should work just like that but doesn't gasc.test.analytics.executeQueryAndRetryIfUnsuccessfullUnsuccessfullQueryTest();

    };

}).apply(gasc.namespace.createNs("gasc.test"));



// ##################################################
// ##############  gasc.test.logger #################
// ##################################################

(function ( undefined ) {

    this.loggerTests = function() {
        gasc.logger.info("Test gasc.test.logger.loggerTest started");
        var testLogInterface = {
            log: function (data) {
                GSUnit.assertContains(" Stack: ",data);
            }
        };

        var originalInterface = gasc.logger.logInterface;

        gasc.logger.logInterface = testLogInterface;
        gasc.logger.logError("test error string");

        // reset logger to use normal logInterface
        gasc.logger.logInterface = originalInterface;

    }

}).apply(gasc.namespace.createNs("gasc.test.logger"));




// ##################################################
// ##############  gasc.test.util #################
// ##################################################

(function ( undefined ) {

    // TODO Is test namespace good or is a seperate test namespace in the namespace it verifies a better option
    this.tryParseJSONTestInvalid = function() {
        //TODO refactor into seperate functions?
        var wrongJSON1 = "asdf";
        GSUnit.assertEvaluatesToFalse(gasc.util.tryParseJSON(wrongJSON1));

        var wrongJSON2 = 12;
        GSUnit.assertEvaluatesToFalse(gasc.util.tryParseJSON(wrongJSON2));

        var wrongJSON3 = "";
        GSUnit.assertEvaluatesToFalse(gasc.util.tryParseJSON(wrongJSON3));

        var wrongJSON4 = null;
        GSUnit.assertEvaluatesToFalse(gasc.util.tryParseJSON(wrongJSON4));

        var wrongJSON5 = "undefined";
        GSUnit.assertEvaluatesToFalse(gasc.util.tryParseJSON(wrongJSON5));

    };

    this.tryParseJSONTestValid = function() {
        var validJSON1 = "{\"employees\":[{\"firstName\":\"John\",\"lastName\":\"Doe\"},{\"firstName\":\"Anna\",\"lastName\":\"Smith\"},{\"firstName\":\"Peter\",\"lastName\":\"Jones\"}]}";
        GSUnit.assertEvaluatesToTrue(gasc.util.tryParseJSON(validJSON1));
    };

}).apply(gasc.namespace.createNs("gasc.test.util"));


// ##################################################
// ##############  gasc.test.spreadsheet ############
// ##################################################

(function ( undefined ) {
    this.getQuerySetFromCellTest = function () {
        var analyticsID = "ga:1111111";
        var row = 1;
        var column = 2;
        var sheetName = "sheeet";
        var showHeadersInResult = true;

        var testCell = {
            getValue: function () {
                var correctJson = "{\"queryParam\":{\"analyticsId\":\"" + analyticsID + "\",\"startDate\":\"2015-09-13\",\"endDate\":\"2015-09-19\",\"metrics\":\"ga:transactionRevenue\",\"segment\":\"\",\"filter\":\"\",\"dimension\":\"\",\"sort\":\"\",\"startIndex\":0,\"maxResults\":1,\"samplingLevel\":\"DEFAULT\",\"fields\":\"\"},\"presParam\":{\"showHeadersInResult\":" + showHeadersInResult + ",\"positionOfResults\":\"BELOW\"}}";
                return correctJson;
            },
            getRow: function () {
                return row;
            },
            getSheet: function () {
                return {
                    getName: function () {
                        return sheetName;
                    }
                };
            },
            getColumn: function () {
                return column;
            }
        };

        var querySet = gasc.spreadsheet.getQuerySetFromCell(testCell);
        GSUnit.assertEquals(analyticsID, querySet.config.queryParam.analyticsId);
        GSUnit.assertEquals(showHeadersInResult, querySet.config.presParam.showHeadersInResult );
        GSUnit.assertEquals(row, querySet.row);
        GSUnit.assertEquals(column, querySet.column);
        GSUnit.assertEquals(sheetName, querySet.sheet);
        GSUnit.assertTrue(querySet.containsValidConfig());
    };

    function generateConfig() {
        var correctConfig = "{\"queryParam\":{\"analyticsId\":\"ga:111111\",\"startDate\":\"2015-09-13\",\"endDate\":\"2015-09-19\",\"metrics\":\"ga:transactionRevenue\",\"segment\":\"\",\"filter\":\"\",\"dimension\":\"\",\"sort\":\"\",\"startIndex\":0,\"maxResults\":1,\"samplingLevel\":\"DEFAULT\",\"fields\":\"\"},\"presParam\":{\"showHeadersInResult\":false,\"positionOfResults\":\"BELOW\"}}";
        return JSON.parse(correctConfig);
    }

    function replaceGetQuerySetFromCellWithValidConfigMockup() {
        gasc.spreadsheet.getQuerySetFromCell = function() {
            var iQuerySet = new gasc.model.QuerySet();
            iQuerySet.config = generateConfig();
            return iQuerySet;
        };
    }

    function replaceGetQuerySetFromCellWithInvalidConfigMockup() {
        gasc.spreadsheet.getQuerySetFromCell = function() {
            var iQuerySet = new gasc.model.QuerySet();
            iQuerySet.config = "";
            return iQuerySet;
        };
    }

    function generateDummyRange() {
        return {
            getNumRows : function() {
                return 1;
            },
            getNumColumns : function () {
                return 1;
            },
            getCell : function() {
                return true;
            }
        };
    }

    this.getQuerySetsInRangeTestValidConfig = function() {

        var getQuerySetFromCellFunctionBackup = gasc.spreadsheet.getQuerySetFromCell;
        replaceGetQuerySetFromCellWithValidConfigMockup();

        var querySets = gasc.spreadsheet.getQuerySetsInRange(generateDummyRange());

        GSUnit.assertEquals(querySets.length,1);
        GSUnit.assertEquals(querySets[0].config.toString(),generateConfig().toString());

        // restore normal function
        gasc.spreadsheet.getQuerySetFromCell = getQuerySetFromCellFunctionBackup;
    };

    this.getQuerySetsInRangeTestInvalidConfig = function() {

        var getQuerySetFromCellFunctionBackup = gasc.spreadsheet.getQuerySetFromCell;
        replaceGetQuerySetFromCellWithInvalidConfigMockup();

        var querySets = gasc.spreadsheet.getQuerySetsInRange(generateDummyRange());

        GSUnit.assertEquals(querySets.length,0);

        // restore normal function
        gasc.spreadsheet.getQuerySetFromCell = getQuerySetFromCellFunctionBackup;
    };

    this.getOrCreateSheetByNameCaseGet = function() {
        var sheetName = 'sheetname';
        var sheetInSpreadsheet = {
            name:sheetName,
            isNew : false
        };
        var dummySpreadsheet = {
            getSheetByName : function() {
                return sheetInSpreadsheet;
            }
        };

        var returnedSheet = gasc.spreadsheet.getOrCreateSheetByName(dummySpreadsheet,sheetName);
        GSUnit.assertEquals(returnedSheet.name,sheetName);
        GSUnit.assertFalse(returnedSheet.isNew);
    };

    this.getOrCreateSheetByNameCaseCreate = function() {
        var sheetName = 'sheetname';
        var sheetInSpreadsheet = {
            name:sheetName,
            isNew : true
        };
        var dummySpreadsheet = {
            getSheetByName : function() {
                return null;
            },
            insertSheet : function() {
                return sheetInSpreadsheet;
            }
        };

        var returnedSheet = gasc.spreadsheet.getOrCreateSheetByName(dummySpreadsheet,sheetName);
        GSUnit.assertEquals(returnedSheet.name,sheetName);
        GSUnit.assertTrue(returnedSheet.isNew);
    };

}).apply(gasc.namespace.createNs("gasc.test.spreadsheet"));

// ##################################################
// ############  gasc.test.namespaceCreator  ########
// ##################################################

(function ( undefined ) {
    this.createNsTestWithoutHierarchy = function() {
        var namespaceNameWithoutHierarchy = "gasc.testspace";

        var testspace;
        // TODO use variable for testspace variable name
        GSUnit.assertUndefined(gasc.testspace);
        gasc.namespace.createNs(namespaceNameWithoutHierarchy);
        GSUnit.assertNotUndefined(gasc.testspace);
    };

    this.createNsTestWithHierarchy = function() {
        var namespaceNameWithHierarchy = "gasc.testspace2.test";

        // TODO use variable for testspace variable name
        var testspace2;
        GSUnit.assertUndefined(gasc.testspace2);
        gasc.namespace.createNs(namespaceNameWithHierarchy);
        GSUnit.assertNotUndefined(gasc.testspace2);
        GSUnit.assertNotUndefined(gasc.testspace2.test);
    }

}).apply(gasc.namespace.createNs("gasc.test.namespaceCreator"));


// ##################################################
// ##############  gasc.test.customFunction #########
// ##################################################

(function ( undefined ) {

    this.analyticsBTest = function() {
        gasc.logger.info("Test gasc.test.customFunction.analyticsBTest started - test custom spreadsheet function ANALYTICSB with mandatory attributes");
        var config = customFunctionBaseTest(ANALYTICSB);
        GSUnit.assertContains("\"positionOfResults\":\"" + gasc.model.PresParam.PositionOfResults.BELOW + "\"",config);
        GSUnit.assertContains("\"showHeadersInResult\":false",config);
    };

    this.analyticsRTest = function() {
        gasc.logger.info("Test gasc.test.customFunction.analyticsRTest started - test custom spreadsheet function ANALYTICSR with mandatory attributes");
        var config = customFunctionBaseTest(ANALYTICSR);
        GSUnit.assertContains("\"positionOfResults\":\"" + gasc.model.PresParam.PositionOfResults.RIGHT + "\"",config);
    };

    this.analyticsBShowHeadersInResultTrue = function() {
        gasc.logger.info("Test gasc.test.customFunction.analyticsBShowHeadersInResultTrue started - ANALYTICSB saves ShowHeadersInResult true");
        var config = ANALYTICSB("ga:1234", "2015-01-01", "2015-01-02", "ga:sessions", "", "", "", "", 0, 1, true);
        GSUnit.assertContains("\"showHeadersInResult\":true",config);
    };

    this.analyticsBShowHeadersInResultFalse = function() {
        gasc.logger.info("Test gasc.test.customFunction.analyticsBShowHeadersInResultFalse started - ANALYTICSB saves ShowHeadersInResult false");
        var config = ANALYTICSB("ga:1234", "2015-01-01", "2015-01-02", "ga:sessions", "", "", "", "", 0, 1, false);
        GSUnit.assertContains("\"showHeadersInResult\":false",config);
    };

    function customFunctionBaseTest(formulaFunction) {
        var analyticsId = "ga:67000000";
        var startDate = "2015-01-01";
        var endDate = new Date("January 2, 2015");
        var metric = "ga:pageViews";
        var config = formulaFunction(analyticsId, startDate, endDate, metric);

        GSUnit.assertContains(analyticsId,config);
        GSUnit.assertContains(startDate,config);
        GSUnit.assertContains(metric,config);
        GSUnit.assertContains("2015-01-02",config);

        return config;
    }

}).apply(gasc.namespace.createNs("gasc.test.customFunction"));

// ##################################################
// ##############  gasc.test.model.QuerySet #########
// ##################################################

(function ( undefined ) {

    this.containsValidConfigTestFalseSimple = function () {
        var querySet = new gasc.model.QuerySet();
        querySet.config = false;

        GSUnit.assertFalse(querySet.containsValidConfig());
    };

    this.getOutputStartRowTestResultsBelow = function () {
        var querySet = new gasc.model.QuerySet();
        querySet.config = new gasc.model.Config();
        querySet.row = 1;
        querySet.config.presParam.positionOfResults = gasc.model.PresParam.PositionOfResults.BELOW;

        GSUnit.assertEquals(querySet.row + 1, querySet.getOutputStartRow());
    };

    this.getOutputStartRowTestResultsRight = function () {
        var querySet = new gasc.model.QuerySet();
        querySet.config = new gasc.model.Config();
        querySet.row = 1;
        querySet.config.presParam.positionOfResults = gasc.model.PresParam.PositionOfResults.RIGHT;

        GSUnit.assertEquals(querySet.row, querySet.getOutputStartRow());
    };

    this.getOutputStartColumnTestResultsBelow = function (){
        var querySet = new gasc.model.QuerySet();
        querySet.config = new gasc.model.Config();
        querySet.column = 1;
        querySet.config.presParam.positionOfResults = gasc.model.PresParam.PositionOfResults.BELOW;

        GSUnit.assertEquals(querySet.column, querySet.getOutputStartColumn());
    };

    this.getOutputStartColumnTestResultsRight = function (){
        var querySet = new gasc.model.QuerySet();
        querySet.config = new gasc.model.Config();
        querySet.column = 1;
        querySet.config.presParam.positionOfResults = gasc.model.PresParam.PositionOfResults.RIGHT;

        GSUnit.assertEquals(querySet.column + 1, querySet.getOutputStartColumn());
    };

}).apply(gasc.namespace.createNs("gasc.test.model.QuerySet"));


// ##################################################
// ##############  gasc.test.model.QueryParam #########
// ##################################################

(function ( undefined ) {

    this.genOptParamListTest = function () {
        var queryParam = new gasc.model.QueryParam();
        queryParam.startIndex = 1;

        var queryParamJson = JSON.stringify(queryParam.genOptParamList());
        GSUnit.assertContains("start-index",queryParamJson);
    }

}).apply(gasc.namespace.createNs("gasc.test.model.QueryParam"));



// ##################################################
// ##############  gasc.test.analytics ###################
// ##################################################

(function ( undefined ) {

    var apiReturn0Dimension = "{\"totalResults\":1,\"query\":{\"metrics\":[\"ga:sessions\"],\"max-results\":1,\"end-date\":\"2015-01-28\",\"ids\":\"ga:123\",\"start-index\":1,\"start-date\":\"2015-01-01\"},\"kind\":\"analytics#gaData\",\"columnHeaders\":[{\"dataType\":\"INTEGER\",\"columnType\":\"METRIC\",\"name\":\"ga:sessions\"}],\"id\":\"https://www.googleapis.com/analytics/v3/data/ga?ids=ga:123&metrics=ga:sessions&start-date=2015-01-01&end-date=2015-01-28&max-results=1\",\"totalsForAllResults\":{\"ga:sessions\":\"20\"},\"itemsPerPage\":1,\"profileInfo\":{\"accountId\":\"123\",\"webPropertyId\":\"UA-123-1\",\"tableId\":\"ga:123\",\"profileId\":\"123\",\"profileName\":\"example\",\"internalWebPropertyId\":\"123\"},\"selfLink\":\"https://www.googleapis.com/analytics/v3/data/ga?ids=ga:123&metrics=ga:sessions&start-date=2015-01-01&end-date=2015-01-28&max-results=1\",\"rows\":[[\"5555\"]],\"containsSampledData\":false}";
    var apiReturn1Dimension = "{\"totalResults\":222,\"query\":{\"metrics\":[\"ga:sessions\",\"ga:pageViews\"],\"max-results\":1,\"dimensions\":\"ga:sourceMedium\",\"end-date\":\"2015-01-28\",\"ids\":\"ga:123\",\"start-index\":1,\"start-date\":\"2015-01-01\"},\"kind\":\"analytics#gaData\",\"columnHeaders\":[{\"dataType\":\"STRING\",\"columnType\":\"DIMENSION\",\"name\":\"ga:sourceMedium\"},{\"dataType\":\"INTEGER\",\"columnType\":\"METRIC\",\"name\":\"ga:sessions\"},{\"dataType\":\"INTEGER\",\"columnType\":\"METRIC\",\"name\":\"ga:pageViews\"}],\"id\":\"https://www.googleapis.com/analytics/v3/data/ga?ids=ga:123&dimensions=ga:sourceMedium&metrics=ga:sessions,ga:pageViews&start-date=2015-01-01&end-date=2015-01-28&max-results=1\",\"totalsForAllResults\":{\"ga:pageViews\":\"444\",\"ga:sessions\":\"444\"},\"itemsPerPage\":1,\"profileInfo\":{\"accountId\":\"123\",\"webPropertyId\":\"UA-123-1\",\"tableId\":\"ga:123\",\"profileId\":\"123\",\"profileName\":\"test\",\"internalWebPropertyId\":\"123\"},\"selfLink\":\"https://www.googleapis.com/analytics/v3/data/ga?ids=ga:123&dimensions=ga:sourceMedium&metrics=ga:sessions,ga:pageViews&start-date=2015-01-01&end-date=2015-01-28&max-results=1\",\"nextLink\":\"https://www.googleapis.com/analytics/v3/data/ga?ids=ga:123&dimensions=ga:sourceMedium&metrics=ga:sessions,ga:pageViews&start-date=2015-01-01&end-date=2015-01-28&start-index=2&max-results=1\",\"rows\":[[\"(direct) / (none)\",\"44444\",\"5555\"]],\"containsSampledData\":false}";
    var apiReturn2Dimension = "{\"totalResults\":333,\"query\":{\"metrics\":[\"ga:sessions\",\"ga:pageViews\"],\"max-results\":5,\"dimensions\":\"ga:sourceMedium,ga:landingPagePath\",\"end-date\":\"2015-01-28\",\"ids\":\"ga:123\",\"start-index\":1,\"start-date\":\"2015-01-01\"},\"kind\":\"analytics#gaData\",\"columnHeaders\":[{\"dataType\":\"STRING\",\"columnType\":\"DIMENSION\",\"name\":\"ga:sourceMedium\"},{\"dataType\":\"STRING\",\"columnType\":\"DIMENSION\",\"name\":\"ga:landingPagePath\"},{\"dataType\":\"INTEGER\",\"columnType\":\"METRIC\",\"name\":\"ga:sessions\"},{\"dataType\":\"INTEGER\",\"columnType\":\"METRIC\",\"name\":\"ga:pageViews\"}],\"id\":\"https://www.googleapis.com/analytics/v3/data/ga?ids=ga:123&dimensions=ga:sourceMedium,ga:landingPagePath&metrics=ga:sessions,ga:pageViews&start-date=2015-01-01&end-date=2015-01-28&max-results=5\",\"totalsForAllResults\":{\"ga:pageViews\":\"4444\",\"ga:sessions\":\"5555\"},\"itemsPerPage\":5,\"profileInfo\":{\"accountId\":\"123\",\"webPropertyId\":\"UA-123-1\",\"tableId\":\"ga:123\",\"profileId\":\"123\",\"profileName\":\"test\",\"internalWebPropertyId\":\"123\"},\"selfLink\":\"https://www.googleapis.com/analytics/v3/data/ga?ids=ga:123&dimensions=ga:sourceMedium,ga:landingPagePath&metrics=ga:sessions,ga:pageViews&start-date=2015-01-01&end-date=2015-01-28&max-results=5\",\"nextLink\":\"https://www.googleapis.com/analytics/v3/data/ga?ids=ga:123&dimensions=ga:sourceMedium,ga:landingPagePath&metrics=ga:sessions,ga:pageViews&start-date=2015-01-01&end-date=2015-01-28&start-index=6&max-results=5\",\"rows\":[[\"(direct) / (none)\",\"(not set)\",\"18\",\"0\"],[\"(direct) / (none)\",\"/\",\"444\",\"555\"],[\"(direct) / (none)\",\"/, https://www.test.de/\",\"169\",\"169\"],[\"(direct) / (none)\",\"/,https://www.test.de/\",\"1\",\"1\"],[\"(direct) / (none)\",\"/-100-33221.html\",\"3\",\"7\"]],\"containsSampledData\":false}";


    this.executeQueryAndRetryIfUnsuccessfullSuccessfullQueryTest = function () {

        var apiMockupValidResult = function (a,b,c,d,e) {
            return apiReturn0Dimension;
        };

        var queryParam = new gasc.model.QueryParam();
        var apiResultFromTest = gasc.analytics.executeAndRetryIfUnsuccessfull(queryParam, apiMockupValidResult);

        GSUnit.assertEquals(apiResultFromTest,apiReturn0Dimension);
    };

    this.executeQueryAndRetryIfUnsuccessfullUnsuccessfullQueryTest = function () {
        var partOfErrorMsg = "times. It is not further tried for this request.";

        var executeQueryMockupInvalidResult = function () {
            throw "intentionally exception for test";
        };

        var queryParam = {};
        try {
            var apiResultFromTest = gasc.analytics.executeAndRetryIfUnsuccessfull(queryParam, executeQueryMockupInvalidResult);
            GSUnit.fail();
        } catch (error) {
            GSUnit.assertContains(error.message,partOfErrorMsg);
        }
    };


    this.analyticsAPITest = function(analyticsIdForTesting) {
        var env = gasc.env.generateProductionEnvironment();
        var apiFunction = env.apiFunctionCore;

        var queryParam = new gasc.model.QueryParam();
        queryParam.startDate = "2015-01-13";
        queryParam.endDate = "2015-01-20";
        queryParam.analyticsId = analyticsIdForTesting;
        queryParam.metrics = "ga:sessions";

        var apiResult = apiFunction(
            queryParam.analyticsId,
            queryParam.startDate,
            queryParam.endDate,
            queryParam.metrics/*,
             optParameter*/
        );

        GSUnit.assertEvaluatesToTrue(apiResult);
    };

}).apply(gasc.namespace.createNs("gasc.test.analytics"));


// ##################################################
// ##############  gasc.test.view ###################
// ##################################################

(function ( undefined ) {

    var apiReturn0Dimension = "{\"kind\":\"analytics#gaData\",\"id\":\"https:\/\/www.googleapis.com\/analytics\/v3\/data\/ga?ids=ga:53113218&metrics=ga:users&start-date=30daysAgo&end-date=yesterday\",\"query\":{\"start-date\":\"30daysAgo\",\"end-date\":\"yesterday\",\"ids\":\"ga:53113218\",\"metrics\":[\"ga:users\"],\"start-index\":1,\"max-results\":1000},\"itemsPerPage\":1000,\"totalResults\":1,\"selfLink\":\"https:\/\/www.googleapis.com\/analytics\/v3\/data\/ga?ids=ga:53113218&metrics=ga:users&start-date=30daysAgo&end-date=yesterday\",\"profileInfo\":{\"profileId\":\"53113218\",\"accountId\":\"27202531\",\"webPropertyId\":\"UA-27202531-1\",\"internalWebPropertyId\":\"52344542\",\"profileName\":\"nu3 DE\",\"tableId\":\"ga:53113218\"},\"containsSampledData\":false,\"columnHeaders\":[{\"name\":\"ga:users\",\"columnType\":\"METRIC\",\"dataType\":\"INTEGER\"}],\"totalsForAllResults\":{\"ga:users\":\"272386\"},\"rows\":[[\"272386\"]]}";
    var apiReturn1Dimension = "{\"kind\":\"analytics#gaData\",\"id\":\"https:\/\/www.googleapis.com\/analytics\/v3\/data\/ga?ids=ga:123123&dimensions=ga:userType&metrics=ga:users&start-date=30daysAgo&end-date=yesterday\",\"query\":{\"start-date\":\"30daysAgo\",\"end-date\":\"yesterday\",\"ids\":\"ga:123123\",\"dimensions\":\"ga:userType\",\"metrics\":[\"ga:users\"],\"start-index\":1,\"max-results\":1000},\"itemsPerPage\":1000,\"totalResults\":2,\"selfLink\":\"https:\/\/www.googleapis.com\/analytics\/v3\/data\/ga?ids=ga:123123&dimensions=ga:userType&metrics=ga:users&start-date=30daysAgo&end-date=yesterday\",\"profileInfo\":{\"profileId\":\"123123\",\"accountId\":\"234234\",\"webPropertyId\":\"UA-234122-1\",\"internalWebPropertyId\":\"234123\",\"profileName\":\"asdf\",\"tableId\":\"ga:123123\"},\"containsSampledData\":false,\"columnHeaders\":[{\"name\":\"ga:userType\",\"columnType\":\"DIMENSION\",\"dataType\":\"STRING\"},{\"name\":\"ga:users\",\"columnType\":\"METRIC\",\"dataType\":\"INTEGER\"}],\"totalsForAllResults\":{\"ga:users\":\"3333\"},\"rows\":[[\"New Visitor\",\"2222\"],[\"Returning Visitor\",\"1111\"]]}";
    var apiReturn2Dimension = "{\"kind\":\"analytics#gaData\",\"id\":\"https:\/\/www.googleapis.com\/analytics\/v3\/data\/ga?ids=ga:123&dimensions=ga:userType,ga:deviceCategory&metrics=ga:users&start-date=30daysAgo&end-date=yesterday\",\"query\":{\"start-date\":\"30daysAgo\",\"end-date\":\"yesterday\",\"ids\":\"ga:123\",\"dimensions\":\"ga:userType,ga:deviceCategory\",\"metrics\":[\"ga:users\"],\"start-index\":1,\"max-results\":1000},\"itemsPerPage\":1000,\"totalResults\":6,\"selfLink\":\"https:\/\/www.googleapis.com\/analytics\/v3\/data\/ga?ids=ga:123&dimensions=ga:userType,ga:deviceCategory&metrics=ga:users&start-date=30daysAgo&end-date=yesterday\",\"profileInfo\":{\"profileId\":\"123\",\"accountId\":\"1231\",\"webPropertyId\":\"UA-123123-1\",\"internalWebPropertyId\":\"123\",\"profileName\":\"asdf\",\"tableId\":\"ga:123\"},\"containsSampledData\":false,\"columnHeaders\":[{\"name\":\"ga:userType\",\"columnType\":\"DIMENSION\",\"dataType\":\"STRING\"},{\"name\":\"ga:deviceCategory\",\"columnType\":\"DIMENSION\",\"dataType\":\"STRING\"},{\"name\":\"ga:users\",\"columnType\":\"METRIC\",\"dataType\":\"INTEGER\"}],\"totalsForAllResults\":{\"ga:users\":\"1111\"},\"rows\":[[\"New Visitor\",\"desktop\",\"123\"],[\"New Visitor\",\"mobile\",\"1234\"],[\"New Visitor\",\"tablet\",\"42134\"],[\"Returning Visitor\",\"desktop\",\"42134\"],[\"Returning Visitor\",\"mobile\",\"432423\"],[\"Returning Visitor\",\"tablet\",\"123443\"]]}";

    function testOutputArray(apiString,presParam,amountOfDisplayedDimensions) {
        var apiReturn = JSON.parse(apiString);
        var output = gasc.view.generateOutputArray(apiReturn,presParam.showHeadersInResult);

        var amountOfColumnsForData = 1;
        GSUnit.assertEquals(amountOfDisplayedDimensions + amountOfColumnsForData,output[0].length);

        var rowsForHeadline = presParam.showHeadersInResult ? 1 : 0;
        GSUnit.assertEquals(apiReturn.rows.length + rowsForHeadline,output.length);
    }


    this.generateOutputArrayTestHeadlineNoDimensionAllOf0 = function () {
        var presParam = new gasc.model.PresParam();
        presParam.showHeadersInResult = false;

        testOutputArray(apiReturn0Dimension,presParam,0);
    };

    this.generateOutputArrayTestHeadlineNoDimensionAllOf1 = function () {
        var presParam = new gasc.model.PresParam();
        presParam.showHeadersInResult = false;

        testOutputArray(apiReturn1Dimension,presParam,1);
    };

    this.generateOutputArrayTestHeadlineNoDimensionAllOf2 = function () {
        var presParam = new gasc.model.PresParam();
        presParam.showHeadersInResult = false;

        testOutputArray(apiReturn2Dimension,presParam,2);
    };

    this.generateOutputArrayTestHeadlineYesDimensionAllOf0 = function () {
        var presParam = new gasc.model.PresParam();
        presParam.showHeadersInResult = true;

        testOutputArray(apiReturn0Dimension,presParam,0);
    };

    this.generateOutputArrayTestHeadlineYesDimensionAllOf1 = function () {
        var presParam = new gasc.model.PresParam();
        presParam.showHeadersInResult = true;

        testOutputArray(apiReturn1Dimension,presParam,1);
    };

    this.generateOutputArrayTestHeadlineYesDimensionAllOf2 = function () {
        var presParam = new gasc.model.PresParam();
        presParam.showHeadersInResult = true;

        testOutputArray(apiReturn2Dimension,presParam,2);
    };

    this.transform1dArrayTo2dArrayWithDatapointsBelowEachOther = function() {
        var oneDArray = [0,1,2,3];
        var transformedArray = gasc.view.transform1dArrayTo2dArrayWithDatapointsBelowEachOther(oneDArray);
        GSUnit.assertEquals(0,transformedArray[0][0]);
        GSUnit.assertEquals(1,transformedArray[1][0]);
        GSUnit.assertEquals(2,transformedArray[2][0]);
        GSUnit.assertEquals(3,transformedArray[3][0]);
    };

}).apply(gasc.namespace.createNs("gasc.test.view"));



 //##################################################
 //##########  gasc.test.workflow.schedule ##########
 //##################################################

(function ( undefined ) {
    var dummyRangeWithScheduledData = {
        scheduledData : "",
        numberOfDataWrites : 0,
        setValue : function(data) {
            this.scheduledData = data;
            this.numberOfDataWrites++;
        }
    };

    var dummySheetWithQueue = {
        getRange : function(a,b) {
            return dummyRangeWithScheduledData;
        },
        getLastRow : function() {
            return 1;
        },
        insertRowsBefore : function() {
        }
    };


    var dummySheetWithQuery = {
        getRange : function(a,b) {
            return dummyRangeWithQueryData;
        },
        getName : function() {
            return "dummySheetWithQuery";
        }
    };


    var dummyLock = {
        lockCount : 0,
        waitLock : function () {
            this.lockCount++;
        },
        tryLock : function () {
            this.lockCount++;
        },

        releaseLock : function () {
            this.lockCount--;
        }
    };

    var dummyRangeWithQueryData = {
        getNumRows : function() {
            return 1;
        },
        getNumColumns : function() {
            return 1;
        },
        getCell : function(a,b) {
            return {
                getRow : function () {
                    return 1;
                },
                getColumn : function() {
                    return 2;
                },
                getValue : function() {
                    return "{\"queryParam\":{\"analyticsId\":\"ga:67435389\",\"startDate\":\"2015-11-24\",\"endDate\":\"2015-11-30\",\"metrics\":\"ga:transactionRevenue\",\"segment\":\"\",\"filter\":\"\",\"dimension\":\"\",\"sort\":\"\",\"startIndex\":0,\"maxResults\":1,\"samplingLevel\":\"\",\"fields\":\"\"},\"presParam\":{\"showHeadersInResult\":false,\"positionOfResults\":\"RIGHT\"}}";
                },
                getSheet : function() {
                    return dummySheetWithQuery;
                }
            };
        }
    };

    var apiMock = function(a,b,c,d,e) {
        var apiReturn0Dimension = "{\"totalResults\":1,\"query\":{\"metrics\":[\"ga:sessions\"],\"max-results\":1,\"end-date\":\"2015-01-28\",\"ids\":\"ga:123\",\"start-index\":1,\"start-date\":\"2015-01-01\"},\"kind\":\"analytics#gaData\",\"columnHeaders\":[{\"dataType\":\"INTEGER\",\"columnType\":\"METRIC\",\"name\":\"ga:sessions\"}],\"id\":\"https://www.googleapis.com/analytics/v3/data/ga?ids=ga:123&metrics=ga:sessions&start-date=2015-01-01&end-date=2015-01-28&max-results=1\",\"totalsForAllResults\":{\"ga:sessions\":\"20\"},\"itemsPerPage\":1,\"profileInfo\":{\"accountId\":\"123\",\"webPropertyId\":\"UA-123-1\",\"tableId\":\"ga:123\",\"profileId\":\"123\",\"profileName\":\"example\",\"internalWebPropertyId\":\"123\"},\"selfLink\":\"https://www.googleapis.com/analytics/v3/data/ga?ids=ga:123&metrics=ga:sessions&start-date=2015-01-01&end-date=2015-01-28&max-results=1\",\"rows\":[[\"5555\"]],\"containsSampledData\":false}";
        return apiReturn0Dimension;
    };

    var env = {
        getScheduledDataDailyUpdateSheet : function() {
            return dummySheetWithQueue;
        },
        getLock : function() {
            return dummyLock;
        },
        apiFunctionCore : apiMock,
        activeSpreadsheet : dummySheetWithQuery,
        activeRange : dummyRangeWithQueryData
    };

    this.basicTest = function() {
        gasc.workflow.schedule.scheduleQueriesInActiveRangeToSheet(env,dummySheetWithQueue);
        GSUnit.assertEquals(0,dummyLock.lockCount);
        GSUnit.assertNotEquals(dummyRangeWithScheduledData.scheduledData,"");
        GSUnit.assertEquals(1,dummyRangeWithScheduledData.numberOfDataWrites);
    };


}).apply(gasc.namespace.createNs("gasc.test.workflow.schedule"));

