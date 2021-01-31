// Right now these queries won't work because 'mysql' is undefined. I tried adding:
// var mysql = require('mysql'); or
// var mysql = require('./credentials');
// But I get the error: 'require' is undefined. Another post in stackoverflow said
// that this was because require() does not exist in the browser/client-side JavaScript.
// So how do we make queries outside of turnTracker?

document.addEventListener('DOMContentLoaded', bindButtons);

function bindButtons(){
    document.getElementById('cleardata').addEventListener('click', async function(event){
        console.log("Button Clicked: cleardata");
        await mysql.pool.query("DELETE FROM Encounters_Characters");
        await mysql.pool.query("DELETE FROM Conditions_Characters");
        await mysql.pool.query("DELETE FROM Encounters");
        await mysql.pool.query("DELETE FROM Conditions");
        await mysql.pool.query("DELETE FROM Items");
        await mysql.pool.query("DELETE FROM Characters");
        await event.preventDefault();
    });

    document.getElementById('addsampledata').addEventListener('click', async function(event){
        console.log("Button Clicked: addsampledata");
        var sampleChar = "INSERT INTO `Characters`(`charID`, `name`, `initiative`, `playerCharacter`, `hostileToPlayer`)"+
        "VALUES ('1', 'Lady Sampleton', '16', '1', '0'),"+
        "('2', 'Sir Samplelot', '15', '1', '0')";
        var sampleEn = "INSERT INTO `Encounters`(`enID`, `round`, `setting`)"+
        "VALUES ('1', '1', 'Palace Jousting Arena')";
        var sampleCon = "INSERT INTO `Conditions`(`conID`, `name`, `effect`)"+
        "VALUES ('1', 'Boundless Ambition', '+1 Charisma, -1 Wisdom'),"+
        "('2', 'Wry Wit', '+1 Intelligence'),"+
        "('3', 'Bleeding', '-1 HP per round')";
        var sampleItem = "INSERT INTO `Items`(`itemID`, `name`, `heldBy`, `type`, `effect`, `quantity`, `isMagic`)"+
        "VALUES ('1', 'Striped Lance', '2', 'Weapon', '+2 Melee Range', '1', '0'),"+
        "('2', 'Jeweled Dagger', '1', 'Weapon', 'Applies Bleeding', '1', '1')";
        var sampleEnChar = "INSERT INTO `Encounters_Characters`(`enID`, `charID`)"+
        "VALUES ('1', '1'),"+
        "('1', '2')";
        var sampleConChar = "INSERT INTO `Conditions_Characters`(`conID`, `charID`)"+
        "VALUES ('1', '2'),"+
        "('2', '1')";
        await mysql.pool.query(sampleChar);
        await msql.pool.query(sampleEn);
        await msql.pool.query(sampleCon);
        await msql.pool.query(sampleItem);
        await msql.pool.query(sampleEnChar);
        await msql.pool.query(sampleConChar);
        event.preventDefault();
    });
}