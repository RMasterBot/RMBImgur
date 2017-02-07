var Bot = require(require('path').join('..','..','core','bot.js'));

/**
 * Imgur Bot
 * @class Imgur
 * @augments Bot
 * @param {string} name
 * @param {string} folder
 * @param {Imgur~Configuration[]} allConfigurations
 * @constructor
 */
function Imgur(name, folder, allConfigurations){
  Bot.call(this, name, folder, allConfigurations);

  this.defaultValues.hostname = 'api.imgur.com';
  
  this.defaultValues.httpModule = 'https';
  this.defaultValues.pathPrefix = '3';
  this.defaultValues.port = 443;
  
  this.defaultValues.defaultRemainingRequest = 1250;
  this.defaultValues.defaultRemainingTime = 60*60*24;
}

Imgur.prototype = new Bot();
Imgur.prototype.constructor = Imgur;

/**
 * Prepare and complete parameters for request
 * @param {Bot~doRequestParameters} parameters
 * @param {Bot~requestCallback|*} callback
 */
Imgur.prototype.prepareRequest = function(parameters, callback) {
  this.addQueryAccessToken(parameters);

  this.doRequest(parameters, callback);
};

/**
 * API myAccount
 * @param {Imgur~requestCallback} callback
 */
Imgur.prototype.myAccount = function(callback) {
  var params = {
    method: 'GET',
    path: 'account/me',
    output: {
      model: 'Account'
    }
  };

  this.prepareRequest(params, callback);
};


/**
 * Add access token to query parameters
 * @param {Bot~doRequestParameters} parameters
 */
Imgur.prototype.addQueryAccessToken = function(parameters) {
  if(parameters.headers === undefined) {
    parameters.headers = {};
  }

  parameters.headers.Authorization = 'Bearer ' + this.accessToken.access_token;
};

/**
 * Get remaining requests from result 
 * @param {Request~Response} resultFromRequest
 * @return {Number}
 */
Imgur.prototype.getRemainingRequestsFromResult = function(resultFromRequest) {
  return resultFromRequest.headers['x-ratelimit-userremaining'] >> 0;
};

/**
 * Get url for Access Token when you have to authorize an application
 * @param {string} scopes
 * @param {*} callback
 */
Imgur.prototype.getAccessTokenUrl = function(scopes, callback) {
  var url = 'https://api.imgur.com/oauth2/authorize?'
    + 'response_type=code&'
    + 'state=' + this.generateRandom() + '&'
    + 'client_id=' + this.currentConfiguration.app_id;

  callback(url);
};

/**
 * Extract response in data for Access Token
 * @param {Object} req request from local node server
 * @return {*} code or something from response
 */
Imgur.prototype.extractResponseDataForAccessToken = function(req) {
  var query = require('url').parse(req.url, true).query;

  if(query.code === undefined) {
    return null;
  }

  return query.code;
};

/**
 * Request Access Token after getting code
 * @param {string} responseData
 * @param {Bot~requestAccessTokenCallback} callback
 */
Imgur.prototype.requestAccessToken = function(responseData, callback) {
  var params = {
    hostname: 'api.imgur.com',
    method: 'POST',
    path: 'oauth2/token',
    pathPrefix: '',
    post: {
      client_id: this.currentConfiguration.app_id,
      client_secret: this.currentConfiguration.app_secret,
      grant_type: 'authorization_code',
      code: responseData
    }
  };

  this.request(params, function(error, result){
    if(error) {
      callback(error, null);
      return;
    }

    if(result.statusCode === 200) {
      callback(null, JSON.parse(result.data));
    }
    else {
      callback(JSON.parse(result.data), null);
    }
  });
};

Imgur.prototype.formatNewAccessToken = function(accessTokenData, scopes, callback) {
  var that = this;

  var formatAccessToken = {
    "access_token": accessTokenData.access_token,
    "type": accessTokenData.token_type,
    "user": accessTokenData.account_username,
    "scopes": accessTokenData.scope,
    "refresh_token": accessTokenData.refresh_token
  };

  callback(null, formatAccessToken);
};

Imgur.prototype.generateRandom = function() {
  var rb = require('crypto').randomBytes;
  var bytes = rb(16);

  return bytes.toString('hex');
};

module.exports = Imgur;

/**
 * Imgur Configuration
 * @typedef {Object} Imgur~Configuration
 * @property {string} name
 * @property {string} app_id
 * @property {string} app_secret
 * @property {string} access_token
 * @property {string} callback_uri
 * @property {string} scopes
 */
/**
 * Request callback
 * @callback Imgur~requestCallback
 * @param {Error|string|null} error - Error
 * @param {*} data
 */
