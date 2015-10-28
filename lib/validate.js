'use strict';

let FieldValidator = require('./fieldValidator');
let FileValidator = require('./fileValidator');
let RequiredRules = require('./requiredRules');
let Rules = require('./rules');
let Filters = require('./filters');
let FileRules = require('./fileRules');
let FileActions = require('./fileActions');

module.exports = function() {
	return function * (next) {
        let v;
		this.validateBody = function *(rules, messages, filters){
			let fields;

			if(this.request.body && this.request.body.fields) fields = this.request.body.fields;
			else if (this.request.body) fields = this.request.body;
			else fields = {};

			v = new FieldValidator(
				this,
				fields,
				rules,
				messages || {},
				filters || {}
			);

			yield v.valid;
        };

        this.validateParams = function *(rules, messages, filters){
            v = new FieldValidator(
				this,
				this.params || {},
				rules,
				messages || {},
				filters || {}
			);

			yield v.valid;
        };

        this.validateQueries = function *(rules, messages, filters){
            v = new FieldValidator(
				this,
				this.request.query || {},
				rules,
				messages || {},
				filters || {}
			);

			yield v.valid;
        };

		this.validateHeaders = function *(rules, messages, filters){
			v = new FieldValidator(
				this,
				this.headers || {},
				rules,
				messages || {},
				filters || {}
			);

			yield v.valid;
		};

		this.validateFiles = function *(rules, deleteOnFail, messages, actions) {
			var files = (this.request.body && this.request.body.files) ? this.request.body.files : {};

			v = new FileValidator(
				this,
				files,
				rules,
				deleteOnFail || false,
				messages || {},
				actions || {}
			);

			yield v.valid;
		};

		yield next;
	};
};

module.exports.RequiredRules = RequiredRules;
module.exports.Rules = Rules;
module.exports.FileRules = FileRules;
module.exports.Filters = Filters;
module.exports.FileActions = FileActions;
