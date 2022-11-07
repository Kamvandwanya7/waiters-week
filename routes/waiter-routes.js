const ShortUniqueId = require('short-unique-id')
const uid = new ShortUniqueId({ length: 4 })

module.exports = function WaiterRoutes(waitersFunction) {

    function index(req, res) {
        res.render('index')
    }
    function request(req, res) {
        res.render('requests')
    }
    async function admin(req, res) {
        res.redirect('/days')
    }

    async function waitres(req, res) {
        res.redirect('/index')

    }


    async function addName(req, res) {
        const username = req.body.userInput.charAt().toUpperCase() + req.body.userInput.slice(1).toLowerCase();;
        const code = uid();


        let result = await waitersFunction.findUser(username)
        if (Number(result.count) !== 0) {
            res.redirect('/waiters/' + username)
        } else {
            req.session.code = code
            await waitersFunction.setWaiterName(username, code)
            res.redirect('/login')
        }
    }


    async function logIn(req, res) {

        const codei = req.session.code;

        if (codei) {
            req.flash('successs', "Use code " + codei + " to login!")
        }
        res.render("log")


    }

    async function logUser(req, res) {
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

    }

    async function chooseDay(req, res) {
        let user = req.params.username.charAt().toUpperCase() + req.params.username.slice(1).toLowerCase();;
        let output = `Hi ${user} please proceed select up to 3 desired working days below!`;
        let userId = await waitersFunction.userId(req.params.username)
        let result = await waitersFunction.getDays(userId)
        let week = await waitersFunction.weekdays()
        week = week.map(day => {

            const checked = result.filter(item => item.workday == day.workday)

            return {
                ...day,
                status: checked.length > 0 ? 'checked' : ''
            }
        })

        // if(day<3){
        //     req.flash('error', `${user}! Please choose at least 3 days`)
        // } else{

        // }

        res.render('week', {
            user,
            output,
            week
        });
    }
    async function submitDay(req, res) {
        let workday = req.body.day;
        // console.log(workday.length === 3)
        let user = req.params.name;

        if (workday.length >= 3) {
            await waitersFunction.setWeekday(workday, user);
            req.flash('success', `Thank you ${user}! Booking submitted successfully`)
            res.redirect('back')
        } else {
            req.flash('error', `${user}! Please choose at least 3 days`)
            res.redirect('back')

        }
    }

    async function deleteAll(req, res) {
        await waitersFunction.deleteAllUsers()
        req.flash('successs', "You have now cleared all your data!")
        res.redirect('/days')
    }

    async function dayColours(req, res) {
        let monday = await waitersFunction.joinUsers('Monday')
        let tuesday = await waitersFunction.joinUsers('Tuesday')
        let wednesday = await waitersFunction.joinUsers('Wednesday')
        let thursday = await waitersFunction.joinUsers('Thursday')
        let friday = await waitersFunction.joinUsers('Friday')
        let saturday = await waitersFunction.joinUsers('Saturday')
        let sunday = await waitersFunction.joinUsers('Sunday')
        let colors = await waitersFunction.dayColor()
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

    }

    async function logOut(req, res) {
        delete req.session.user
        res.redirect('/')

    }
    return {
        index,
        request,
        admin,
        waitres,
        addName,
        logIn,
        logUser,
        chooseDay,
        submitDay,
        deleteAll,
        dayColours,
        logOut

    }
}