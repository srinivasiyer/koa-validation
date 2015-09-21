'use strict';

var FieldValidator = require('./fieldValidator');
var FileValidator = require('./fileValidator');
var RequiredRules = require('./requiredRules');
var Rules = require('./rules');
var Filters = require('./filters');
var FileRules = require('./fileRules');
var FileActions = require('./fileActions');

module.exports = function() {
	return function * (next) {
        var v;
		this.validateBody = function *(rules, messages, filters){
            v = new FieldValidator(
				this,
				this.request.body.fields || this.request.body || {},
				rules,
				messages || {},
				filters || {}
			);

			return yield v.valid;

        }

        this.validateParams = function *(rules, messages, filters){
            v = new FieldValidator(
				this,
				this.request.params || {},
				rules,
				messages || {},
				filters || {}
			);

			return yield v.valid;
        }

        this.validateQueries = function *(rules, messages, filters){
            v = new FieldValidator(
				this,
				this.request.query || {},
				rules,
				messages || {},
				filters || {}
			);

			return yield v.valid;
        }

		this.ValidateFiles = function *(rules, deleteOnFail, messages, actions) {
			var files = (this.request.body && this.request.body.files) ? this.request.body.files : {};

			v = new FileValidator(
				this,
				files,
				rules,
				deleteOnFail || false,
				messages || {},
				actions || {}
			);

			return yield v.valid;
		}

		yield next;
	};
};

module.exports.RequiredRules = RequiredRules;
module.exports.Rules = Rules;
module.exports.FileRules = FileRules;
module.exports.Filters = Filters;
module.exports.FileActions = FileActions;
