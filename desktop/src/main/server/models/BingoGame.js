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
  }
};

module.exports = BingoGame;