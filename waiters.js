module.exports = function WaitersAvailability(db) {

  async function setWaiterName(name, code) {
    await db.none('INSERT INTO workers(username, code) values($1, $2)', [name, code])
  }


  async function getWaiterName(code) {
    let results = await db.oneOrNone('SELECT username FROM workers WHERE code=$1', [code])
    return results.username;
  }

  async function userId(user) {
    let user_id = await db.one('SELECT id FROM workers WHERE username=$1', [user])
    return user_id.id
  }

  async function setWeekday(day, user) {
    let user_id = await db.one('SELECT id FROM workers WHERE username=$1', [user])
    await db.none('DELETE FROM admins WHERE user_id= $1', [user_id.id])

    for (let i = 0; i < day.length; i++) {
      const weekday = day[i];
      let day_id = await db.one('SELECT id FROM workdays WHERE workday=$1', [weekday])
      await db.none('INSERT INTO admins(day_id, user_id) values($1, $2)', [day_id.id, user_id.id])
    }
  }  



  async function getWeekday() {
    let results = await db.oneOrNone('SELECT * FROM admins')
    return results;
  }

  async function allWorkers() {
    let output = await db.oneOrNone("SELECT username, code from workers")
    return output;
  }

  async function findUser(name) {
    let output = await db.one("SELECT COUNT(*) FROM workers WHERE username=$1", [name])
    return output;
  }

  async function findCode(userCode) {
    let output = await db.oneOrNone("SELECT * FROM workers WHERE code=$1", [userCode])
    return output;
  }


  async function joinUsers(week_days) {
    let output = await db.manyOrNone(`select workers.username, workdays.workday FROM admins
    INNER JOIN workers ON admins.user_id= workers.id
    INNER JOIN workdays ON admins.day_id = workdays.id where workdays.workday= $1`, [week_days])
    return output;
  }

  async function deleteAllUsers() {
    return await db.none('DELETE FROM admins')
  }


  async function getDays(userId) {
    let output = await db.manyOrNone('SELECT user_id, day_id, workday FROM admins join workdays on workdays.id = day_id where user_id = $1', [userId]);
    return output
  }

  async function weekdays() {
    let output = await db.manyOrNone('SELECT * FROM workdays')
    return output
  }

  async function checkDay(day) {
    let output = await db.oneOrNone('SELECT id from workdays where workday= $1', [day]);

    let results = await db.oneOrNone('SELECT COUNT(*) FROM admins JOIN workdays on admins.day_id= workdays.id WHERE admins.day_id=$1', [output.id])
    return results.count;
  }

  async function dayColor() {
    let days = await db.manyOrNone("SELECT workday FROM workdays")
    let status = []
    for (i = 0; i < days.length; i++) {
      let day = days[i].workday;
      let count = await checkDay(day);
      if (Number(count) >= 0 && Number(count) < 3) {
        status.push({ weekday: day, state: "available" });
      } else if (Number(count) == 3) {
        status.push({ weekday: day, state: "fully-booked" });
      } else if (Number(count > 3)) {
        status.push({ weekday: day, state: "overbooked" })
      }
    }
    return status
  }


  return {
    setWaiterName,
    getWaiterName,
    setWeekday,
    getWeekday,
    deleteAllUsers,
    findUser,
    findCode,
    joinUsers,
    dayColor,
    checkDay,
    dayColor,
    getDays,
    weekdays,
    userId,
    allWorkers

  }
}