console.time('load');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
console.timeEnd('load');

console.time('init');
admin.initializeApp();
const app = express();
app.use(cors({ origin: true }));
console.timeEnd('init');

console.log('Success');
process.exit(0);
