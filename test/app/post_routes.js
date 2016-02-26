module.exports = function(app, router){

    router.put('/', function *(){
        yield this.validateBody(
            {
                name: 'required|minLength:4',
                girlfiend: 'requiredIf:age,25',
                wife: 'requiredNotIf:age,22',
                foo: 'requiredWith:bar,baz',
                foobar: 'requiredWithAll:barbaz,bazbaz',
                gandalf: 'requiredWithout:Saruman',
                tyrion: 'requiredWithoutAll:tywin,cercei',
                age: 'numeric',
                teenage: 'digitsBetween:13,19',
                date: 'dateFormat:MMDDYYYY',
                birthdate: 'date',
                past: 'before:2015-10-06',
                future: 'after:2015-10-07',
                gender: 'in:male, female',
                genres: 'notIn:Pop,Metal',
                grade: 'accepted',
                nickname: 'alpha',
                nospaces: 'alphaDash',
                email: 'email',
                alphanum: 'alphaNumeric',
                password: 'between:6,15',
                iaccept: 'boolean',
                partofit: 'contains:cam',
                notpartofit: 'notContains:ward',
                cpassword: 'same:password',
                spousegender: 'different:gender',
                luckynum: 'digits:8974',
                thesaurus: 'equals:dictionary',
                number: 'integer',
                ipaddress: 'ip',
                object: 'json',
                chocolates: 'max:90',
                watts: 'min:25',
                longword: 'minLength:25',
                shortword: 'maxLength:10',
                tendigits: { regex: [/^\d{10}$/g] },
                watch: 'timezone',
                website: 'url',
            },
            {
                'name.required': 'The name field is a required one'
            }
        )

        if(this.validationErrors){
            this.status = 422;
            this.body = this.validationErrors;
        }else{
            this.status = 200;
            this.body = { success: true }
        }
    });

    router.put('/filters/before', function *(){
        yield this.validateBody({},{},{
            before: {
                name: 'lowercase',
                nickname: 'uppercase',
                snum: 'integer',
                sword: 'trim',
                lword: 'ltrim',
                rword: 'rtrim',
                dnum: 'float',
                bword: 'boolean',
                obj: 'json',
                eword: 'escape',
                reword: 'replace:come,came',
                shaword: 'sha1',
                mdword: 'md5',
                hexword: 'hex:sha256'
            }
        })

        this.body = this.request.body.fields || this.request.body || {};
    });

    router.put('/filters/after', function *(){
        yield this.validateBody({},{},{
            after: {
                name: 'lowercase',
                nickname: 'uppercase',
                snum: 'integer',
                sword: 'trim',
                lword: 'ltrim',
                rword: 'rtrim',
                dnum: 'float',
                bword: 'boolean',
                obj: 'json',
                eword: 'escape',
                reword: 'replace:come,came',
                shaword: 'sha1',
                mdword: 'md5',
                hexword: 'hex:sha256'
            }
        });

        this.body = this.request.body.fields || this.request.body || {};
    });

    app.use(router.routes()).use(router.allowedMethods());
};
