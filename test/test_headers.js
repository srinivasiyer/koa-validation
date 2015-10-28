var request = require('supertest')
  , app = require('./app/app');

describe('Koa header fields Validation', function(){
    it('Should throw the required rule errors when conditions dont match', function(done){
        request(app.listen()).get('/headers').end(function(err, res){
            res.statusCode.should.equal(422);
            res.body.should.be.an.Array;
            errorFields = {};
            res.body.forEach(function(objs){
                for(var o in objs){
                    errorFields[o] = objs[o].rule;
                }
            });

            errorFields.should.have.properties({
                'content-type': 'required',
                'x-authorization': 'required',
                'x-origin-ip': 'required',
            });

            done();
        });
    });

    it('should throw an error on all fields when values are incorrect', function(done){
        request(app.listen()).get('/headers')
        .set('content-type', 'application/flash')
        .set('x-authorization', 'woodoo')
        .set('x-origin-ip', '2000.123.234.234')
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
                'content-type': 'equals',
                'x-authorization': 'between',
                'x-origin-ip': 'ip',
            });

            done();
        });
    });

    it('should throw no errors when all values are correct', function(done){
        request(app.listen()).get('/headers')
        .set('content-type', '   application/JSON   ')
        .set('x-authorization', 'thisismorethantwentychars')
        .set('x-origin-ip', '200.123.234.234')
        .end(function(err, res){
            res.statusCode.should.equal(200);
            res.body.should.be.an.Object;
            done();
        });
    });
});
