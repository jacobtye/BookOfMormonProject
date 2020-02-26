var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const router = express.Router();
const bodyParser = require('body-parser');
mongoose.connect('mongodb://localhost:27017/documents', {
  useNewUrlParser: true
});
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
mongoose.set('useFindAndModify', false);
var app = express();
const docSchema = new mongoose.Schema({
  userName: String,
  fileName: String,
  contents: String,
});
const Document = mongoose.model('Document', docSchema);
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
const README = new Document({
  userName: "all",
  fileName: "README.txt",
  contents:"This is a Simple document editor that saves text to a mongoose"+
            "database attached to a specific user. Authentication is done via"+
            "firebase authentication.\n"+
            "To use, simply type in the textbox and use the buttons above as you"+
            "would in wordPad. Save overwirtes the current file, Save As saves to"+
            "a new name, load opens a file, delete will remove a file from the"+
            "database and new file clears everything."
})
app.post('/saveDocument', async (req, res) => {
    console.log("in post");
    console.log(req.body);
  console.log(req.body.fileName);
  Document.findOneAndUpdate({userName: req.params.id, fileName: req.body.fileName},{ "$set":
  {contents: req.body.contents, fileName: req.body.fileName, userName: req.body.userName} }, {upsert: true}, 
  function(err,doc){
        if (err) {
          return res.send(500, {error: err});
          
        };
    console.log(doc);
    return res.send('Succesfully saved.');
  });
});

app.post('/saveTemp/:id', (req, res) => {
    console.log("in post");
  Document.findOneAndUpdate({userName: req.params.id, fileName: "recovery"},{contents: req.body.contents}, {upsert: true}, 
  function(err,doc){
        if (err) {
          return res.send(500, {error: err});
          
        };
    console.log(doc);
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
    let temp = await Document.find({userName: req.params.id, fileName: "recovery"});
    console.log("TEMP"+ temp);
    return res.send(temp);
  }catch (error) {
    return res.sendStatus(500);
  }
});
app.get('/getDocuments/:id', async (req, res) => {
  try {
    console.log("GETTING DOCUMENTS" + req.params.id);
    let documents = await Document.find({userName: req.params.id});
    return res.send(documents);
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
app.delete('/deleteFile/:id', async (req,res) => {
  console.log("IN DELETE");
  console.log(req.params.id);
  try{
    await Document.deleteOne({
      _id: req.params.id
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
