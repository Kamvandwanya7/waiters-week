module.exports = function WaitersAvailability(db) {

  async function setWaiterName(name, code) {
    // console.log(name)
    let result = await db.none('INSERT INTO workers(username, code) values($1, $2)', [name, code])
    // console.log(result)
    return result;
  }


  async function getWaiterName(code) {
    let results = await db.oneOrNone('SELECT username FROM workers WHERE code=$1', [code])
    // console.log(results)
    return results.username;
  }

  async function setWeekday(day, user) {
    let user_id = await db.one('SELECT id FROM workers WHERE username=$1', [user])
    // console.log(user_id);

    for (let i = 0; i < day.length; i++) {
      const weekday = day[i];
      let day_id = await db.one('SELECT id FROM workdays WHERE workday=$1', [weekday])
      // console.log(day_id);
      let result = await db.none('INSERT INTO admins(day_id, user_id) values($1, $2)', [day_id.id, user_id.id])

    }
    //  console.log(result)
    //  return result;
  }


  async function getWeekday() {
    let results = await db.oneOrNone('SELECT * FROM admins')
    // console.log(results)
    return results;
  }

  async function findUser(name) {
    let output = await db.one("SELECT COUNT(*) FROM workers WHERE username=$1", [name])
    // console.log(output)
    return output;
  }

  async function findCode(userCode) {
    let output = await db.oneOrNone("SELECT * FROM workers WHERE code=$1", [userCode])
    // console.log(output)
    return output;
  }


  async function joinUsers(weeks) {
    let output = await db.manyOrNone(`select workers.username, workdays.workday FROM admins
    INNER JOIN workers ON admins.user_id= workers.id
    INNER JOIN workdays ON admins.day_id = workdays.id where workdays.workday= $1`, [weeks])
    return output;
  }

  async function deleteAllUsers() {
    return await db.none('DELETE FROM admins')
  }


  // async function (){
  //   let output
  // }

  async function checkDay(day){
    let output= await db.oneOrNone('SELECT id from workdays where workday= $1', [day]);

    let results= await db.oneOrNone('SELECT COUNT(*) FROM admins JOIN workdays on admins.day_id= workdays.id WHERE admins.day_id=$1', [output.id])
    return results.count;
  }

 async function dayColor(){
  let days= await db.manyOrNone("SELECT workday FROM workdays")
// console.log(days);
  let status= []
  for(i=0; i<days.length; i++){
    let day=days[i].workday;
    let count= await checkDay(day);
    if(Number(count)>= 0 && Number(count)<3){
      status.push({weekday: day, state: "available"});
    }else if(Number(count)==3) {
      status.push({weekday: day, state: "fully-booked"});
    }else if (Number(count>3)){
      status.push({weekday: day, state: "overbooked"})
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
    dayColor

  }
}