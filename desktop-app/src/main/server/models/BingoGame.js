const db = require('../config/db');

const BingoGame = {
  async insert(game) {
    return new Promise((resolve, reject) => {
      db.bingogames.insert({
        ...game,
        startedAt: new Date(),
        finished: game.finished || false,
        cartela: game.cartela || []
      }, (err, doc) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
  },
  async find(query) {
    return new Promise((resolve, reject) => {
      db.bingogames.find(query, (err, docs) => {
        if (err) reject(err);
        resolve(docs);
      });
    });
  },
  async findOne(query) {
    return new Promise((resolve, reject) => {
      db.bingogames.findOne(query, (err, doc) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
  },
  async updateOne(query, update) {
    return new Promise((resolve, reject) => {
      db.bingogames.update(query, { $set: update }, {}, (err, num) => {
        if (err) reject(err);
        resolve(num);
      });
    });
  },
  async remove(query, options = {}) {
    return new Promise((resolve, reject) => {
      db.bingogames.remove(query, options, (err, num) => {
        if (err) reject(err);
        resolve(num);
      });
    });
  }
};

module.exports = BingoGame;