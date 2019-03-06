import SQLite from 'react-native-sqlite-storage'
import { configDynamic, configLocal } from './config'
import RNFS from 'react-native-fs'

var __historySQLite = null;
function __clearHistory(tableName) {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            tx.executeSql(`DROP TABLE ${tableName}`, [], (tx, results) => {
                console.log(results);
                resolve();
            });
        });
    });
}
function historyTableInit(tableName) {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            tx.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, island VARCHAR(5), tid INTEGER DEFAULT 0, cache TEXT, addtime INTEGER DEFAULT 0)`, [], (tx, results) => {
                console.log(results);
                tx.executeSql(`CREATE UNIQUE INDEX index_island_only_${tableName} on ${tableName} (island, tid);`);
                resolve();
            });
        });
    });
}

function init() {
    return new Promise((resolve, reject)=>{
        __historySQLite = SQLite.openDatabase({name: 'history.db', location: 'default'}, async ()=>{
            await __clearHistory('UserBrowseHistory');
            await __clearHistory('UserReplyHistory');
            await historyTableInit('UserBrowseHistory');
            await historyTableInit('UserReplyHistory');
        }, (e)=>{
            resolve({status: 'error', errmsg: e});
        });
    });
}

function addNewHistory(mode, detail, time) {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            tx.executeSql(`REPLACE INTO ${mode==='browse'?'UserBrowseHistory':'UserReplyHistory'}(island, tid, cache, addtime) VALUES('${configDynamic.islandMode}',${detail.id},'${JSON.stringify(detail)}',${time})`, [], (tx, results) => {
                console.log(results);
                resolve();
            });
        });
    });
}

async function getHistory(mode, page) {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            tx.executeSql(`SELECT * FROM ${mode==='browse'?'UserBrowseHistory':'UserReplyHistory'} WHERE island='${configDynamic.islandMode}' ORDER BY addtime DESC LIMIT ((${page}-1)*20),20`, [], (tx, results) => {
                resolve(results);
            });
        });
    });
}

const history = {
    init: init,
    addNewHistory: addNewHistory,
    getHistory: getHistory
}
export { history }