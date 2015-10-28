module.exports = function(app, router){

    router.get('/headers', function *(){
        yield this.validateHeaders(
            {
                'content-type': 'required|equals:application/json',
                'x-authorization': 'required|between:20,30',
                'x-origin-ip': 'required|ip',
            },
            {},
            {
                before:{
                    'content-type': 'trim|lowercase'
                }
            }
        );

        if(this.validationErrors){
            this.status = 422;
            this.body = this.validationErrors;
        }else{
            this.status = 200;
            this.body = { success: true }
        }
    });

    app.use(router.routes()).use(router.allowedMethods());
}
