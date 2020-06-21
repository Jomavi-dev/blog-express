exports.Article = require('./article');
exports.User = require('./user');

exports.index = function(req, res, next){
  // req.models.Article.find({published: true}, null, {sort: {_id:-1}}, function(error, articles){
  //   if (error) return next(error);
  //   res.render('index', { articles: articles});
  // })
  res.render('test');
};