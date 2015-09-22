'use strict';

var Validator = require('./Validator');
var RequiredRules = require('./RequiredRules');
var FileRules = require('./fileRules');
var FileActions = require('./fileActions');

class FileValidator{
	constructor(context, fields, rules, deleteOnFail, messages, actions) {
		this.ctx = context;
	    this.fields = fields;

		this.requiredRules = new RequiredRules(this);
		this.rules = new FileRules(this);
		this.actions = new FileActions(this);

		this.validations = this.parseRulesAndActions(rules, deleteOnFail, messages, actions);
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

        if(type === 'action') e[key].action = rule;
        else e[key].rule = rule;

    	this.ctx.validationErrors.push(e);
    }

	parseRulesAndActions(rules, deleteOnFail, messages, actions){
        let validations = {}
    	  , rsplit
    	  , argsplit
    	  , args
    	  , eachRule
    	  , requiredArgs
    	  , fieldValue
		  , aSplit
		  , eachAction;

        if(Object.keys(rules).length){
    		for (var r in rules){

    			if(!validations[r]){
    				validations[r] = {
    					field: r,
    					value: this.parseKey(r, this.fields),
    					required: false,
    					rules: [],
    					actions: []
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

        if(Object.keys(actions).length){
            for (var a in actions){
                if(!validations[a]){
    				validations[a] = {
    					field: a,
    					value: this.parseKey(a, this.fields),
    					required: false,
    					rules: [],
    					actions: []
    				};
    			}

				if(typeof actions[a] === 'object'){
					if(Array.isArray(actions[a])){
						for (var i = 0; i < actions[a].length; ++i){
							if(typeof actions[a][i].action !== undefined){
								aSplit = actions[a][i].action.split(':');

								if(typeof aSplit[1] !== "undefined"){
			    					args = aSplit[1].split(',');
			    	                eachAction = { action: aSplit[0], args: (args.length > 1) ? args: args[0] };
			    	            }else{
			    	                eachAction = { action: aSplit[0] };
			    	            }

								if(actions[a][i].callback
									&& typeof actions[a][i].callback === 'function'
									&& actions[a][i].callback.constructor
									&& 'GeneratorFunction' === actions[a].callback.constructor.name){

									eachAction.callback = actions[a][i].callback;
								}

								validations[a].actions.push(eachAction);
								eachAction = null;
							}
						}
					}else{
						if(typeof actions[a].action !== undefined){
							aSplit = actions[a].action.split(':');

							if(typeof aSplit[1] !== "undefined"){
		    					args = aSplit[1].split(',');
		    	                eachAction = { action: aSplit[0], args: (args.length > 1) ? args: args[0] };
		    	            }else{
		    	                eachAction = { action: aSplit[0] };
		    	            }

							if(actions[a].callback
								&& typeof actions[a].callback === 'function'
								&& actions[a].callback.constructor
								&& 'GeneratorFunction' === actions[a].callback.constructor.name){

								eachAction.callback = actions[a].callback;
							}

							validations[a].actions.push(eachAction);
							eachAction = null;
						}
					}
				}else if(typeof actions[a] === 'string'){
					aSplit = actions[a].split(':');

					if(typeof aSplit[1] !== "undefined"){
    					args = aSplit[1].split(',');
    	                eachAction = { action: aSplit[0], args: (args.length > 1) ? args: args[0] };
    	            }else{
    	                eachAction = { action: aSplit[0] };
    	            }

					validations[a].actions.push(eachAction);
					eachAction = null;
				}
            }
        }

		return validations;
	}

	get valid(){
        return this.applyRulesAndActions();
	}

	* applyRulesAndActions(){
        let fieldValidations = [];

        for(var i in this.validations){
    		fieldValidations.push(this.evaluateField(this.validations[i]));
        }

    	if (fieldValidations.length)
    		yield fieldValidations;

    	return (this.ctx.validationErrors && this.ctx.validationErrors.length) ? false : true;
	}

	* evaluateField(field){
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
    				this.addError(field.field, 'rule', field.rules[r].rule, 'Invalid Validation Rule: '+ field.rules[r].rule +' does not exist');
    				proceed = false;
    				break;
    			}
    		}
    	}

		if(!proceed){
			return;
		}

		let fieldAction;

		if (field.actions.length){
			for (var a = 0; a < field.actions.length; ++fa){
    			if(typeof this.actions[field.actions[a].action] !== 'undefined'){
    				if(typeof field.value !== 'undefined'){
    					fieldAction = yield this.actions[field.actions[a].action].apply(
							this.filters,
							[field.field, field.value, field.actions[a].action.args || [] ]
						);

						if(!fieldAction){
							break;
						}
    				}
    			}else{
    				this.addError(field.field, 'action', field.actions[a].action, 'Invalid action: '+ field.actions[a].action +' does not exist');
    				proceed = false;
    				break;
    			}
    		}
		}

		return;
	}
}

module.exports = FileValidator;
