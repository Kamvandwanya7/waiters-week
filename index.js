const express = require('express');
const app = express();
const exphbs = require("express-handlebars")
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static('public'))

app.get('/', function (req, res) {
   res.render('index')
})

app.post('/add', function (req, res) {
   //    req.body.user
   res.render('week')
})

app.get('/weeks', function (req, res) {
   res.render('week')
})

app.post('/weeks', function (req, res) {
   //    req.body.user
   res.redirect('weeks')
})




const PORT = process.env.PORT || 3005
app.listen(PORT, function () {
   console.log('App started at port:', PORT)
})