# Koa Validation

Koa Validation is a validation middleware for Koa. Using Koa Validation, you can validate
url params, url queries, request bodies, headers as well as files. The module also allows for nested
queries and nested jsons to be validated. The plugin uses generators and hence syncronous database validations
can alse be made. The module can also be used to filter values sent as well as performing after actions on files uploaded.

The module can also be extended to add custom rules, filters and actions based on convenience.

Installation

```npm install koa-validation```

Example usage

```js

var app = require('koa')();
var router = (new require('koa-router'))();
var koaBody = require('koa-better-body');

require('koa-qs')(app, 'extended');

var validate = require('koa-validation');

app.use(koaBody({
    'multipart': true
}));

app.use(validate());

router.post('/', function *(){
    yield this.validateQueries(
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
            'preferences.travel': 'required',
            'preferences.reading': 'required',
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
    yield this.validateQueries({},{},{
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

    this.body = this.request.fields;
});

router.get('/filters/after', function *(){
    yield this.validateQueries({},{},{
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

    this.body = this.query;
});

app.use(router.routes()).use(router.allowedMethods());

```

More Documentation to follow soon!!

## License

[MIT](LICENSE)
