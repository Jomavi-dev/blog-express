const express = require('express'),
      routes = require('./routes'),
      user = require('./routes/user'),
      article = require('./routes/article'),
      http = require('http'),
      path = require('path'),
      mongoskin = require('mongoskin'),
      dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/blog',
      db = mongoskin.db(dbUrl, {safe: true}),
      collections = {
        articles: db.collection('articles'),
        users: db.collection('users')
      };
const session = require('express-session')
const logger = require('morgan')
const errorHandler = require('errorhandler')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const app = express();
app.locals.appTitle = 'blog-express';
// app.set('appName','blog-express');

app.use(function(req, res, next) {
  if (!collections.articles || ! collections.users) return next(new Error('No collections.'))
  req.collections = collections;
  return next();
});

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

if ( app.get('env') == 'development' ) {
  app.use(errorHandler());
}

//PAGES&ROUTES
app.get('/', routes.index, function(req, res) {});
app.get('/login', user.login, function(req,res){});
app.post('/login', user.authenticate, function(req, res) {});
app.get('/logout', user.logout, function(req, res) {});
app.get('/admin', article.admin, function(req, res) {});
app.get('/post', article.post, function(req, res) {});
app.post('/post', article.postArticle, function(req, res) {});
app.get('/articles/:slug', article.show, function(req, res) {});

// REST API ROUTES
app.get('/api/articles', list, function(req, res) {})
app.post('/api/articles', add, function(req, res) {});
app.put('/api/articles/:id', article.edit, function(req, res) {});
app.delete('/api/articles/:id', article.del, function(req, res) {});
app.all('*', function(req, res) {
  res.sendStatus(404);
})

const server = http.createServer(app);
const boot = function () {
  server.listen(app.get('port'), function(){
    console.info('Express server listening on port ' + app.get('port'));
  });
}
const shutdown = function() {
  server.close();
}
if (require.main === module) {
  boot();
}
else {
  console.info('Running app as a module')
  exports.boot = boot;
  exports.shutdown = shutdown;
  exports.port = app.get('port');
}
