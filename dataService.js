const fs = require('fs');
const diskusage = require('diskusage');
var usrFileName = "./users.json";

var users = {};
var fileLocked = false;

function loadUsers() {
    fs.readFile(usrFileName, (err, data) => {
        if (err) throw err;
        users = JSON.parse(data);
    });
}

async function getFreeMB() {
    try {
        const info = await diskusage.check('/');
        return info.available / 1024 / 1024;
    }
    catch (err) {
        console.error(err);
        return undefined;
    }
}

function saveUsers() {
	if(!fileLocked){
        getFreeMB().then(free => {
            if(free > 100) {
                fileLocked = true;
                var json = JSON.stringify(users);
                fs.writeFile(usrFileName, json, 'utf8', function (err) {
                    if (err) console.trace(err);
                    fileLocked = false;
                });
            }
            else {
                console.log(`Error: can't save user file. Not enough free space left on device (${free} MB)`);
            }
        });
	}
}

function registerUser(msg) {
    var uid = msg.chat.id;
    var usr = {enabled: true, data: {from: msg.from, chat: msg.chat}};
    users[uid] = usr;
    saveUsers();
}

function getUser(uid) {
    return users[uid];
}

function getUserList() {
    return Object.keys(users);
}

function setMetaData(uid, key, val) {
    users[uid].data[key] = val;
    saveUsers();
}

function getMetaData(uid, key) {
    return users[uid].data[key];
}

function assertCounter(uid, id) {
    if(users[uid]) {
        if(users[uid].counter) {
            if(users[uid].counter[id]) {
                if("value" in users[uid].counter[id]) {
                    return true;
                }
                else {
                    users[uid].counter[id].value = 0;
                }
            }
            else {
                users[uid].counter[id] = {};
                users[uid].counter[id].value = 0;
                saveUsers();
            }
        }
        else {
            users[uid].counter = {};
            if(users[uid].count && id == '0') {//old counter detected, migrate count
                users[uid].counter[id] = {value: users[uid].count};
                delete users[uid].count;
            }
            else {
                users[uid].counter[id] = {};
                users[uid].counter[id].value = 0;
            }
            saveUsers();
        }
    }
    else {
        //console.log("[ERROR] User ID", uid, "does not exist in database");
        var usr = {enabled: true, data: {from: undefined, chat: undefined, error: "user was not initialized properly"}, counter: {"0": {"value": 1}}};
        users[uid] = usr;
        saveUsers();
    }
}

function setCounter(uid, id, val) {
    assertCounter(uid, id);
    users[uid].counter[id].value = val;
    saveUsers();
}

function getCounter(uid, id) {
    assertCounter(uid, id);
    try {
        return users[uid].counter[id].value;
    }
    catch (e) {
        return 0;
    }
}

function getAllCounters(uid) {
    assertCounter(uid, '0');
    return users[uid].counter;
}

function setName(uid, id, name) {
    assertCounter(uid, id);
    users[uid].counter[id].name = name;
    saveUsers();
}

module.exports = {
    loadUsers,
    registerUser,
    getUserList,
    setMetaData,
    getMetaData,
    setCounter,
    getCounter,
    getAllCounters,
    setName
};
