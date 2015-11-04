'use strict';

var RequiredRules = require('./requiredRules');
var FileRules = require('./fileRules');
var FileActions = require('./fileActions');

class FileValidator{
	constructor(context, fields, rules, deleteOnFail, messages, actions) {
		this.ctx = context;
	    this.fields = fields;

		this.requiredRules = new RequiredRules(this);
		this.rules = new FileRules(this);
		this.actions = new FileActions(this);

		this.rule = {};
        this.validations = {};
		this.parseRulesAndActions(rules, deleteOnFail, messages, actions);
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
    	let rsplit
    	  , argsplit
    	  , args;

        if(Object.keys(rules).length){
    		for (var r in rules){

    			if(!this.validations[r]){
    				this.validations[r] = {
    					field: r,
    					value: this.parseKey(r, this.fields),
    					required: false,
    					rules: [],
    					actions: [],
						deleteOnFail: deleteOnFail
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

        if(Object.keys(actions).length){
            for (var a in actions){
                if(!this.validations[a]){
    				this.validations[a] = {
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
							this.populateAction(a, actions[a][i]);
						}
					}else{
						this.populateAction(a, actions[a]);
					}
				}
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

	populateAction(field, action){
		let eachAction, args;
		if(typeof action !== 'undefined'){
			if(typeof action === 'object'){
				if(Array.isArray(action)){
					for(var i = 0; i < action.length; ++i){
						eachAction = { action: action[i].action };
						eachAction.args = action.args[i];

						if(action.callback
							&& typeof action.callback === 'function'
							&& action.callback.constructor
							&& 'GeneratorFunction' === action.callback.constructor.name){

							eachAction.callback = action.callback;
						}

						this.validations[field].actions.push(eachAction);
					}
				}else{
					eachAction = { action: action.action };
					eachAction.args = action.args;

					if(action.callback
						&& typeof action.callback === 'function'
						&& action.callback.constructor
						&& 'GeneratorFunction' === action.callback.constructor.name){

						eachAction.callback = action.callback;
					}

					this.validations[field].actions.push(eachAction);
				}
			}

			eachAction = null;
		}
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
		let proceed = true;

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
    					var ruleArgs = [field.field, field.value, field.deleteOnFail];

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
			for (var a = 0; a < field.actions.length; ++a){
    			if(typeof this.actions[field.actions[a].action] !== 'undefined'){
    				if(typeof field.value !== 'undefined'){
						let args = [field.field, field.value, field.deleteOnFail, field.actions[a].args || [] ];
						if(field.actions[a].callback) args.push(field.actions[a].callback);
    					fieldAction = yield this.actions[field.actions[a].action].apply( this.actions, args );

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
