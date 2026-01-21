const db = require('../config/db');

const House = {
  async insert(house) {
    return new Promise((resolve, reject) => {
      db.houses.insert({
        ...house,
        createdAt: new Date()
      }, (err, doc) => {
        if (err) return reject(err);
        resolve(doc);
      });
    });
  },

  async findOne(query) {
    return new Promise((resolve, reject) => {
      db.houses.findOne(query, (err, doc) => {
        if (err) return reject(err);
        resolve(doc);
      });
    });
  },

  async find(query) {
    return new Promise((resolve, reject) => {
      db.houses.find(query, (err, docs) => {
        if (err) return reject(err);
        resolve(docs);
      });
    });
  },

  async updateOne(query, update) {
    return new Promise((resolve, reject) => {
      db.houses.update(query, { $set: update }, {}, (err, numAffected) => {
        if (err) return reject(err);
        resolve(numAffected); // returns number of updated docs (should be 1)
      });
    });
  }
};

module.exports = House;
