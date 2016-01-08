var request = require('supertest')
  , app = require('./app/app');

describe('Koa URL Query Validation', function(){
    it('Should throw the required rule errors when conditions dont match', function(done){
        request(app.listen()).get('/')
        .query({ bar: 'barbaz' })
        .query({ baz: 'foobar' })
        .query({ barbaz: 'foobar' })
        .query({ bazbaz: 'barbaz' })
        .query({ age: 25})
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
        request(app.listen()).get('/')
        .query({ bar: 'barbaz' })
        .query({ baz: 'foobar' })
        .query({ teenage: 20 })
        .query({ age: 'twenty' })
        .query({ bazbaz: 'barbaz' })
        .query({ date: '2015-14-23' })
        .query({ past: '2015-11-01' })
        .query({ future: '2015-01-01' })
        .query({ birthdate: 'barbaz' })
        .query({ gender: 'other' })
        .query({ genres: 'Pop' })
        .query({ grade: 'no' })
        .query({ nickname: 1234 })
        .query({ nospaces: '124%6$' })
        .query({ email: 'lucky@name' })
        .query({ alphanum: '&*^%' })
        .query({ password: 'abnsd' })
        .query({ iaccept: 'yes' })
        .query({ partofit: 'become' })
        .query({ notpartofit: 'forward' })
        .query({ cpassword: 'word' })
        .query({ spousegender: 'other' })
        .query({ luckynum: 1234 })
        .query({ thesaurus: 'synonyms' })
        .query({ number: 'abdc' })
        .query({ ipaddress: '200.200.200' })
        .query({ object: 'notaJSON' })
        .query({ chocolates: 95 })
        .query({ watts: 20 })
        .query({ longword: 'jsdsakjdsad' })
        .query({ shortword: 'thisismorethan10chars' })
        .query({ tendigits: 123456789 })
        .query({ watch: 'asia' })
        .query({ website: 'world.' })
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
        request(app.listen()).get('/')
        .query({ name: 'Srinivas Iyer' })
        .query({ bar: 'barbaz' })
        .query({ baz: 'foobar' })
        .query({ foo: 'bar' })
        .query({ tyrion: 'lanister' })
        .query({ gandalf: 'grey' })
        .query({ teenage: 17 })
        .query({ age: 22 })
        .query({ bazbaz: 'barbaz' })
        .query({ date: '12232015' })
        .query({ past: '2015-06-01' })
        .query({ future: '2015-11-01' })
        .query({ birthdate: '2016-12-25' })
        .query({ gender: 'male' })
        .query({ genres: 'jazz' })
        .query({ grade: 'yes' })
        .query({ nickname: 'srini' })
        .query({ nospaces: 'this_is-what' })
        .query({ email: 'lucky@strike.com' })
        .query({ alphanum: 'abcd928921' })
        .query({ password: 'abcd1234' })
        .query({ iaccept: 1 })
        .query({ partofit: 'became' })
        .query({ notpartofit: 'forewarn' })
        .query({ cpassword: 'abcd1234' })
        .query({ spousegender: 'female' })
        .query({ luckynum: 8974 })
        .query({ thesaurus: 'dictionary' })
        .query({ number: 1234 })
        .query({ ipaddress: '192.168.0.1' })
        .query({ object: '{ "foo": "bar" }' })
        .query({ chocolates: 80 })
        .query({ watts: 30 })
        .query({ longword: 'This is a super long string which stretches beyond 25 charachters' })
        .query({ shortword: 'lessthan10' })
        .query({ tendigits: 1234567890 })
        .query({ watch: 'asia/kolkata' })
        .query({ website: 'srinivasiyer.com' })
        .end(function(err, res){
            res.statusCode.should.equal(200);
            res.body.should.be.an.Object;
            done();
        });
    });

    it('should return changed queries when before filters are applied', function(done){

        request(app.listen())
        .get('/filters/before')
        .query({name: 'LOWERCASE'})
        .query({nickname: 'uppercase'})
        .query({snum: '92349021'})
        .query({sword: '    trim     '})
        .query({lword: '     ltrim'})
        .query({rword: 'rtrim    '})
        .query({dnum: '1234.23'})
        .query({bword: 'false'})
        .query({obj: { 'foo': 'bar' }})
        .query({eword: '<html></html>'})
        .query({reword: 'become'})
        .query({shaword: 'password'})
        .query({mdword: 'password'})
        .query({hexword: 'password'})
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
        .get('/filters/before')
        .query({name: 'LOWERCASE'})
        .query({nickname: 'uppercase'})
        .query({snum: '92349021'})
        .query({sword: '    trim     '})
        .query({lword: '     ltrim'})
        .query({rword: 'rtrim    '})
        .query({dnum: '1234.23'})
        .query({bword: 'false'})
        .query({obj: { 'foo': 'bar' }})
        .query({eword: '<html></html>'})
        .query({reword: 'become'})
        .query({shaword: 'password'})
        .query({mdword: 'password'})
        .query({hexword: 'password'})
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
