const assert = require("assert");
const WaitersAvailability = require("../waiters")

const pgp = require("pg-promise")();

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://kamveri:kv199@localhost:5432/waiters_tests";

const config = {
    connectionString: DATABASE_URL
};

const db = pgp(config);


describe('My database tests', async function () {
    this.beforeEach(async function () {
        await db.none('DELETE FROM workers')
    });
    it('It should be able to return the name and code entered on database', async function () {
        let waiterOutput = WaitersAvailability(db);
        await waiterOutput.setWaiterName("Mihle", "pH8F");
        assert.deepEqual({ code: 'pH8F', username: 'Mihle' }, await waiterOutput.allWorkers());
    });

    it('It should be able submit monday as a working day and return names of people who requested to work on monday', async function () {
        let waiterOutput = WaitersAvailability(db);
        await waiterOutput.setWaiterName("Mihle", "pH8F");
        await waiterOutput.setWaiterName("Zompo", "yH8F");

        await waiterOutput.setWeekday(["Monday", 'Tuesday'], "Mihle");
        await waiterOutput.setWeekday(["Monday", 'Friday'], "Zompo");


        assert.deepEqual([
            {
                username: "Zompo",
                workday: 'Monday'
            },
            {
                username: 'Mihle',
                workday: "Monday"
            }

        ], await waiterOutput.joinUsers('Monday')
        );
    });
    // this.beforeEach(async function () {
    //         await db.none('DELETE FROM greetings')
    //     });



    it('It should be able submit tuesday as a working day and return names of people who requested to work on tuesday', async function () {
        let waiterOutput = WaitersAvailability(db);
        await waiterOutput.setWaiterName("Soyama", "3Xc2");

        await waiterOutput.setWeekday(["Monday", 'Tuesday'], "Soyama");



        assert.deepEqual([
            {
                username: 'Soyama',
                workday: 'Tuesday'
            },

        ], await waiterOutput.joinUsers('Tuesday'));
    });

    it('It should be able to clear waiter names', async function () {
        let waiterOutput = WaitersAvailability(db);
        await waiterOutput.setWaiterName("Sange")
        await waiterOutput.setWaiterName("Zona")
        await waiterOutput.setWaiterName("Sbahle")

        assert.equal(null, await waiterOutput.deleteAllUsers());
    });


    it('It should be able to change color of fully booked working days', async function () {
        let waiterOutput = WaitersAvailability(db);
        await waiterOutput.setWaiterName("Sange", "zXc2");
        await waiterOutput.setWaiterName("Zona", "4X0r");
        await waiterOutput.setWaiterName("Sbahle", "1X0c");
        await waiterOutput.setWaiterName("Senzo", "wQc1");
        await waiterOutput.setWaiterName("Qondile", "1lP1");




        await waiterOutput.setWeekday(["Monday", "Friday", "Sunday"], "Sange");
        await waiterOutput.setWeekday(["Monday", "Tuesday", "Friday"], "Zona");
        await waiterOutput.setWeekday(["Monday", "Tuesday", "Sunday"], "Sbahle");
        await waiterOutput.setWeekday(["Monday", "Sunday", "Wednesday"], "Senzo");
        await waiterOutput.setWeekday(["Friday", "Tuesday", "Wednesday"], "Qondile");




        assert.deepEqual(
            [{

                state: "overbooked",
                weekday: "Monday"
            },


            {
                state: "fully-booked",
                weekday: "Tuesday"
            },
            {
                state: "available",
                weekday: "Wednesday"
            },
            {
                state: "available",
                weekday: "Thursday"

            },
            {
                state: "fully-booked",
                "weekday": "Friday"
            },
            {
                state: "available",
                weekday: "Saturday"
            },
            {
                state: "fully-booked",
                weekday: "Sunday"
            }


            ], await waiterOutput.dayColor())
    });
});
