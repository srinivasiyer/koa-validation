'use strict'

var fs = require('co-fs-extra')

class FileActions {
    constructor(Validator){
        this.validator = Validator;
    }

    * move(field, file, deleteOnFail, destination, callback){
        try{
            yield fs.move(file.path, destination, { clobber: true });
            if(callback){
                if(yield callback(this.validator, file, destination)){
                    return true;
                }else{
                    if(deleteOnFail){
                        if(file.path && (yield fs.exists(file.path))){
                            yield fs.remove(file.path);
                        }
                    }

                    return false;
                }
            }else{
                return true;
            }
        } catch (e){
            this.validator.addError(field, 'action', 'move', 'The file could not be moved to the destination provided');
            if(deleteOnFail){
                if(file.path && (yield fs.exists(file.path))){
                    yield fs.remove(file.path);
                }
            }

            return false;
        }
    }

    * copy(field, file, deleteOnFail, destination, callback){

        try {
            yield fs.copy(file.path, destination, { clobber: true });

            if(callback){
                if(yield callback(this.validator, file, destination)){
                    return true;
                }else{
                    if(deleteOnFail){
                        if(file.path && (yield fs.exists(file.path))){
                            yield fs.remove(file.path);
                        }
                    }
                    return false;
                }
            }else {
                return true;
            }
        } catch (e){
            this.validator.addError(field, 'action', 'copy', 'The file could not be copied to the destination provided');
            if(deleteOnFail){
                if(file.path && (yield fs.exists(file.path))){
                    yield fs.remove(file.path);
                }
            }
            return false;
        }
    }

    * remove(field, file, deleteOnFail, args, callback){
        try {
            yield fs.remove(file.path);

            if(callback) {
                return (yield callback(this.validator, file.path));
            }else{
                return true;
            }

        }catch(e){
            this.validator.addError(field, 'action', 'delete', 'The original uploaded file could not be deleted');
            return false;
        }
    }
}

module.exports = FileActions;
