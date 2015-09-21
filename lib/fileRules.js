'use strict';

class FileRules {
    constructor(Validator){
        this.validator = Validator;
    }

    * size(field, file, deleteOnFail, args, message){
        
    }

    * extension(field, file, deleteOnFail, args, message){

    }

    * mime(field, file, deleteOnFail, args, message){

    }

    * image(field, file, deleteOnFail, message) {

    }

    * name(field, file, deleteOnFail, filename, message){

    }
}

module.exports = FileRules;
