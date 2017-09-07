var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3087);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

// Render Main Page
app.get('/',function(req,res,next){
  res.render('home');
});

// Get Rows for table
app.get('/getrows',function(req,res,next){
  var context = {};
  mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = JSON.stringify(rows);
    res.send(context);
  });
});

// Add new workout to DB and return added row to browser to update table
app.get('/insert',function(req,res,next){
  var context = {};
  mysql.pool.query("INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?,?,?,?,?)", [req.query.name, req.query.reps, req.query.weight, req.query.date, req.query.lbs], function(err, result){
    if(err){
      next(err);
      return;
    }
      
    mysql.pool.query('SELECT * FROM workouts WHERE id=(SELECT MAX(id) FROM workouts)', function(err, rows, fields){
        if(err){
          next(err);
          return;
        }
        context.results = JSON.stringify(rows);
        res.send(context);
    });

  });

});

// Delete row
app.get('/delete',function(req,res,next){
  var context = {};
  mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    res.render('home');
  });
});

// Update Row
app.get('/safe-update',function(req,res,next){
  var context = {};
  mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.query.id], function(err, result){
    if(err){
      console.log("error selecting all from workouts");
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      mysql.pool.query('UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?', 
        [req.query.name || curVals.name, req.query.reps || curVals.reps, req.query.weight || curVals.weight, req.query.date || curVals.date, req.query.lbs || curVals.lbs, req.query.id],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        res.render('home');
      });
    }
  });
});

// Select row and render update template with data
app.post('/getId', function(req,res){
  mysql.pool.query('SELECT * FROM workouts WHERE id=?',  [req.body.id], function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    var object = rows[0];
    var mySQLDate = new Date(object.date);
    mySQLDate = mySQLDate.toISOString();
    var newDateString = mySQLDate.substring(0,10);
    object.date = newDateString;
    res.render('update', object);
  });  
});
  
// Create Table
app.get('/reset-table',function(req,res,next){
  var context = {};
 mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ 
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      res.render('home');
    })
  });
});


app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

