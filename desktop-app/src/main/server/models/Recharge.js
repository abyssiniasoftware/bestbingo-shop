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
  },
  async findOne(query) {
    return new Promise((resolve, reject) => {
      db.recharges.findOne(query, (err, doc) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
  },
  async updateOne(query, update) {
    return new Promise((resolve, reject) => {
      db.recharges.update(query, { $set: update }, {}, (err, num) => {
        if (err) reject(err);
        resolve(num);
      });
    });
  }
};

module.exports = Recharge;