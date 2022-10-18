const assert = require("assert");
const WaitersAvailability = require("../waiters")

const pgp= require("pg-promise")();

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://kamvest:kv112@localhost:5432/waiters";

const config = {
    connectionString: DATABASE_URL
};

const db = pgp(config);


describe('My database tests', async function () {
    this.beforeEach(async function () {
        await db.none('DELETE FROM workers')
    });
    it('It should be able to return the name entered on database', async function () {
        let greetName = GreetingFact(db);
        await greetName.setWaiterName("Phumza");
        assert.equal("Phumza", await greetName.getWaiterName());
    });

    it('It should be able submit working days', async function () {
        let greetName = GreetingFact(db);
        await greetName.updateCount("Phumza");
        await greetName.updateCount("Phumza");
        await greetName.updateCount("Phumza");

        assert.equal(1, await greetName.getCount());
    });
    // this.beforeEach(async function () {
        //     await db.none('DELETE FROM greetings')
        // });
        
        it('It should be able to clear greeted names', async function () {
            let greetName = GreetingFact(db);
            await greetName.updateCount("Sange")
            await greetName.updateCount("Zona")
            await greetName.updateCount("Sbahle")
            
            assert.equal(null, await greetName.deleteAllNames());
        });
        
        
        it('It should be able to return list of greeted names', async function () {
            let greetName = GreetingFact(db);
            await greetName.updateCount("Sange")
            await greetName.updateCount("Zona")
            await greetName.updateCount("Sbahle")
            
            // await greetName.namesList([{"names": "Thango"},{"names": "Sbahle"},{"names": "Zuko"}])
            
            assert.deepEqual( [{"username": "Sange"},{"username": "Zona"},{"username": "Sbahle"}] , await greetName.namesList([{"names": "Thango"},{"names": "Sbahle"},{"names": "Zuko"}]));
        }); 
    });
