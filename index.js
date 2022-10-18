const express = require('express');
const app = express();
const exphbs = require("express-handlebars")
const flash = require('express-flash')
const bodyParser = require('body-parser');
const session = require('express-session')
const ShortUniqueId = require('short-unique-id')
const uid = new ShortUniqueId({ length: 4 })
const pgp = require('pg-promise')({});
const WaitersAvailability = require('./waiters')
// const db = pgp(config);
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.urlencoded({ extended: false }))
app.use(express.json())


const DATABASE_URL = process.env.DATABASE_URL || "postgresql://kamvest:kv112@localhost:5432/waiters";
const config = {
   connectionString: DATABASE_URL
}
if(process.env.NODE_ENV === "production"){
   config.ssl = {
      rejectUnauthorized: false
   }
}

app.use(session({
   secret: 'this is my longest string that is used to test my waiters availability with routes app for browser',
   resave: false,
   saveUninitialized: true
}));

app.use(flash());

app.use(express.static('public'))

const db = pgp(config);
const waitersFunction = WaitersAvailability(db)

app.get('/', function (req, res) {
   res.render('index')
})

app.get('/admin', function (req, res) {

   res.render('requests')
})

app.post('/admin', function (req, res) {
   
   res.redirect('/days')
})

app.get('/waitress', function (req, res) {
   res.redirect('/index')
})


app.post('/add', async function (req, res) {
   const username = req.body.userInput.charAt().toUpperCase() + req.body.userInput.slice(1).toLowerCase();;
   const code = uid();

   let result = await waitersFunction.findUser(username)
   if (Number(result.count) !== 0) {
      req.flash('error', `User ${username} already exists`)
      res.redirect('/')
   } else {
      req.session.code = code
      await waitersFunction.setWaiterName(username, code)
      res.redirect('/login')
   }
})

app.get('/login', async function (req, res) {
   const codei = req.session.code;

   if(codei){
      req.flash('successs', "Use code " + codei + " to login!")
   }
   res.render("log")

})


app.post('/login', async function (req, res) {
   let { code } = req.body;
   let userEntered = await waitersFunction.findCode(code)

   if (userEntered) {
      delete req.session.code;
      req.session.userEntered = userEntered
      res.redirect("/waiters/" + userEntered.username)
      
    
   } else {
      req.flash("error", "Code was not found")
      res.redirect("/login")
   }
})

app.get('/waiters/:username', async function (req, res) {
   let user = req.params.username.charAt().toUpperCase() + req.params.username.slice(1).toLowerCase();;
   let output = `Hi ${user} please proceed select up to 3 desired working days below!`
   res.render('week', {
      user,
      output
   });
})


app.post('/waiters/:name', async function (req, res) {
   let workday = req.body.day;
   let user = req.params.name;
   

   await waitersFunction.setWeekday(workday, user);
   req.flash('success', "Booking submitted! feedback will be provided within the next 48 hours")
   res.redirect('back')
})

app.get('/delete', async function (req, res) {
   await waitersFunction.deleteAllUsers()
   req.flash('successs', "You have now cleared all your data!")
   res.redirect('/days')
})

app.get('/days', async function (req, res) {

   let monday = await waitersFunction.joinUsers('Monday')
   let tuesday = await waitersFunction.joinUsers('Tuesday')
   let wednesday = await waitersFunction.joinUsers('Wednesday')
   let thursday = await waitersFunction.joinUsers('Thursday')
   let friday = await waitersFunction.joinUsers('Friday')
   let saturday = await waitersFunction.joinUsers('Saturday')
   let sunday = await waitersFunction.joinUsers('Sunday')
   let colors= await waitersFunction.dayColor()

   res.render('schedule', {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      colors
   })
})


app.get('/logout', function (req, res) {
   delete req.session.user
   res.redirect('/')
})




const PORT = process.env.PORT || 3005
app.listen(PORT, function () {
   console.log('App started at port:', PORT)
})