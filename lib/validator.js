'use strict'

class Validator {
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
}

module.exports = Validator;
