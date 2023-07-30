"use strict";
var VERSION = "1.8.0",
	querystring = require("querystring"),
	oauth = require("oauth");

var baseUrl = "https://api.twitter.com/1.1/";
var uploadBaseUrl = "https://upload.twitter.com/1.1/";
var authUrl = "https://twitter.com/oauth/authenticate?oauth_token=";

class Twitter {
    static VERSION = VERSION;

    constructor(options) {
        this.consumerKey = options.consumerKey;
        this.consumerSecret = options.consumerSecret;
        this.callback = options.callback;
        this.x_auth_access_type = options.x_auth_access_type;
        this.oa = new oauth.OAuth("https://twitter.com/oauth/request_token", 
                                  "https://twitter.com/oauth/access_token",
                                  this.consumerKey, this.consumerSecret, 
                                  "1.0A", this.callback, "HMAC-SHA1");
    }

    getRequestToken(callback) {
        this.oa.getOAuthRequestToken({x_auth_access_type: this.x_auth_access_type}, 
            (error, oauthToken, oauthTokenSecret, results) => {
                if (error) {
                    callback(error);
                } else {
                    callback(null, oauthToken, oauthTokenSecret, results);
                }
            });
    }

    getAuthUrl(requestToken, options) {
        let extraArgs = "";
        if (options && options.force_login) {
            extraArgs += "&force_login=1";
        }
        if (options && options.screen_name) {
            extraArgs += "&screen_name=" + options.screen_name;
        }
        return authUrl + requestToken + extraArgs;
    }

    getAccessToken(requestToken, requestTokenSecret, oauth_verifier, callback) {
        this.oa.getOAuthAccessToken(requestToken, requestTokenSecret, oauth_verifier, 
            (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
                if (error) {
                    callback(error);
                } else {
                    callback(null, oauthAccessToken, oauthAccessTokenSecret, results);
                }
            });
    }

    verifyCredentials(accessToken, accessTokenSecret, params, callback) {
        let url = baseUrl + "account/verify_credentials.json";
        if (typeof params == "function") {
            callback = params;
        } else {
            url += '?' + querystring.stringify(params);
        }
        this.oa.get(url, accessToken, accessTokenSecret, 
            (error, data, response) => {
                if (error) {
                    callback(error);
                } else {
                    try {
                        let parsedData = JSON.parse(data);
                        callback(null, parsedData, response);
                    } catch (e) {
                        callback(e, data, response);
                    }
                }
            });
    }
}


module.exports = Twitter;
