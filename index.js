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
   res.redirect('/index')
})

app.get('/waitress', function (req, res) {
   res.redirect('/index')
})


app.post('/add', async function (req, res) {
   const username = req.body.userInput.charAt().toUpperCase() + req.body.userInput.slice(1).toLowerCase();;
   const code = uid();

   let result = await waitersFunction.findUser(username)
   if (Number(result.count) !== 0) {
      req.flash('error', `User ${username} already exists, go login to the navigation bar`)
      res.redirect('/')
   } else {
      await waitersFunction.setWaiterName(username, code)
      req.flash('successs', "Waiter registered! Use code " + code + " to login!")
      res.redirect('/')
   }
})

app.get('/login', async function (req, res) {

   //    let {code}= req.query;

   //    let user =await waitersFunction.getWaiterName(code) 

   //   res.redirect("/waiters/"+ user)

   //   // res.redirect('/waiters/:username')

   res.render("log")
})


app.post('/login', async function (req, res) {
   let { code } = req.body;
   let userEntered = await waitersFunction.findCode(code)
   // get username from db
   // let user =await waitersFunction.getWaiterName(code) 
   if (userEntered) {
      req.session.userEntered = userEntered
      res.redirect("/waiters/" + userEntered.username)
      // res.redirect('week')
      // return;
      // } else{
      // res.render('index')
   } else {
      req.flash("error", "Code was not found")
      res.redirect("/login")
   }

   // let user= req.params.userInput;


   // res.redirect('/waiters/:username')
})

app.get('/waiters/:username', async function (req, res) {
   let user = req.params.username.charAt().toUpperCase() + req.params.username.slice(1).toLowerCase();;
   let output = `Hi ${user} please proceed select up to 3 desired working days below!`
   res.render('week', {
      user,
      output
   });
      // user : req.session.user} )
})


app.post('/waiters/:name', async function (req, res) {
   let workday = req.body.day;
   let user = req.params.name;
   // console.log(user);
   console.log(user)

   await waitersFunction.setWeekday(workday, user);
   req.flash('success', "Booking submitted! feedback will be provided within the next 48 hours")
   // //    req.body.user
   res.redirect('back')
})

app.get('/delete', async function (req, res) {
   await waitersFunction.deleteAllUsers()
   req.flash('success', "You have now cleared all your expenses!")
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

   res.render('schedule', {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday
   })
})




const PORT = process.env.PORT || 3005
app.listen(PORT, function () {
   console.log('App started at port:', PORT)
})