const db = require('../config/db');
const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');

const User = {
  async findOne(query) {
    return new Promise((resolve, reject) => {
      db.users.findOne(query, (err, doc) => {
        if (err) reject(err);
        if (doc && doc.phone) {
          doc.phone = CryptoJS.AES.decrypt(doc.phone, 'classicBingoSecret').toString(CryptoJS.enc.Utf8);
          doc.address = CryptoJS.AES.decrypt(doc.address, 'classicBingoSecret').toString(CryptoJS.enc.Utf8);
        }
        resolve(doc);
      });
    });
  },
  async find(query) {
    return new Promise((resolve, reject) => {
      db.users.find(query, (err, docs) => {
        if (err) reject(err);
        docs.forEach(doc => {
          if (doc.phone) {
            doc.phone = CryptoJS.AES.decrypt(doc.phone, 'classicBingoSecret').toString(CryptoJS.enc.Utf8);
            doc.address = CryptoJS.AES.decrypt(doc.address, 'classicBingoSecret').toString(CryptoJS.enc.Utf8);
          }
        });
        resolve(docs);
      });
    });
  },
  async save(user) {
    return new Promise(async (resolve, reject) => {
      const existingUser = await this.findOne({ username: user.username });
      if (existingUser) {
        const error = new Error('Username already exists');
        error.code = 11000;
        return reject(error);
      }
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const encryptedPhone = CryptoJS.AES.encrypt(user.phone || '', 'classicBingoSecret').toString();
      const encryptedAddress = CryptoJS.AES.encrypt(user.address || '', 'classicBingoSecret').toString();
      db.users.insert({
        ...user,
        password: hashedPassword,
        phone: encryptedPhone,
        address: encryptedAddress,
        createdAt: new Date(),
        isBanned: user.isBanned || false,
        package: user.package || 0,
        enableDynamicBonus: user.enableDynamicBonus || false
      }, (err, doc) => {
        if (err) reject(err);
        doc.phone = user.phone || '';
        doc.address = user.address || '';
        resolve(doc);
      });
    });
  },
  async updateOne(query, update) {
    return new Promise((resolve, reject) => {
      db.users.update(query, { $set: update }, {}, (err, num) => {
        if (err) reject(err);
        resolve(num);
      });
    });
  }
};

module.exports = User;