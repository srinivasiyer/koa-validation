var request = require('supertest')
  , app = require('./app/app');

describe('Koa request body validation', function(){
    it('Should throw the required rule errors when conditions dont match', function(done){
        request(app.listen()).put('/')
        .send({ bar: 'barbaz' })
        .send({ baz: 'foobar' })
        .send({ barbaz: 'foobar' })
        .send({ bazbaz: 'barbaz' })
        .send({ age: 25})
        .end(function(err, res){
            res.statusCode.should.equal(422);
            res.body.should.be.an.Array;
            errorFields = {};
            res.body.forEach(function(objs){
                for(var o in objs){
                    errorFields[o] = objs[o].rule;
                }
            });

            errorFields.should.have.properties({
                foo: 'requiredWith',
                girlfiend: 'requiredIf',
                wife: 'requiredNotIf',
                foobar: 'requiredWithAll',
                gandalf: 'requiredWithout',
                name: 'required',
                tyrion: 'requiredWithoutAll'
            });

            done();
        });
    })

    it('Should throw errors on all fields', function(done){
        request(app.listen()).put('/')
        .send({ bar: 'barbaz' })
        .send({ baz: 'foobar' })
        .send({ teenage: 20 })
        .send({ age: 'twenty' })
        .send({ bazbaz: 'barbaz' })
        .send({ date: '2015-14-23' })
        .send({ past: '2015-11-01' })
        .send({ future: '2015-01-01' })
        .send({ birthdate: 'barbaz' })
        .send({ gender: 'other' })
        .send({ genres: 'Pop' })
        .send({ grade: 'no' })
        .send({ nickname: 1234 })
        .send({ nospaces: '2345&^$' })
        .send({ email: 'lucky@name' })
        .send({ alphanum: '&*^%' })
        .send({ password: 'abnsd' })
        .send({ iaccept: 'yes' })
        .send({ partofit: 'become' })
        .send({ notpartofit: 'forward' })
        .send({ cpassword: 'word' })
        .send({ spousegender: 'other' })
        .send({ luckynum: 1234 })
        .send({ thesaurus: 'synonyms' })
        .send({ number: 'abdc' })
        .send({ ipaddress: '200.200.200' })
        .send({ object: 'notaJSON' })
        .send({ chocolates: 95 })
        .send({ watts: 20 })
        .send({ longword: 'jsdsakjdsad' })
        .send({ shortword: 'thisismorethan10chars' })
        .send({ tendigits: 123456789 })
        .send({ watch: 'asia' })
        .send({ website: 'world.' })
        .end(function(err, res){
            res.statusCode.should.equal(422);
            res.body.should.be.an.Array;
            errorFields = {};
            res.body.forEach(function(objs){
                for(var o in objs){
                    errorFields[o] = objs[o].rule;
                }
            });

            errorFields.should.have.properties({
                age: 'numeric',
                teenage: 'digitsBetween',
                date: 'dateFormat',
                birthdate: 'date',
                past: 'before',
                future: 'after',
                gender: 'in',
                genres: 'notIn',
                grade: 'accepted',
                nickname: 'alpha',
                nospaces: 'alphaDash',
                email: 'email',
                alphanum: 'alphaNumeric',
                password: 'between',
                iaccept: 'boolean',
                partofit: 'contains',
                notpartofit: 'notContains',
                cpassword: 'same',
                spousegender: 'different',
                luckynum: 'digits',
                ipaddress: 'ip',
                thesaurus: 'equals',
                number: 'integer',
                object: 'json',
                chocolates: 'max',
                watts: 'min',
                shortword: 'maxLength',
                longword: 'minLength',
                tendigits: 'regex',
                watch: 'timezone',
                website: 'url'
            });

            done();
        });
    })

    it('Should throw no errors when proper values are sent', function(done){
        request(app.listen()).put('/')
        .send({ name: 'Srinivas Iyer' })
        .send({ bar: 'barbaz' })
        .send({ baz: 'foobar' })
        .send({ foo: 'bar' })
        .send({ tyrion: 'lanister' })
        .send({ gandalf: 'grey' })
        .send({ teenage: 17 })
        .send({ age: 22 })
        .send({ bazbaz: 'barbaz' })
        .send({ date: '12232015' })
        .send({ past: '2015-06-01' })
        .send({ future: '2015-11-01' })
        .send({ birthdate: '2016-12-25' })
        .send({ gender: 'male' })
        .send({ genres: 'jazz' })
        .send({ grade: 'yes' })
        .send({ nickname: 'srini' })
        .send({ nospaces: 'this_is-what' })
        .send({ email: 'lucky@strike.com' })
        .send({ alphanum: 'abcd928921' })
        .send({ password: 'abcd1234' })
        .send({ iaccept: 1 })
        .send({ partofit: 'became' })
        .send({ notpartofit: 'forewarn' })
        .send({ cpassword: 'abcd1234' })
        .send({ spousegender: 'female' })
        .send({ luckynum: 8974 })
        .send({ thesaurus: 'dictionary' })
        .send({ number: 1234 })
        .send({ ipaddress: '192.168.0.1' })
        .send({ object: '{ "foo": "bar" }' })
        .send({ chocolates: 80 })
        .send({ watts: 30 })
        .send({ longword: 'This is a super long string which stretches beyond 25 charachters' })
        .send({ shortword: 'lessthan10' })
        .send({ tendigits: 1234567890 })
        .send({ watch: 'asia/kolkata' })
        .send({ website: 'srinivasiyer.com' })
        .end(function(err, res){
            res.statusCode.should.equal(200);
            res.body.should.be.an.Object;
            done();
        });
    });

    it('should return changed queries when before filters are applied', function(done){

        request(app.listen())
        .put('/filters/before')
        .send({name: 'LOWERCASE'})
        .send({nickname: 'uppercase'})
        .send({snum: '92349021'})
        .send({sword: '    trim     '})
        .send({lword: '     ltrim'})
        .send({rword: 'rtrim    '})
        .send({dnum: '1234.23'})
        .send({bword: 'false'})
        .send({obj: { 'foo': 'bar' }})
        .send({eword: '<html></html>'})
        .send({reword: 'become'})
        .send({shaword: 'password'})
        .send({mdword: 'password'})
        .send({hexword: 'password'})
        .end(function(err, res){
            res.body.should.be.an.object;
            res.statusCode.should.equal(200);
            res.body.should.have.properties({
                name: 'lowercase',
                nickname: 'UPPERCASE',
                snum: 92349021,
                sword: 'trim',
                lword: 'ltrim',
                rword: 'rtrim',
                dnum: 1234.23,
                bword: false,
                obj: '{"foo":"bar"}',
                eword: '&lt;html&gt;&lt;&#x2F;html&gt;',
                reword: 'became',
                shaword: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8',
                mdword: '5f4dcc3b5aa765d61d8327deb882cf99',
                hexword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            });

            done();
        });
    });

    it('should return changed queries when filters are applied', function(done){
        request(app.listen())
        .put('/filters/before')
        .send({name: 'LOWERCASE'})
        .send({nickname: 'uppercase'})
        .send({snum: '92349021'})
        .send({sword: '    trim     '})
        .send({lword: '     ltrim'})
        .send({rword: 'rtrim    '})
        .send({dnum: '1234.23'})
        .send({bword: 'false'})
        .send({obj: { 'foo': 'bar' }})
        .send({eword: '<html></html>'})
        .send({reword: 'become'})
        .send({shaword: 'password'})
        .send({mdword: 'password'})
        .send({hexword: 'password'})
        .end(function(err, res){
            res.body.should.be.an.object;
            res.statusCode.should.equal(200);
            res.body.should.have.properties({
                name: 'lowercase',
                nickname: 'UPPERCASE',
                snum: 92349021,
                sword: 'trim',
                lword: 'ltrim',
                rword: 'rtrim',
                dnum: 1234.23,
                bword: false,
                obj: '{"foo":"bar"}',
                eword: '&lt;html&gt;&lt;&#x2F;html&gt;',
                reword: 'became',
                shaword: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8',
                mdword: '5f4dcc3b5aa765d61d8327deb882cf99',
                hexword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            });

            done();
        });
    })

});
