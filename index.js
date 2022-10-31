const express = require('express');
const app = express();
const exphbs = require("express-handlebars")
const flash = require('express-flash')
const bodyParser = require('body-parser');
const session = require('express-session')
const ShortUniqueId = require('short-unique-id')
const uid = new ShortUniqueId({ length: 4 })
const pgp = require('pg-promise')({});

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

const WaitersAvailability = require('./waiters')
const waitersFunction = WaitersAvailability(db)

const WaiterRoutes= require('./routes/waiter-routes')
const waiterRoutes= WaiterRoutes(waitersFunction)

app.get('/', waiterRoutes.index)

app.get('/admin', waiterRoutes.request)

app.post('/admin', waiterRoutes.admin)

app.get('/waitress', waiterRoutes.waitres)


app.post('/add', waiterRoutes.addName)

app.get('/login', waiterRoutes.logIn)


app.post('/login', waiterRoutes.logUser)

app.get('/waiters/:username', waiterRoutes.chooseDay)


app.post('/waiters/:name', waiterRoutes.submitDay)

app.get('/delete', waiterRoutes.deleteAll)

app.get('/days', waiterRoutes.dayColours)


app.get('/logout', waiterRoutes.logOut)



const PORT = process.env.PORT || 3005
app.listen(PORT, function () {
   console.log('App started at port:', PORT)
})