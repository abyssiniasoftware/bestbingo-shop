const util = require('util');
// Polyfill deprecated/removed util helpers used by old nedb versions
if (!util.isDate) util.isDate = (v) => Object.prototype.toString.call(v) === '[object Date]';
if (!util.isArray) util.isArray = Array.isArray;
if (!util.isRegExp) util.isRegExp = (v) => Object.prototype.toString.call(v) === '[object RegExp]';
const Datastore = require('nedb');
const logger = require('../utils/logger');
const fs = require('fs');
const os = require('os');
const path = require('path');

const getAppDataPath = () => {
  try {
    const { app } = require('electron');
    if (app) return app.getPath('userData');
  } catch (e) {
    // Fallback if not in Electron main process
  }

  if (process.platform === 'win32') {
    return path.join(os.homedir(), 'AppData', 'Roaming', 'bingo');
  }
  return path.join(os.homedir(), '.bingo');
};

const appDataPath = getAppDataPath();
const dbPath = path.join(appDataPath, 'db');

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

const databases = {
  users: new Datastore({ filename: path.join(dbPath, 'users.db'), autoload: true }),
  recharges: new Datastore({ filename: path.join(dbPath, 'recharges.db'), autoload: true }),
  houses: new Datastore({ filename: path.join(dbPath, 'houses.db'), autoload: true }),
  cutamountsettings: new Datastore({ filename: path.join(dbPath, 'cutamountsettings.db'), autoload: true }),
  collectbonuses: new Datastore({ filename: path.join(dbPath, 'collectbonuses.db'), autoload: true }),
  bonuses: new Datastore({ filename: path.join(dbPath, 'bonuses.db'), autoload: true }),
  bingogames: new Datastore({ filename: path.join(dbPath, 'bingogames.db'), autoload: true }),
  bingocards: new Datastore({ filename: path.join(dbPath, 'bingocards.db'), autoload: true }),
  agentrecharges: new Datastore({ filename: path.join(dbPath, 'agentrecharges.db'), autoload: true })
};

// Indexes
databases.cutamountsettings.ensureIndex({ fieldName: 'cashierId', unique: true }, (err) => {
  if (err) logger.error('Failed to create index on cutamountsettings.cashierId:', err);
  else logger.info('Index created on cutamountsettings.cashierId');
});
databases.collectbonuses.ensureIndex({ fieldName: 'houseId' }, (err) => {
  if (err) logger.error('Failed to create index on collectbonuses.houseId:', err);
  else logger.info('Index created on collectbonuses.houseId');
});
databases.bonuses.ensureIndex({ fieldName: 'gameId', unique: true }, (err) => {
  if (err) logger.error('Failed to create index on bonuses.gameId:', err);
  else logger.info('Index created on bonuses.gameId');
});

module.exports = databases;
