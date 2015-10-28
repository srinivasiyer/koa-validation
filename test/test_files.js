var request = require('supertest')
  , app = require('./app/app')
  , fs = require('co-fs-extra')
  , co = require('co');

describe('Koa request file validation', function(){
    it('should throw the required rule errors when conditions don\'t match', function(done){
        request(app.listen()).post('/files')
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
                'jsFile': 'required',
                'imgFile': 'required'
            });

            done();
        });
    });

    it('should throw proper errors when the file validation condition fails', function(done){
        request(app.listen()).post('/files')
        .attach('jsFile', __dirname + '/../lib/validate.js')
        .attach('imgFile', __dirname + '/../lib/filters.js')
        .attach('imgFile1', __dirname + '/../lib/rules.js')
        .attach('imgFile2', __dirname + '/../lib/fileRules.js')
        .attach('pkgFile', __dirname + '/../README.md')
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
                imgFile1: 'mime',
                imgFile2: 'extension',
                pkgFile: 'name',
                jsFile: 'size',
                imgFile: 'image'
            });

            done();
        });
    })

    it('should pass when the validations return no errors', function(done){
        request(app.listen()).post('/files')
        .attach('jsFile', __dirname + '/../lib/rules.js')
        .attach('imgFile', __dirname + '/files/redpanda.jpg')
        .attach('imgFile1', __dirname + '/files/redpanda.jpg')
        .attach('imgFile2', __dirname + '/files/redpanda.jpg')
        .attach('pkgFile', __dirname + '/../package.json')
        .end(function(err, res){
            res.statusCode.should.equal(200);
            res.body.should.be.an.Object;
            done();
        });
    });

    it('should delete the temp uploaded file when the validation fails and deleteOnFail set to true', function(done){
        request(app.listen()).post('/deleteOnFail')
        .attach('imgFile', __dirname + '/../lib/rules.js')
        .attach('jsFile', __dirname + '/files/redpanda.jpg')
        .end(function (err, res){
            res.statusCode.should.equal(422);
            res.body.should.be.an.Array;
            (co.wrap(function *(){
                for(var i = 0; i < res.body.length; ++i){
                    (yield fs.exists(res.body[i])).should.equal(false);
                }
            })()).then(done, done);
        });
    });

    it('should apply the file action after the file has been validated', function(done){
        request(app.listen()).post('/fileActions')
        .attach('jsFile', __dirname + '/../lib/rules.js')
        .attach('imgFile', __dirname + '/files/redpanda.jpg')
        .end(function(err, res){
            //console.log(res.body);
            res.statusCode.should.equal(422);
            res.body.should.be.an.Object;
            res.body.should.have.property('tmpFiles');
            res.body.should.have.property('errors');
            res.body.tmpFiles.should.have.property('jsFile');
            res.body.tmpFiles.should.have.property('imgFile');

            (co.wrap(function *(){
                //console.log(yield fs.exists( __dirname + '/app/tmp/rules.js'));
                (yield fs.exists( __dirname + '/files/tmp/rules.js')).should.equal(true);
                (yield fs.exists(__dirname + '/files/tmp/panda.jpg')).should.equal(true);

                yield fs.remove(__dirname + '/app/tmp');
            })()).then(done, done)
        });
    });

    after(function() {
        (co.wrap(function *(){
            yield fs.remove(__dirname + '/files/tmp');
        })())
    });
});
