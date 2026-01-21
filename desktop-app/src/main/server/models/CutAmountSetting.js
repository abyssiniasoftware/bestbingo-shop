const db = require('../config/db');

const CutAmountSetting = {
  async insert(setting) {
    return new Promise((resolve, reject) => {
      db.cutamountsettings.insert({
        ...setting,
        updatedAt: new Date()
      }, (err, doc) => {
        if (err) {
          if (err.errorType === 'uniqueViolated') {
            const error = new Error('CashierId already exists');
            error.code = 11000;
            return reject(error);
          }
          return reject(err);
        }
        resolve(doc);
      });
    });
  },

  async find(query = {}) {
    return new Promise((resolve, reject) => {
      db.cutamountsettings.find(query, (err, docs) => {
        if (err) return reject(err);
        resolve(docs);
      });
    });
  },

  async findOne(query) {
    return new Promise((resolve, reject) => {
      db.cutamountsettings.findOne(query, (err, doc) => {
        if (err) return reject(err);
        resolve(doc);
      });
    });
  },

  async updateOne(query, update) {
    return new Promise((resolve, reject) => {
      db.cutamountsettings.update(
        query,
        { $set: { ...update, updatedAt: new Date() } },
        {},
        (err, num) => {
          if (err) return reject(err);
          resolve(num);
        }
      );
    });
  }
};

module.exports = CutAmountSetting;
