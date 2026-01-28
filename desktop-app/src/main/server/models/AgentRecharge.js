const db = require('../config/db');

const AgentRecharge = {
  async insert(recharge) {
    return new Promise((resolve, reject) => {
      db.agentrecharges.insert({
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
      db.agentrecharges.find(query, (err, docs) => {
        if (err) reject(err);
        resolve(docs);
      });
    });
  },
  async findOne(query) {
    return new Promise((resolve, reject) => {
      db.agentrecharges.findOne(query, (err, doc) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
  },
  async updateOne(query, update) {
    return new Promise((resolve, reject) => {
      db.agentrecharges.update(query, { $set: update }, {}, (err, num) => {
        if (err) reject(err);
        resolve(num);
      });
    });
  }
};

module.exports = AgentRecharge;