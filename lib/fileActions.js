'use strict'

var fs = require('co-fs-extra')

class fileActions {
    constructor(Validator){
        this.validator = Validator;
    }

    * move(field, file, deleteOnFail, destination, callback){

        if(yield fs.move(file.path, destination)){
            if(callback){
                if(yield callback(this.validator, file, destination)){
                    return true;
                }else{
                    if(deleteOnFail){
                        if(file.path && yield fs.exists(file.path)){
                            yield fs.remove(file.path);
                        }
                    }
                    return false;
                }
            }else{
                return true;
            }
        }else{

            this.validator.addError(field, 'action', 'move', 'The file could not be moved to the destination provided');
            if(deleteOnFail){
                if(file.path && yield fs.exists(file.path)){
                    yield fs.remove(file.path);
                }
            }
            return false;
        }
    }

    * copy(field, file, deleteOnFail, destination, callback){

        if(yield fs.copy(file.path, destination)){
            if(callback){
                if(yield callback(this.validator, file, destination)){
                    return true;
                }else{
                    if(deleteOnFail){
                        if(file.path && yield fs.exists(file.path)){
                            yield fs.remove(file.path);
                        }
                    }
                    return false;
                }
            }else{
                return true;
            }
        }else{

            this.validator.addError(field, 'action', 'copy', 'The file could not be copied to the destination provided');
            if(deleteOnFail){
                if(file.path && yield fs.exists(file.path)){
                    yield fs.remove(file.path);
                }
            }
            return false;
        }
    }

    * delete(field, file, deleteOnFail, callback){
        if(yield fs.remove(file.path)){
            if(callback){
                if(yield callback(this.validator, file)){
                    return true;
                }else{
                    return false;
                }
            }else{
                return true;
            }
        }else{
            this.validator.addError(field, 'action', 'delete', 'The original uploaded file could not be deleted');
            return false;
        }
    }
}
