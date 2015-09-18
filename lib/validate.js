'use strict';

var RequiredRules = require('./requiredRules');
var Rules = require('./rules');
var Filters = require('./filters');

module.exports = function() {
	return function * (next) {
        var v;
		this.validateBody = function *(rules, messages, filters){
            v = new Validator(
				this,
				this.request.body.fields || this.request.body || {},
				rules, messages || {},
				filters || {}
			);

            return yield v.valid;
        }

        this.validateParams = function *(rules, messages, filters){
            v = new Validator(
				this,
				this.request.params || {},
				rules, messages || {},
				filters || {}
			);

        }

        this.validateQueries = function *(rules, messages, filters){
            v = new Validator(
				this,
				this.request.query || {},
				rules, messages || {},
				filters || {}
			);
        }

		this.ValidateFiles = function *(rules, messages) {
			var files = (this.request.body && this.request.body.files) ? this.request.body.files : {};

			return yield new FileValidator(this, files, rules, messages || {});
		}

		yield next;
	};
};

class Validator {
    constructor(context, fields, rules, messages, filters){
        this.ctx = context;
        this.fields = fields;

    	this.filters = new Filters(this);
    	this.rules = new Rules(this);
    	this.requiredRules = new RequiredRules(this);

        this.validations = this.rules;
    }

    parseKey(key, data){
        let value;
    	let key = key.split('.').filter(function(e){ return e !== ''; });
    	let self = this;

    	key.map(function(item){
    		if(typeof value === 'undefined'){
    			value = data && data[item];
    		}else{
    			value = value[item];
    		}
    	});

    	return value;
    }

    changeFieldValue(key, value){
        key = key.split('.')

    	if(typeof key[1] === 'undefined'){
    		if(typeof this.fields[key[0]] !== undefined) this.fields[key[0]] = value;
    	}else{
    		var lastField = this.fields;
    		for (var i = 0; i < key.length; ++i){
    			if(typeof lastField[key[i]] !== undefined){
    				if(i === key.length - 1){
    					lastField[key[i]] = value;
    				}else{
    					lastField = lastField[key[i]]
    				}
    			}else{
    				break;
    			}
    		}
    	}

    	return;
    }

    addError(key, type, rule, message){
        if (!this.ctx.validationErrors) {
    		this.ctx.validationErrors = [];
    	}

    	var e = {};
    	e[key] = {
            type: type,
            message: 'message'
        };

        if(type === 'filter') e[key].filter = rule;
        else e[key].rule = rule;

    	this.ctx.validationErrors.push(e);
    }

