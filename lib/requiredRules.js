'use strict';

class RequiredRules {
    constructor(Validator){
        this.validator = Validator;
    }

    * required(field, value, message){
        if(typeof value === 'undefined'){
            this.validator.addError(field, 'The '+ field +' is mandatory.' || message);
            return false;
        }

        return true;
    }

    * requiredIf(field, value, args, message){
        if(args.length >= 2){
            if(args.length % 2 === 0){
                var argGroup, start, required = false, sameField = false;
                for (var i = 0; i < args.length / 2; ++i){
                    if(!i) start = i
                    else start += 2;

                    argGroup = args.slice(start, start + 2);
                    if(argGroup[0] != field){
                        if(this.validator.fields[argGroup[0]] && this.validator.fields[argGroup[0]] == argGroup[1]){
                            required = true;
                        }else{
                            required = false;
                            break
                        }
                    }else{
                        sameField = true;
                        break
                    }
                }

                if(sameField) {
                    this.validator.addError(field, 'The '+ field +' needs to contain another field name in the args.' || message);
                    return false;
                }

                if(required && typeof value === 'undefined'){
                    this.validator.addError(field, 'The '+ field +' is mandatory.' || message);
                    return false;
                }

                return true;
            }else{
                this.validator.addError(
                    field,
                    'The '+ field +' has an incorrect number of arguements. The arguements length needs to be a multiple of 2' || message
                );
                return false;
            }
        }else{
            this.validator.addError(field, 'The '+ field +' required a minimum of two arguements' || message);
            return false;
        }
    }

    * requiredNotIf(field, value, args, message){
        if(args.length >= 2){
            if(args.length % 2 === 0){
                var argGroup, start, required = false, sameField = false;
                for (var i = 0; i < args.length / 2; ++i){
                    if(!i) start = i
                    else start += 2;

                    argGroup = args.slice(start, start + 2);

                    if(argGroup[0] != field){
                        if(this.validator.fields[argGroup[0]] && this.validator.fields[argGroup[0]] != argGroup[1]){
                            required = true;
                        }else{
                            required = false;
                            break
                        }
                    }else{
                        sameField = true;
                        break
                    }
                }

                if(sameField) {
                    this.validator.addError(field, 'The '+ field +' needs to contain another field name in the args.' || message);
                    return false;
                }

                if(required && typeof value === 'undefined'){
                    this.validator.addError(field, 'The '+ field +' is mandatory.' || message);
                    return false;
                }

                return true;
            }else{
                this.validator.addError(
                    field,
                    'The '+ field +' has an incorrect number of arguements. The arguements length needs to be a multiple of 2' || message
                );
                return false;
            }
        }else{
            this.validator.addError(field, 'The '+ field +' required a minimum of two arguements' || message);
            return false;
        }
    }

    * requiredWith(field, value, args, message){
        if(!Array.isArray(args)) args = [args];
        if(args.length){
            var required = false;
            for (var i = 0; i < args.length; ++i){
                if(args[i] != field){
                    if(this.validator.fields[args[i]] && typeof this.validator.fields[args[i]] !== 'undefined'){
                        required = true;
                        break;
                    }
                }
            }

            if(required && typeof value === 'undefined'){
                this.validator.addError(field, 'The '+ field +' is mandatory.' || message);
                return false;
            }

            return true;
        }else{
            this.validator.addError(field, 'The '+ field +' requires atleast one other field in the arguement' || message);
            return false;
        }
    }

    * requiredWithout(field, value, args, message){
        if(!Array.isArray(args)) args = [args];
        if(args.length){
            var required = false;
            for (var i = 0; i < args.length; ++i){
                if(args[i] != field){
                    if(!this.validator.fields[args[i]] || typeof this.validator.fields[args[i]] === 'undefined'){
                        required = true;
                        break;
                    }
                }
            }

            if(required && typeof value === 'undefined'){
                this.validator.addError(field, 'The '+ field +' is mandatory.' || message);
                return false;
            }

            return true;
        }else{
            this.validator.addError(field, 'The '+ field +' requires atleast one other field in the arguement' || message);
            return false;
        }
    }

    * requiredWithAll(field, value, args, message){
        if(!Array.isArray(args)) args = [args];
        if(args.length){
            var required = true;
            for (var i = 0; i < args.length; ++i){
                if(args[i] != field){
                    if(!this.validator.fields[args[i]] || typeof this.validator.fields[args[i]] === 'undefined'){
                        required = false;
                        break;
                    }
                }
            }

            if(required && typeof value === 'undefined'){
                this.validator.addError(field, 'The '+ field +' is mandatory.' || message);
                return false;
            }

            return true;
        }else{
            this.validator.addError(field, 'The '+ field +' requires atleast one other field in the arguement' || message);
            return false;
        }
    }

    * requiredWithoutAll(field, value, args, message){
        if(!Array.isArray(args)) args = [args];
        if(args.length){
            var required = true;
            for (var i = 0; i < args.length; ++i){
                if(args[i] != field){
                    if(this.validator.fields[args[i]] || typeof this.validator.fields[args[i]] !== 'undefined'){
                        required = false;
                        break;
                    }
                }
            }

            if(required && typeof value === 'undefined'){
                this.validator.addError(field, 'The '+ field +' is mandatory.' || message);
                return false;
            }

            return true;
        }else{
            this.validator.addError(field, 'The '+ field +' requires atleast one other field in the arguement' || message);
            return false;
        }
    }
}

module.exports = RequiredRules;
