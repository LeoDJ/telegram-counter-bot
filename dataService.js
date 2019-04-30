const fs = require('fs');
var usrFileName = "./users.json";

var users = {};
var fileLocked = false;

function loadUsers() {
    fs.readFile(usrFileName, (err, data) => {
        if (err) throw err;
        users = JSON.parse(data);
    });
}

function saveUsers() {
	if(!fileLocked){
		fileLocked = true;
		var json = JSON.stringify(users);
		fs.writeFile(usrFileName, json, 'utf8', function (err) {
			if (err) throw err;
			fileLocked = false;
		})
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
    return users[uid].counter[id].value;
}

function getAllCounters(uid) {
    return users[uid].counter;
}

module.exports = {
    loadUsers,
    registerUser,
    getUserList,
    setMetaData,
    getMetaData,
    setCounter,
    getCounter,
    getAllCounters
};
