'use strict';

var v = require('validator')
  , moment = require('moment-timezone');

const date_formats = [
    moment.ISO_8601,
    'DD-MM-YYYY',
    'DD.MM.YYYY',
    'DD/MM/YYYY',
    'D-M-YYYY',
    'D.M.YYYY',
    'D/M/YYYY',
    'YYYY-MM-DD HH:mm:Z',
    'YYYY-MM-DD HH:mm:ZZ',
    'YYYY-MM-DD HH:mm Z'
];

class Rules {
    constructor(Validator) {
        this.validator = Validator;
    }

    * accepted(field, value, message){
        if(value === true || value === 'yes' || value === 'on' || value === 1 || value === "1"){
            return true;
        }else{
            this.validator.addError(field, 'rule', '', message || 'The value of the field needs to be between 1, yes, or true');
            return false;
        }
    }

    * after(field, value, afterDate, message){
        let mAfterDate, mDate;
        if(typeof this.validate.fields[field].date_format !== 'undefined'){
            mAfterDate = moment(afterDate, date_formats.concat([this.validate.fields[field].date_format]));
            mDate = moment(value, this.validate.fields[field].date_format, true);
        }else{
            mAfterDate = moment(afterDate, date_formats);
            mDate = moment(value, date_formats);
        }

        if(!mAfterDate.isValid()){
            this.validator.addError(field, 'rule', '', message || 'The after date arguement is an invalid date');
            return false;
        }else if(!mDate.isValid()){
            this.validator.addError(field, 'rule', '', message || 'The value of the field is an invalid date');
            return false;
        }else if(mAfterDate.get('seconds') > mDate.get('seconds')){
            this.validator.addError(field, 'rule', '', message || 'The provided date does not fall after the date mentioned in the arguement');
            return false;
        }

        return true;
    }

    * alpha(field, value, message){
        if(!v.isAlpha(value)){
            this.validator.addError(field, 'rule', '', message || 'The value of the field needs to be alphabetical');
            return false;
        }

        return true;
    }

    * alphaDash(field, value, message){
        if(!('/^[A-Z_-]+$/i'.test(value))){
            this.validator.addError(field, 'rule', '', message || 'The field value can only contain aplhabets, _ and -');
            return false;
        }

        return true;
    }

    * alphaNumeric(field, value, message){
        if(!v.isAlphanumeric(value)){
            this.validator.addError(field, 'rule', '', message || 'The value of the field can only contain letters and numbers');
            return false;
        }

        return true;
    }

    * before(field, value, beforeDate, message){
        let mBeforeDate, mDate;
        if(typeof this.validate.fields[field].date_format !== 'undefined'){
            mBeforeDate = moment(beforeDate, date_formats.concat([this.validate.fields[field].date_format]));
            mDate = moment(value, this.validate.fields[field].date_format, true);
        }else{
            mBeforeDate = moment(beforeDate, date_formats);
            mDate = moment(value, date_formats);
        }

        if(!mBeforeDate.isValid()){
            this.validator.addError(field, 'rule', '', message || 'The before date arguement is an invalid date');
            return false;
        }else if(!mDate.isValid()){
            this.validator.addError(field, 'rule', '', message || 'The value of the field is an invalid date');
            return false;
        }else if(mBeforeDate.get('seconds') < mDate.get('seconds')){
            this.validator.addError(field, 'rule', '', message || 'The provided date does not come before the date mentioned in the arguement');
            return false;
        }

        return true;
    }

    //Length of charachters
    * between(field, value, args, message){
        if(!Array.isArray(args) && args.length !== 2){
            this.validator.addError(field, 'rule', '', message || 'The number of arguements in the field are invalid');
            return false;
        }else{
            if(!v.isInt(args[0]) || !v.isInt(args[1])){
                this.validator.addError(field, 'rule', '', 'The rule arguements for the field need to be integers');
                return false;
            }else if( args[0] >= args[1] ){
                this.validator.addError(field, 'rule', '', 'The rule arguement for the min value cannot be greater than or equal to the max value');
                return false;
            }else if(value.toString().length < args[0].toString().length || value.toString().length > args[1].toString().length){
                this.validator.addError(field, 'rule', '', 'The size of the field is not within the specified range');
                return false;
            }
        }

        return true;
    }

