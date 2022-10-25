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

        //     await waiterOutput.setWeekday("Lusizo","Monday");
        // await waiterOutput.setWeekday("Wednesday", "Mihle");
        // await waiterOutput.setWeekday("Mihle", "Sunday");
        // let x = await waiterOutput.joinUsers('Monday')

        assert.deepEqual([
            {
                username: 'Mihle',
                workday: 'Monday'
            },
            {
                username: "Zompo",
                workday: "Monday"
            }

        ], await waiterOutput.joinUsers('Monday')
        );
    });
    // this.beforeEach(async function () {
    //         await db.none('DELETE FROM greetings')
    //     });

    it('It should be able to clear waiter names', async function () {
        let waiterOutput = WaitersAvailability(db);
        await waiterOutput.setWaiterName("Sange")
        await waiterOutput.setWaiterName("Zona")
        await waiterOutput.setWaiterName("Sbahle")

        assert.equal(null, await waiterOutput.deleteAllUsers());
    });


    it('It should be able to return list of greeted names', async function () {
        let waiterOutput = WaitersAvailability(db);
        await waiterOutput.updateCount("Sange")
        await waiterOutput.updateCount("Zona")
        await waiterOutput.updateCount("Sbahle")

        assert.deepEqual([{ "username": "Sange" }, { "username": "Zona" }, { "username": "Sbahle" }], await waiterOutput.namesList([{ "names": "Thango" }, { "names": "Sbahle" }, { "names": "Zuko" }]));
    });
});
