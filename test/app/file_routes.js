module.exports = function(app, router){

    router.post('/files', function *(){
        yield this.validateFiles({
            'jsFile':'required|size:min,10kb,max,20kb',
            'imgFile': 'required|image',
            'imgFile1': 'mime:jpg',
            'imgFile2': 'extension:jpg',
            'pkgFile': 'name:package'
        });

        if(this.validationErrors){
            this.status = 422;
            this.body = this.validationErrors;
        }else{
            this.status = 200;
            this.body = { success: true }
        }
    });

    router.post('/deleteOnFail', function *(){
        yield this.validateFiles({
            'jsFile':'required|size:min,10kb,max,20kb',
            'imgFile': 'required|image'
        }, true);

        if(this.validationErrors){
            this.status = 422;
            var tmpfiles = []
            for (var f in this.request.body.files){
                tmpfiles.push(this.request.body.files[f].path);
            }

            this.body = tmpfiles;
        }else{
            this.status = 200;
            this.body = { success: true }
        }
    });

    router.post('/fileActions', function *(){
        yield this.validateFiles({
            'jsFile':'required|size:min,10kb,max,20kb',
            'imgFile': 'required|image',
        },true, {}, {
            jsFile: {
                action: 'move',
                args: __dirname + '/../files/tmp/rules.js',
                callback: function *(validator, file, destination){
                    validator.addError(jsFile, 'action', 'move', 'Just checking if the callback action works!!')
                }
            },
            imgFile: [
                {
                    action: 'copy',
                    args: __dirname + '/../files/tmp/panda.jpg'
                },
                {
                    action: 'delete'
                }
            ]
        });

        if(this.validationErrors){
            this.status = 422;
            var tmpfiles = {}
            for (var f in this.request.body.files){
                tmpfiles[f] = this.request.body.files[f].path;
            }
            this.body = {
                tmpFiles: tmpfiles,
                errors: this.validationErrors
            };
        }else{
            this.status = 200;
            this.body = { success: true }
        }
    });

    app.use(router.routes()).use(router.allowedMethods());
}
