'use strict';

var v = require('validator');

class Filters{
    constructor(Validator){
        this.validator = Validator;
    }

    * integer(field, value){
        var eVal = v.toInt(value);
        if(!isNaN(eVal)){
            return eVal;
        }else{
            this.validator.addError(field, 'The value cannot be converted to an integer.');
            return
        }
    }

    * float(field, value){
        var eVal = v.toFloat(value);
        if(!isNaN(eVal)){
            return eVal;
        }else{
            this.validator.addError(field, 'The value cannot be converted to a Float.');
            return
        }
    }

    * lowercase(field, value){
        try {
            return value.toLowerCase();
        } catch(e) {
            this.validator.addError(field, 'The value cannot be converted to lowercase.');
            return
        }
    }

    * uppercase(field, value){
        try {
            return value.toUpperCase();
        } catch(e) {
            this.validator.addError(field, 'The value cannot be converted to uppercase.');
            return
        }
    }

    * boolean(field, value){
        return v.toBoolean(value);
    }

    * json(field, value){
        try {
            return JSON.stringify(value);
        } catch(e) {
            this.validator.addError(field, 'Invalid string cannot be converted to JSON');
            return
        }
    }

    * trim(field, value, separator){
        var eVal = (separator) ? v.trim(value, separator) : v.trim(value);
        if(typeof eVal !== 'string'){
            return eVal;
        }else{
            this.validator.addError(field, 'The value cannot be trimmed as the data type is invalid');
            return
        }
    }

    * ltrim(field, value, chars){
        var eVal = (separator) ? v.ltrim(value, separator) : v.ltrim(value);
        if(typeof eVal !== 'string'){
            return eVal;
        }else{
            this.validator.addError(field, 'The value cannot be escaped as the data type is invalid');
            return
        }
    }

    * rtrim(field, value, chars){
        var eVal = (separator) ? v.rtrim(value, separator) : v.rtrim(value);
        if(typeof eVal !== 'string'){
            return eVal;
        }else{
            this.validator.addError(field, 'The value cannot be trimmed as the data type is invalid');
            return
        }
    }

    * escape(field, value, chars){
        var eVal = v.escape(value);

        if(typeof eVal !== 'string'){
            return eVal;
        }else{
            this.validator.addError(field, 'The value cannot be trimmed as the data type is invalid');
            return
        }
    }

    * replace(field, value, original, replacement){
        if(!original || !replacement) {
            this.validator.addError(field, 'The arguements for relacing the provided string are missing');
            return
        }

        try {
            return value.replace(original, replacement)
        } catch(e) {
            this.validator.addError(field, 'The above value is not a valid string and hence cannot be replaced.');
            return
        }
    }
}

module.exports = Filters;