    parseRulesAndFilters(rules, messages, filters) {
        let validations = {}
    	  , rsplit
    	  , argsplit
    	  , args
    	  , eachRule
    	  , requiredArgs
    	  , fieldfilters
    	  , fieldValue
    	  , fbSplit
    	  , faSplit
    	  , fbargsSplit
    	  , faargsSplit;

    	if(typeof filters.before === 'undefined') { filters.before = {} };
    	if(typeof filters.after === 'undefined') { filters.after = {} };

    	if(filters.before && Object.keys(filters.before).length && filters.before['*']){
            let commonBeforeFilters = [];
    		fbSplit = filters.before['*'].split('|');
    		for (var fb = 0; fb < fbSplit.length; ++fb){
    			fbargsSplit = fbSplit[fb].split(':');
    			if(typeof fbargsSplit[1] !== "undefined"){
    				args = fbargsSplit[1].split(',');
    				commonBeforeFilters.push({ filter: fbargsSplit[0], args: (args.length > 1) ? args: args[0] });
    			}else{
    				commonBeforeFilters.push({ filter: fbargsSplit[0] });
    			}
    		}
    	}

    	if(filters.after && Object.keys(filters.after).length && filters.after['*']){
            let commonAfterFilters = [];
    		fasplit = filters.after['*'].split('|');
    		for (var fa = 0; fa < faSplit.length; ++fa){
    			faargsSplit = faSplit[fa].split(':');
    			if(typeof faargsSplit[1] !== "undefined"){
    				args = faargsSplit[1].split(',');
    				commonAfterFilters.push({ filter: faargsSplit[0], args: (args.length > 1) ? args: args[0] });
    			}else{
    				commonAfterFilters.push({ filter: faargsSplit[0] });
    			}
    		}
    	}

    	if(Object.keys(rules).length){
    		for (var r in rules){

    			if(!validations[r]){
    				validations[r] = {
    					field: r,
    					value: yield this.parseKey(r, this.fields),
    					required: false,
    					rules: [],
    					filters: {
    						before: (commonBeforeFilters.length)? commonBeforeFilters:[],
    						after: (commonAfterFilters.length)? commonAfterFilters: []
    					}
    				};
    			}

    	        rsplit = rules[r].split('|');

    	        for (var rs in rsplit){
    	            argsplit = rsplit[rs].split(':');
    	            if(typeof argsplit[1] !== "undefined"){
    					args = argsplit[1].split(',');
    	                eachRule = { rule: argsplit[0], args: (args.length > 1) ? args: args[0] };
    	            }else{
    	                eachRule = { rule: argsplit[0] };
    	            }

    	            if(typeof messages[r+'.'+argsplit[0]] !== 'undefined'){
    	                eachRule.message = messages[r+'.'+argsplit[0]].replace(':attribute', r);
    	            }else if(typeof messages[argsplit[0]] !== 'undefined'){
    	                eachRule.message = messages[argsplit[0]].replace(':attribute', r);
    	            }
    				if(typeof this.requiredRules[eachRule.rule] === 'function'){
    					validations[r].rules.unshift(eachRule);
    				}else{
    					validations[r].rules.push(eachRule);
    				}

    				eachRule = null;
    	        }
    	    }
    	}

    	if(Object.keys(filters.before).length){
    		for(var bf in filters.before){
    			if(bf !== '*'){
    				if(!validations[bf]){
    					validations[bf] = {
    						field: bf,
    						value: yield this.parseKey(bf, this.fields),
    						required: false,
    						rules: [],
    						filters: {
    							before: (commonBeforeFilters.length)? commonBeforeFilters:[],
    							after: (commonAfterFilters.length)? commonAfterFilters: []
    						}
    					};
    				}

    				fbSplit = filters.before[bf].split('|');
    				for (var fb = 0; fb < fbSplit.length; ++fb){
    					fbargsSplit = fbSplit[fb].split(':');
    					if(typeof fbargsSplit[1] !== "undefined"){
    						args = fbargsSplit[1].split(',');
    						validations[bf].filters.before.push({ filter: fbargsSplit[0], args: (args.length > 1) ? args: args[0] });
    					}else{
    						validations[bf].filters.before.push({ filter: fbargsSplit[0] });
    					}
    				}
    			}
    		}
    	}

    	if(Object.keys(filters.after).length){
    		for(var ba in filters.after){
    			if(ba !== '*'){
    				if(!validations[ba]){
    					validations[ba] = {
    						field: ba,
    						value: yield this.parseKey(ba, this.fields),
    						required: false,
    						rules: [],
    						filters: {
    							before: (commonBeforeFilters.length)? commonBeforeFilters:[],
    							after: (commonAfterFilters.length)? commonAfterFilters: []
    						}
    					};
    				}

    				faSplit = filters.after[ba].split('|');
    				for (var fa = 0; fa < faSplit.length; ++fa){
    					faargsSplit = faSplit[fa].split(':');
    					if(typeof faargsSplit[1] !== "undefined"){
    						args = faargsSplit[1].split(',');
    						validations[ba].filters.after.push({ filter: faargsSplit[0], args: (args.length > 1) ? args: args[0] });
    					}else{
    						validations[ba].filters.after.push({ filter: faargsSplit[0] });
    					}
    				}
    			}
    		}
    	}

    return validations;
    }

    get valid(){
        return this.applyRulesAndFilters();
    }

