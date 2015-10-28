'use strict';

var fs = require('co-fs-extra')
  , mime = require('mime-types')
  , path = require('path');

class FileRules {
    constructor(Validator){
        this.validator = Validator;
    }

    fetchByteSize(size){
        size = size.toString().toLowerCase();
        if(size.includes('gb') || size.includes('g')){
            return parseInt(size.replace('gb','').replace('g','')) * 1024 * 1024 * 1024;
        }else if(size.includes('mb') || size.includes('m')){
            return parseInt(size.replace('mb','').replace('m','')) * 1024 * 1024;
        }else if(size.includes('kb') || size.includes('k')){
            return parseInt(size.replace('kb','').replace('k','')) * 1024;
        }else if(size.includes('b')){
            return parseInt(size.replace('b',''));
        }else{
            return parseInt(size) * 1024;
        }
    }

    * size(field, file, deleteOnFail, args, message){
        let success =  true;
        if(args && Array.isArray(args) && args.length >= 2 && args.length % 2 === 0){
            let max, min;
            for (var i = 0; i < args.length; ++i){
                if(args[i] === 'max'){
                    max = this.fetchByteSize(args[i + 1]);
                }else if(args[i] === 'min'){
                    min = this.fetchByteSize(args[i + 1]);
                }
            }

            if(!min && !max){
                this.validator.addError(field, 'rule', 'size', 'Max or Min properties have not been provided');
                success = false;
            }else{
                if(max && file.size >= max){
                    this.validator.addError(field, 'rule', 'size', message || 'The file size exceeds the max size provided');
                    success = false;
                }

                if(min && file.size <= min){
                    this.validator.addError(field, 'rule', 'size', message || 'The file size is lower than the min size stated');
                    success = false;
                }
            }
        }else{
            this.validator.addError(field, 'rule', 'size', 'Invalid Arguments provided for the size arguement')
            success = false;
        }

        if(!success){
            if(deleteOnFail){
                if(file.path && (yield fs.exists(file.path))){
                    yield fs.remove(file.path);
                }
            }

            return false;
        }else{
            return true;
        }
    }

    * extension(field, file, deleteOnFail, args, message){
        let success = true;

        if(Array.isArray(args)){
            for(var i = 0; i < args.length; ++i){
                if(path.extname(file.name).replace('.','').toLowerCase() !== args[i].toLowerCase()){
                    success = false;
                }else{
                    success = true;
                    break;
                }
            }
        }else{
            if( path.extname(file.name).replace('.','').toLowerCase() !== args.toLowerCase() ){
                success = false;
            }
        }

        if(!success){
            this.validator.addError(field, 'rule', 'extension', message || 'The extension mentioned did not match with the one of the file');

            if(deleteOnFail){
                if(file.path && (yield fs.exists(file.path))){
                    yield fs.remove(file.path);
                }
            }

            return false;
        }else{
            return true;
        }
    }

    * mime(field, file, deleteOnFail, args, message){
        let success = true;

        if(Array.isArray(args)){
            for(var i = 0; i < args.length; ++i){
                if(mime.lookup(args[i]) !== file.type){
                    success = false;
                }else{
                    success = true;
                    break;
                }
            }
        }else{
            if(mime.lookup(args) !== file.type){
                success = false;
            }
        }

        if(!success){
            this.validator.addError(field, 'rule', 'mime', message || 'The mime type mentioned does not match with the file type');
            if(deleteOnFail){
                if(file.path && (yield fs.exists(file.path))){
                    yield fs.remove(file.path);
                }
            }
            return false;
        }else{
            return true;
        }
    }

    * image(field, file, deleteOnFail, message) {
        let success = true;

        if( 0 !== file.type.indexOf('image/')){
            success = false;
        }

        if(!success){
            this.validator.addError(field, 'rule', 'image', message || 'The file type posted is not an image');

            if(deleteOnFail){
                if(file.path && (yield fs.exists(file.path))){
                    yield fs.remove(file.path);
                }
            }

            return false;
        }else{
            return true;
        }
    }

    * name(field, file, deleteOnFail, filename, message){
        let success = true;

        if(path.basename(file.name, path.extname(file.name)) !== filename && path.basename(file.name) !== filename){
            success = false
        }

        if(!success){
            this.validator.addError(field, 'rule', 'name', message || 'The filename did not match with the posted file');

            if(deleteOnFail){
                if(file.path && (yield fs.exists(file.path))){
                    yield fs.remove(file.path);
                }
            }

            return false;
        }else{
            return true;
        }
    }
}

module.exports = FileRules;