    * boolean(field, value, message){
        if(value === true || value === false || value === 0 || value === "0" ||value === 1 || value === "1"){
            return true;
        }else{
            this.validator.addError(field, 'rule', '', 'The value of the field needs to be between true, false, 0 and 1');
            return false;
        }
    }

    * contains(field, value, inString, message){
        if(typeof inString !== "string"){
            this.validator.addError(field, 'rule', '', message || 'The number of arguements provided is invalid. Please provide one single string');
            return false;
        }else{
            if(!v.isAlphanumeric(value, inString)){
                this.validator.addError(field, 'rule', '', message || 'The value of the field can only contain letters and numbers');
                return false;
            }
        }

        return true;
    }

    * date(field, value, message){
        if(!moment(value, date_formats).isValid()){
            this.validator.addError(field, 'rule', '', message || 'The value provided for the field is an invalid date');
            return false;
        }

        return true;
    }

    * dateFormat(field, value, format, message){
        if(!moment(value, format, true).isValid()){
            this.validator.addError(field, 'rule', '', message || 'The value provided for the field is either invalid or not in the format mentioned');
            return false;
        }

        return true;
    }

    * different(field, value, otherField, message){
        if(typeof otherField !== "string"){
            this.validator.addError(field, 'rule', '', message || 'The number of arguements provided is invalid. Please provide one single string');
            return false;
        }else{
            let otherField = otherField.split('.').filter(function(e){ return e !== ''; });
            let otherValue;

            otherField.map(function(item){
        		if(typeof otherValue === 'undefined'){
        			otherValue = this.validate.fields && this.validate.fields[item];
        		}else{
        			otherValue = otherValue[item];
        		}
        	});

            if(typeof otherValue === 'undefined'){
                this.validator.addError(field, 'rule', '', message || 'The field you are comparing the value against does not exist');
                return false;
            }else if(otherValue == value){
                this.validator.addError(field, 'rule', '', message || 'The field you are comparing the value against is the same');
                return false;
            }
        }

        return true;
    }

    * digits(field, value, dNumber, message){
        if(!v.isInt(dNumber)){
            this.validator.addError(field, 'rule', '', message || 'The arguement entered is an invalid. Please enter digits');
            return false;
        }else if(value != dNumber){
            this.validator.addError(field, 'rule', '', message || 'The value does not match with the mentioned number');
            return false;
        }

        return true;
    }

    * digitsBetween(field, value, args, message){
        if(!Array.isArray(args) && args.length !== 2){
            this.validator.addError(field, 'rule', '', message || 'The number of arguements in the field are invalid');
            return false;
        }else{
            if(!v.isInt(args[0]) || !v.isInt(args[1])){
                this.validator.addError(field, 'rule', '', message || 'The rule arguements for the field need to be integers');
                return false;
            }else if(parseInt(args[0]) >= parseInt(args[1])){
                this.validator.addError(field, 'rule', '', message || 'The rule arguement for the min value cannot be greater than or equal to the max value');
                return false;
            }else if(parseInt(value) < parseInt(args[0]) || parseInt(value) > parseInt(args[1])){
                this.validator.addError(field, 'rule', '', message || 'The digits are not within the specified range');
                return false;
            }
        }

        return true;
    }

    * email(field, value, message){
        if(!v.isEmail(value)){
            this.validator.addError(field, 'rule', '', message || 'The value entered is not a valid email');
            return false;
        }

        return true;
    }

    * in(field, value, args, message){
        if(!Array.isArray(args)) args = [args];

        let match = false;

        for(let i = 0; i < args.length; i++){
            if(value == args[i]){
                match = true;
            }
        }

        if(!match){
            this.validator.addError(field, 'rule', '', message || 'The value entered does not exist in the arguements supplied');
            return false;
        }

        return true;
    }

