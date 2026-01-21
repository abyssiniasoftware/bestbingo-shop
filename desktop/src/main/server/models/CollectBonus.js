const db = require('../config/db');

const CollectBonus = {
  async insert(bonus) {
    return new Promise((resolve, reject) => {
      db.collectbonuses.insert({
        ...bonus,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: bonus.status || 'active'
      }, (err, doc) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
  },
  async find(query) {
    return new Promise((resolve, reject) => {
      db.collectbonuses.find(query, (err, docs) => {
        if (err) reject(err);
        resolve(docs);
      });
    });
  },
  async findOne(query) {
    return new Promise((resolve, reject) => {
      db.collectbonuses.findOne(query, (err, doc) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
  },
  async updateOne(query, update) {
    return new Promise((resolve, reject) => {
      db.collectbonuses.update(query, { $set: { ...update, updatedAt: new Date() } }, {}, (err, num) => {
        if (err) reject(err);
        resolve(num);
      });
    });
  }
};

module.exports = CollectBonus;