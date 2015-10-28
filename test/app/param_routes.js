module.exports = function(app, router){

    router.post('/params/:username/post/:postId', function *(){
        yield this.validateParams({
            'username': 'alphaDash|between:6,15',
            'postId': 'numeric|digitsBetween:10000,99999'
        });

        if(this.validationErrors){
            this.status = 422;
            this.body = this.validationErrors;
        }else{
            this.status = 200;
            this.body = { success: true };
        }
    });

    app.use(router.routes()).use(router.allowedMethods());
}