    * applyRulesAndFilters(){
        let fieldValidations = [];

        for(var i in this.validations){
    		fieldValidations.push(this.evaluateField(this.validations[i]));
        }

    	if (fieldValidations.length)
    		yield fieldValidations;

    	return (this.ctx.validationErrors && this.ctx.validationErrors.length) ? false : true;
    }

    * evaluateField(field){
        var proceed = true;

    	if(field.filters.before.length){
    		for (var fb = 0; fb < field.filters.before.length; ++fb){
    			if(typeof this.filters[field.filters.before[fb].filter] !== 'undefined'){
    				if(typeof field.value !== 'undefined'){
    					field.value = yield this.filters[field.filters.before[fb].filter].apply(this.filters, [field.field, field.value, field.filters.before[fb].filter.args || [] ]);

    					if(!field.value){
    						proceed = false;
    						break;
    					}else{
    						yield this.changeFieldValue(field.field, field.value);
    					}
    				}
    			}else{
    				this.addError(field.field, 'Invalid filter: '+ field.filters.before[fb].filter +' does not exist');
    				proceed = false;
    				break;
    			}
    		}
    	}

    	if(!proceed) {
    		return;
    	}

    	if(field.rules.length){
    		for(var r = 0; r < field.rules.length; ++r){
    			if(typeof this.requiredRules[field.rules[r].rule] === 'function'){
    				var ruleArgs = [field.field, field.value];

    				if(field.rules[r].args && field.rules[r].args.length)
    					ruleArgs.push(field.rules[r].args);

    				if(field.rules[r].message)
    					ruleArgs.push(field.rules[r].message);

    				if(yield this.requiredRules[field.rules[r].rule].apply(this.requiredRules, ruleArgs)){
    					field.required = true;
    				}else{
    					proceed = false;
    					break;
    				}
    			}else if(typeof this.rules[field.rules[r].rule] === 'function'){
    				if((!field.required && typeof field.value !== 'undefined') || field.required){
    					var ruleArgs = [field.field, field.value];

    					if(field.rules[r].args && field.rules[r].args.length)
    						ruleArgs.push(field.rules[r].args);

    					if(field.rules[r].message)
    						ruleArgs.push(field.rules[r].message);

    					if(!(yield this.rules[field.rules[r].rule].apply(this.rules, ruleArgs))){
    						proceed = false;
    						break;
    					}
    				}else{
    					proceed = false;
    					break;
    				}
    			}else{
    				this.addError(field.field, 'Invalid Validation Rule: '+ field.rules[r].rule +' does not exist');
    				proceed = false;
    				break;
    			}
    		}
    	}

    	if(!proceed) {
    		return;
    	}

    	if(field.filters.after.length){
    		for (var fa = 0; fa < field.filters.after.length; ++fa){
    			if(typeof this.filters[field.filters.after[fa].filter] !== 'undefined'){
    				if(typeof field.value !== 'undefined'){
    					field.value = yield this.filters[field.filters.after[fa].filter].apply(this.filters, [field.field, field.value, field.filters.after[fa].filter.args || [] ]);

    					if(!field.value){
    						proceed = false;
    						break;
    					}else{
    						yield this.changeFieldValue(field.field, field.value);
    					}
    				}
    			}else{
    				this.addError(field.field, 'Invalid filter: '+ field.filters.after[fa].filter +' does not exist');
    				proceed = false;
    				break;
    			}
    		}
    	}

    	return;
    }
}

var RequiredRules = require('./requiredRules');
var Rules = require('./rules');
var Filters = require('./filters');

module.exports.Validator = Validator;
module.exports.RequiredRules = RequiredRules;
module.exports.Rules = Rules;
module.exports.Filters = Filters;



function* FileValidator(context, fields, rules, messages){
	this.ctx = context;
    this.fields = fields;

	this.rules = new FileRules(this);
	this.requiredRules = new RequiredRules(this);

    this.validations = yield this.parseFileRules(rules, messages, {});

	return yield this.applyFileRules();
}
