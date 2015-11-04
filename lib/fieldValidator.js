'use strict';

var RequiredRules = require('./requiredRules');
var Rules = require('./rules');
var Filters = require('./filters');

class FieldValidator{
    constructor(context, fields, rules, messages, filters){
        this.ctx = context;
        this.fields = fields;

    	this.filters = new Filters(this);
    	this.rules = new Rules(this);
    	this.requiredRules = new RequiredRules(this);

        this.rule = {};
        this.validations = {};
        this.parseRulesAndFilters(rules, messages, filters);
    }

    parseKey(key, data){
        var value;
    	var self = this;

		let keySplit = key.split('.').filter(function(e){ return e !== ''; });

    	keySplit.map(function(item){
    		if(typeof value === 'undefined'){
    			value = data && data[item];
    		}else{
    			value = value[item];
    		}
    	});

    	return value;
    }

    addError(key, type, rule, message){
        if (!this.ctx.validationErrors) {
    		this.ctx.validationErrors = [];
    	}

    	var e = {};
    	e[key] = {
            type: type,
            message: message
        };

        if(type === 'filter') e[key].filter = rule;
        else e[key].rule = rule;

    	this.ctx.validationErrors.push(e);
    }

    changeFieldValue(key, value){
        key = key.split('.')

    	if(typeof key[1] === 'undefined'){
    		if(typeof this.fields[key[0]] !== 'undefined') this.fields[key[0]] = value;
    	}else{
    		var lastField = this.fields;
    		for (var i = 0; i < key.length; ++i){
    			if(typeof lastField[key[i]] !== 'undefined'){
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

    parseRulesAndFilters(rules, messages, filters) {

    	let rsplit
    	  , argsplit
    	  , args
    	  , fieldfilters
    	  , fieldValue
    	  , fbSplit
    	  , faSplit
    	  , fbargsSplit
    	  , faargsSplit;

    	if(typeof filters.before === 'undefined') { filters.before = {} };
    	if(typeof filters.after === 'undefined') { filters.after = {} };

    	if(Object.keys(rules).length){
    		for (var r in rules){
    			if(!this.validations[r]){
    				this.validations[r] = {
    					field: r,
    					value: this.parseKey(r, this.fields),
    					required: false,
    					rules: [],
    					filters: {
    						before: [],
    						after: []
    					}
    				};
    			}

                if(typeof rules[r] === 'object'){
                    for(var er in rules[r]){
                        this.rule = { rule: er };

                        if(Array.isArray(rules[r][er]) && rules[r][er].length){
                            this.rule.args = (rules[r][er].length > 1) ? rules[r][er]: rules[r][er][0];
                        }

                        this.populateRule(r, rules[r], messages);
                    }
                }else{
                    rsplit = rules[r].split('|');

        	        for (var rs in rsplit){
        	            argsplit = rsplit[rs].split(':');
        	            if(typeof argsplit[1] !== 'undefined'){
        					args = argsplit[1].split(',');
        	                this.rule = { rule: argsplit[0], args: (args.length > 1) ? args: args[0] };
        	            }else{
        	                this.rule = { rule: argsplit[0] };
        	            }

                        this.populateRule(r, argsplit[0], messages);
        	        }
                }
    	    }
    	}

    	if(Object.keys(filters.before).length){
    		for(var bf in filters.before){
                this.populateFilters('before', bf, filters.before[bf]);
    		}
    	}

    	if(Object.keys(filters.after).length){
    		for(var ba in filters.after){
    			this.populateFilters('after', ba, filters.after[ba]);
    		}
    	}
    }

    populateRule(field, rule, messages){
        if(typeof messages[field+'.'+rule] !== 'undefined'){
            this.rule.message = messages[field+'.'+rule];
        }else if(typeof messages[rule] !== 'undefined'){
            this.rule.message = messages[rule];
        }

        if(this.rule.message){
            if(this.rule.message.indexOf(':attribute') !== -1){
                this.rule.message = eachRule.message.replace(':attribute', r);
            }

            if(this.rule.message.indexOf(':value') !== -1){
                if(typeof this.validations[field].value === 'object'){
                    this.rule.message = eachRule.message.replace(':value', JSON.stringify(this.validations[field].value));
                }else if(typeof this.validations[field].value === 'undefined'){
                    this.rule.message = eachRule.message.replace(':value', 'undefined');
                }else{
                    this.rule.message = eachRule.message.replace(':value', this.validations[field].value.toString());
                }
            }
        }

        if(typeof this.requiredRules[this.rule.rule] === 'function'){
            this.validations[field].rules.unshift(this.rule);
        }else{
            this.validations[field].rules.push(this.rule);
        }

        this.rule = {};
    }

    populateFilters(type, field, filters){

        let fSplit, fargsSplit, typeFilters, args;

        if(!this.validations[field]){
            this.validations[field] = {
                field: field,
                value: this.parseKey(field, this.fields),
                required: false,
                rules: [],
                filters: {
                    before: [],
                    after: []
                }
            };
        }

        if(type === 'before'){
            typeFilters = this.validations[field].filters.before;
        }else if(type === 'after'){
            typeFilters = this.validations[field].filters.after;
        }

        if(typeof filters === 'object'){
            for(var ef in filters){
                if(Array.isArray(filters[ef]) && filters[ef].length){
                    typeFilters.push({ filter: ef, args: filters[ef] });
                }
            }
        }else{
            fSplit = filters.split('|');
            for (var f = 0; f < fSplit.length; ++f){
                fargsSplit = fSplit[f].split(':');
                if(typeof fargsSplit[1] !== 'undefined'){
                    args = fargsSplit[1].split(',');
                    typeFilters.push({ filter: fargsSplit[0], args: args });
                }else{
                    typeFilters.push({ filter: fargsSplit[0] });
                }
            }
        }
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
        let proceed = true;

    	if(field.filters.before.length){
    		for (var fb = 0; fb < field.filters.before.length; ++fb){
    			if(typeof this.filters[field.filters.before[fb].filter] !== 'undefined'){
    				if(typeof field.value !== 'undefined' && field.value.toString().trim()){
						field.value = yield this.filters[field.filters.before[fb].filter].apply(this.filters, [field.field, field.value].concat( field.filters.before[fb].args || [] ));
                        if(typeof field.value === 'undefined'){
    						break;
    					}else{
    						this.changeFieldValue(field.field, field.value);
    					}
    				}
    			}else{
    				this.addError(field.field, 'filter', field.rules[r].rule,'Invalid filter: '+ field.filters.before[fb].filter +' does not exist');
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

    				if(field.rules[r].args)
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

    					if(field.rules[r].args)
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
    				this.addError(field.field, 'rule', field.rules[r].rule, 'Invalid Validation Rule: '+ field.rules[r].rule +' does not exist');
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
    				if(typeof field.value !== 'undefined' && field.value.toString().trim()){
    					field.value = yield this.filters[field.filters.after[fa].filter].apply(this.filters, [field.field, field.value].concat( field.filters.after[fa].args || [] ));
    					if(typeof field.value !== 'undefined'){
    						proceed = false;
    						break;
    					}else{
    						this.changeFieldValue(field.field, field.value);
    					}
    				}
    			}else{
    				this.addError(field.field, 'filter', field.filters.after[fa].filter, 'Invalid filter: '+ field.filters.after[fa].filter +' does not exist');
    				proceed = false;
    				break;
    			}
    		}
    	}

    	return;
    }
}

module.exports = FieldValidator;
