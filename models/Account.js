/**
 * Account Model
 * @class Account
 * @param {Account~Json} json json of the account
 * @constructor
 */
function Account(json) {
  this.account = json;
}

/**
 * @return {Account~Json|*}
 */
Account.prototype.getJson = function() {
  return this.account;
};

/**
 * @return {string}
 */
Account.prototype.getId = function() {
  return this.account.id;
};

/**
 * @return {string}
 */
Account.prototype.getUrl = function() {
  return this.account.url;
};

module.exports = Account;

/**
 * Account Json
 * @typedef {Object} Account~Json
 * @property {string} id
 * @property {string} urk
 */