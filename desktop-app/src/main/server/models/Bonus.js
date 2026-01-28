const db = require('../config/db');

const Bonus = {
  async insert(bonus) {
    return new Promise((resolve, reject) => {
      db.bonuses.insert({
        ...bonus,
        dateIssued: new Date(),
        bonusAmount: bonus.bonusAmount || 500,
        bonusType: bonus.bonusType || 'manual'
      }, (err, doc) => {
        if (err) {
          if (err.errorType === 'uniqueViolated') {
            const error = new Error('GameId already exists');
            error.code = 11000;
            return reject(error);
          }
          reject(err);
        }
        resolve(doc);
      });
    });
  },
  async find(query) {
    return new Promise((resolve, reject) => {
      db.bonuses.find(query, (err, docs) => {
        if (err) reject(err);
        resolve(docs);
      });
    });
  },
  async findOne(query) {
    return new Promise((resolve, reject) => {
      db.bonuses.findOne(query, (err, doc) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
  },
  async updateOne(query, update) {
    return new Promise((resolve, reject) => {
      db.bonuses.update(query, { $set: update }, {}, (err, num) => {
        if (err) reject(err);
        resolve(num);
      });
    });
  }
};

module.exports = Bonus;