'use strict'

var fs = require('co-fs')

class fileActions {
    constructor(Validator){
        this.validator = Validator;
    }

    * move(field, file, deleteOnFail, destination, callback){


        if(callback){
            return yield callback(file, destination)
        }else{
            return fileMoved;
        }
    }

    * copy(field, file, deleteOnFail, destination, callback){

    }

    * delete(field, file, deleteOnFail, callback){

    }
}
