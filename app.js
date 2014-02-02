;
/**
 * Module dependencies.
 */

var express = require('express')
  , partials = require('express-partials')
  , routes = require('./routes')
  , user = require('./routes/user')
  , admin = require('./routes/admin')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(partials());

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routing
var total = 0;
app.get('/', routes.index);
app.get('/admin', admin.index);
app.get('/users', user.list);
app.get('/total', function (req, res) {
  res.send(JSON.stringify(total));
});

// socket.io
http.globalAgent.maxSockets = 100;
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
var io = require('socket.io').listen(server);

// config for heroku
/*
io.configure(function () {
io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});
*/

// socket.io
io.sockets.on('connection', function (socket) {
  socket.volatile.emit('total', total);
  socket.on('hee', function (data) {
    total++;
    socket.broadcast.emit('total', total);
    socket.emit('total', total);
  });
  socket.on('reset', function (data) {
    total = 0;
    socket.volatile.broadcast.emit('reset', total);
    socket.volatile.emit('reset', total);
  });
});

app.get( "/crossdomain.xml", onCrossDomainHandler )
function onCrossDomainHandler( req, res ) {
  var xml = '<?xml version="1.0"?>\n<!DOCTYPE cross-domain-policy SYSTEM' + 
            ' "http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd">\n<cross-domain-policy>\n';
      xml += '<allow-access-from domain="*" to-ports="*"/>\n';
      xml += '</cross-domain-policy>\n';
  
  req.setEncoding('utf8');
  res.writeHead( 200, {'Content-Type': 'text/xml'} );
  res.end( xml );  
}
