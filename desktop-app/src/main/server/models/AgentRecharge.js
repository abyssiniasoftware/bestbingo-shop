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
  }
};

module.exports = AgentRecharge;