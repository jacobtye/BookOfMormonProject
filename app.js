var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const router = express.Router();``
const bodyParser = require('body-parser');
mongoose.connect('mongodb://localhost:27017/scriptures', {
  useNewUrlParser: true, useUnifiedTopology: true
});
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
mongoose.set('useFindAndModify', false);
var app = express();
const scriptureSchema = new mongoose.Schema({
  userName: String,
  displayName: String,
  reference: String,
  contents: String,
  publicAllowed: Boolean,
  verse: String,
});
const Flag = mongoose.model('Flag', scriptureSchema);
const Scripture = mongoose.model('Scripture', scriptureSchema);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
  extended: false
}));

// parse application/json
app.use(bodyParser.json());

app.use(express.static('public'));
const README = new Scripture({
  userName: "all",
  displayName: "all",
  reference: "README",
  contents:"This is a site I created where" +
            " people can write about their favorite scriptures in the " + 
            "Book of Mormon to share with others. Simply type in a reference, " +
            "type in your reasons why it is special, and choose your preferences and hit save." +
            " it will only be publically available if you give permission.",
  verse: "",
  publicAllowed: true,
});
app.post('/flag', async (req, res) => {
    console.log("in post");
    console.log(req.body);
  console.log(req.body.reference);
  Flag.findOneAndUpdate({userName: req.params.id, reference: req.body.reference},{ "$set":
  {contents: req.body.contents, displayName: req.body.displayName, reference: req.body.reference, userName: req.body.userName,
    publicAllowed: req.body.publicAllowed, verse: req.body.verse
  } }, {upsert: true}, 
  function(err,post){
        if (err) {
          return res.send(500, {error: err});
          
        };
    console.log(post);
    return res.send('Succesfully saved.');
  });
});
app.post('/saveScripture', async (req, res) => {
    console.log("in post");
    console.log(req.body);
  console.log(req.body.reference);
  Scripture.findOneAndUpdate({userName: req.params.id, reference: req.body.reference},{ "$set":
  {contents: req.body.contents, displayName: req.body.displayName, reference: req.body.reference, userName: req.body.userName,
    publicAllowed: req.body.publicAllowed, verse: req.body.verse
  } }, {upsert: true}, 
  function(err,post){
        if (err) {
          return res.send(500, {error: err});
          
        };
    console.log(post);
    return res.send('Succesfully saved.');
  });
});

app.get('/getREADME', (req, res) => {
    console.log("in post");
    console.log(req.body);
  console.log(README);
  res.send(README);
});
app.get('/getTemp/:id', async (req,res) =>{
  try {
    console.log("GETTING DOCUMENTS" + req.params.id);
    let temp = await Scripture.find({userName: req.params.id, reference: "recovery"});
    console.log("TEMP"+ temp);
    return res.send(temp);
  }catch (error) {
    return res.sendStatus(500);
  }
});
app.get('/getScriptures/:id', async (req, res) => {
  try {
    console.log("GETTING Scripture" + req.params.id);
    let scriptures = await Scripture.find({userName: req.params.id});
    return res.send(scriptures);
  }catch (error) {
    return res.sendStatus(500);
  }
});
app.get('/getAllFlags', async (req, res) => {
  try {
    console.log("GETTING flags" + req.params.id);
    let flags = await Flag.find();
    return res.send(flags);
  }catch (error) {
    return res.sendStatus(500);
  }
});
app.get('/getAllPublic', async (req, res) => {
  try {
    console.log("GETTING Scripture" + req.params.id);
    let scriptures = await Scripture.find({publicAllowed: true});
    return res.send(scriptures);
  }catch (error) {
    return res.sendStatus(500);
  }
});
app.get('/getChanged', (req, res) => {
    console.log("in get");
    console.log(req.body);
    console.log(this.changed);
  
  res.send(this.changed);
  if(this.changed){
    this.changed = false;
  }
});
app.delete('/deleteScripture/:id', async (req,res) => {
  console.log("IN DELETE");
  console.log(req.params.id);
  try{
    await Scripture.deleteOne({
      _id: req.params.id
    });
    return res.sendStatus(200);
  } catch (error){
    
  }
});
app.delete('/deleteFlag/:id', async (req,res) => {
  console.log("IN DELETE");
  console.log(req.params.id);
  try{
    await Flag.deleteOne({
      reference: req.params.id
    });
    return res.sendStatus(200);
  } catch (error){
    
  }
});
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
