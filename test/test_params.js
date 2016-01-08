var request = require('supertest')
  , app = require('./app/app');

describe('Koa URL params validation', function(){
    it('should throw an error on all fields when values are incorrect', function(done){
        request(app.listen()).post('/params/dhsud823893ej**$8/post/ajdii')
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
                'username': 'alphaDash',
                'postId': 'numeric',
            });

            done();
        });
    });

    it('should throw no errors when all values are correct', function(done){
        request(app.listen()).post('/params/flash_is_here/post/88888')
        .end(function(err, res){
            res.statusCode.should.equal(200);
            res.body.should.be.an.Object;
            done();
        });
    });
});