    * integer(field, value, message){
        if(!v.isInt(value)){
            this.validator.addError(field, 'rule', '', message || 'The value entered is not an integer');
            return false;
        }

        return true;
    }


    * ip(field, value, message){
        if(!v.isIP(value)){
            this.validator.addError(field, 'rule', '', message || 'The value entered is not an IP Address');
            return false;
        }

        return true;
    }

    * json(field, value, message){
        if(!v.isJSON(value)){
            this.validator.addError(field, 'rule', '', message || 'The value entered is not a JSON string');
            return false;
        }

        return true;
    }

    * max(field, value, maxNum, message){
        if(!v.isInt(maxNum)){
            this.validator.addError(field, 'rule', '', message || 'The rule arguements for max fields needs to be an integer');
            return false;
        }else if(value.toString().length > maxNum.toString().length){
            this.validator.addError(field, 'rule', '', message || 'The size of the field is greater than the max arguement');
            return false;
        }

        return true;
    }

    * min(field, value, minNum, message){
        if(!v.isInt(minNum)){
            this.validator.addError(field, 'rule', '', message || 'The rule arguements for min fields needs to be an integer');
            return false;
        }else if(value.toString().length < minNum.toString().length){
            this.validator.addError(field, 'rule', '', message || 'The size of the field is lesser than the min arguement');
            return false;
        }

        return true;
    }

    * notIn(field, value, args, message){
        if(!Array.isArray(args)) args = [args];

        let noMatch = true;

        for(let i = 0; i < args.length; i++){
            if(value == args[i]){
                noMatch = false;
            }
        }

        if(!noMatch){
            this.validator.addError(field, 'rule', '', message || 'The value entered exists in the arguements supplied');
            return false;
        }

        return true;
    }

    * numeric(field, value, message){
        if(v.isNumeric(value)){
            this.validator.addError(field, 'rule', '', message || 'The value entered is not numeric');
            return false;
        }

        return true;
    }

    * regex(field, value, regexp, message){
        if(!(regexp instanceof RegExp)){
            this.validator.addError(field, 'rule', '', message || 'The regex arguement is not a valid regular expression');
            return false;
        }else if(!regexp.text(value)){
            this.validator.addError(field, 'rule', '', message || 'The value provided did not match with the regex format');
            return false;
        }

        return true;
    }

    * same(field, value, args, message){
        if(typeof otherField !== "string"){
            this.validator.addError(field, 'rule', '', message || 'The number of arguements provided is invalid. Please provide one single string');
            return false;
        }else{
            let otherField = otherField.split('.').filter(function(e){ return e !== ''; });
            let otherValue;

            otherField.map(function(item){
        		if(typeof otherValue === 'undefined'){
        			otherValue = this.validate.fields && this.validate.fields[item];
        		}else{
        			otherValue = otherValue[item];
        		}
        	});

            if(typeof otherValue === 'undefined'){
                this.validator.addError(field, 'rule', '', message || 'The field you are comparing the value against does not exist');
                return false;
            }else if(otherValue != value){
                this.validator.addError(field, 'rule', '', message || 'The field you are comparing the value against are different');
                return false;
            }
        }

        return true;
    }

    * string(field, value, message){
        if(typeof value !== 'string'){
            this.validator.addError(field, 'rule', '', message || 'The value provided is not a string');
            return false;
        }

        return true;
    }

    * timezone(field, value, message){
        if(!moment.tz.zone(value)){
            this.validator.addError(field, 'rule', '', message || 'The value provided is not a valid timezone');
            return false;
        }

        return true;
    }

    * url(field, value, message){
        if(!v.isURL(value)){
            this.validator.addError(field, 'rule', '', message || 'The value provided is not a URL');
            return false;
        }

        return true;
    }
}

module.exports = Rules;
