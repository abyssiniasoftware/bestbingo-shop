const db = require('../config/db');

const Recharge = {
  async insert(recharge) {
    return new Promise((resolve, reject) => {
      db.recharges.insert({
        ...recharge,
        createdAt: new Date()
      }, (err, doc) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
  },
  async find(query) {
    return new Promise((resolve, reject) => {
      db.recharges.find(query, (err, docs) => {
        if (err) reject(err);
        resolve(docs);
      });
    });
  }
};

module.exports = Recharge;