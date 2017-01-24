const fs = require('fs');
var usrFileName = "./users.json";

var users = {};

function loadUsers() {
    fs.readFile(usrFileName, (err, data) => {
        if (err) throw err;
        users = JSON.parse(data);
    });
}

function saveUsers() {
    var json = JSON.stringify(users);
    fs.writeFile(usrFileName, json, 'utf8', function (err) {
        if (err) throw err;
    })
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

function setMetaData(uid, key, val) {
    users[uid].data[key] = val;
    saveUsers();
}

function getMetaData(uid, key) {
    return users[uid].data[key];
}

function setCount(uid, val) {
  users[uid].count = val;
  saveUsers();
}

function getCount(uid) {
  return users[uid].count;
}

module.exports = {
    loadUsers,
    registerUser,
    getUser,
    setMetaData,
    getMetaData,
    setCount,
    getCount
};
