# Koa Validation

Koa Validation is a validation middleware for Koa. Using Koa Validation, you can validate
url params, url queries, request bodies, headers as well as files. The module also allows for nested
queries and nested jsons to be validated. The plugin uses generators and hence syncronous database validations
can alse be made. The module can also be used to filter values sent as well as performing after actions on files uploaded.

The module can also be extended to add custom rules, filters and actions based on convenience.

##Installation

```npm install koa-validation```

##Field Validations

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
            password: 'between:6,15'
        },
        {
            'name.required': 'The name field is a required one'
        },
        {
            before: {
                name: 'lowercase',
                nickname: 'uppercase',
                snum: 'integer',
                sword: 'trim',
                lword: 'ltrim',
                rword: 'rtrim',
                dnum: 'float',
                bword: 'boolean',
            },
            
            after: {
                obj: 'json',
                eword: 'escape',
                reword: 'replace:come,came',
                shaword: 'sha1',
                mdword: 'md5',
                hexword: 'hex:sha256'
            }
        }
    )

    if (this.validationErrors) {
        this.status = 422;
        this.body = this.validationErrors;
    } else {
        this.status = 200;
        this.body = { success: true }
    }
});

```

##File Validations

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

router.post('/files', function *(){
    yield this.validateFiles({
        'jsFile':'required|size:min,10kb,max,20kb',
        'imgFile': 'required|image',
        'imgFile1': 'mime:jpg',
        'imgFile2': 'extension:jpg',
        'pkgFile': 'name:package'
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

    if (this.validationErrors) {
        this.status = 422;
        this.body = this.validationErrors;
    } else {
        this.status = 200;
        this.body = { success: true }
    }
});

app.use(router.routes()).use(router.allowedMethods());

```

Check out Detailed Documentation at [koa-validation.readme.io](https://koa-validation.readme.io)

## License

[MIT](LICENSE)
