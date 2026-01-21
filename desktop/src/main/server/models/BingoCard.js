const db = require('../config/db');

const BingoCard = {
  async insert(card) {
    return new Promise((resolve, reject) => {
      db.bingocards.insert({
        ...card,
        createdAt: new Date(),
        n3: card.n3 || 0
      }, (err, doc) => {
        if (err) return reject(err);
        resolve(doc);
      });
    });
  },

  async find(query) {
    return new Promise((resolve, reject) => {
      db.bingocards.find(query, (err, docs) => {
        if (err) return reject(err);
        resolve(docs);
      });
    });
  },

  async findOne(query) {
    return new Promise((resolve, reject) => {
      db.bingocards.findOne(query, (err, doc) => {
        if (err) return reject(err);
        resolve(doc);
      });
    });
  },

  async updateOne(query, update) {
    return new Promise((resolve, reject) => {
      db.bingocards.update(query, { $set: update }, {}, (err, numUpdated) => {
        if (err) return reject(err);
        resolve(numUpdated);
      });
    });
  },

  async remove(query, options = {}) {
    return new Promise((resolve, reject) => {
      db.bingocards.remove(query, options, (err, numRemoved) => {
        if (err) return reject(err);
        resolve(numRemoved);
      });
    });
  }

};

module.exports = BingoCard;
