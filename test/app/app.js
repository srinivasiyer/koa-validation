var app = require('koa')();
var router = (new require('koa-router'))();
var koaBody = require('koa-better-body');

require('koa-qs')(app, 'extended');

var validate = require('../../lib/validate');

app.use(koaBody({
    'multipart': true
}));
app.use(validate());

require('./query_routes')(app, router);
require('./header_routes')(app, router);
require('./param_routes')(app, router);
require('./post_routes')(app, router);
require('./file_routes')(app, router);

module.exports = app;
