/* eslint-disable radix */
const bcrypt = require('bcrypt');
const dbPool = require('../database/postgres');
const configFile = require('../config/config.json');
const config = require('../config');

const checkUserExist = async (email, password) => {
  let userExist = false;
  const allUsers = await dbPool.query('SELECT * FROM users WHERE email=$1', [
    email,
  ]);
  const usersList = allUsers.rows;
  if (usersList.length > 0) {
    console.log('user exist');
    userExist = true;
  } else {
    console.log('user not exist');
    userExist = false;
  }
  if (!userExist) {
    return { success: false, message: 'user email not found.' };
  }
  const userInfo = usersList[0];
  const passwordCorrect = await bcrypt.compare(password, userInfo.password);
  if (!passwordCorrect) {
    return { success: false, message: 'incorrect password' };
  }
  const response = {};
  response.success = true;
  response.message = 'successfully log in';
  response.data = {
    user_id: userInfo.user_id,
    username: userInfo.username,
    email: userInfo.email,
  };
  return response;
};

const getNewID = async () => {
  const recordNumber = await dbPool.query('SELECT count(*) FROM users');
  const result = recordNumber.rows[0];
  const countNumber = result.count;
  return parseInt(countNumber) + 1;
};

module.exports = (router) => {
  router.route('/register').post(async (req, res) => {
    try {
      const { email, password } = req.body;
      const passwordDigest = await bcrypt.hash(password, configFile.salt);
      // temp fix remove function when ID is set to auto-incrementing
      const newID = await getNewID();

      const insertInfo = [newID, 'unnamed user', email, passwordDigest];
      const userInsert = await dbPool.query(
        'INSERT INTO users (user_id,username,email,password) VALUES ($1,$2,$3,$4) RETURNING *',
        insertInfo
      );
      const response = {};
      response.success = true;
      response.message = '';
      // eslint-disable-next-line camelcase
      const { user_id, username } = userInsert.rows[0];
      response.data = { email, user_id, username };
      res.json(response);
    } catch (error) {
      console.log('error', error.message);
      if (config.isDevMode()) {
        res.json({
          success: false,
          message: `${error.message} (only shown in dev mode)`,
        });
      } else {
        res.json({ success: false, message: 'server error' });
      }
    }
  });

  router.route('/users').get(async (req, res) => {
    const response = {};
    if (configFile.isDevMode()) {
      const allUsers = await dbPool.query('SELECT * FROM users');
      const usersList = allUsers.rows;
      response.success = true;
      response.message = 'all users';
      response.data = usersList;
    } else {
      response.success = false;
      response.message = 'invalid operation';
    }

    res.json(response);
  });

  router.route('/isLoggedIn').get(async (req, res) => {
    const response = {};
    response.success = true;
    response.message = 'message';
    response.username = 'Demo User';
    res.json(response);
  });

  router.route('/login').post(async (req, res) => {
    const { emailInput, passwordInput } = req.body;
    const email = emailInput;
    const password = passwordInput;
    // database query below
    const dbResult = await checkUserExist(email, password);
    // after query
    const response = {};
    response.success = dbResult.success;
    response.message = dbResult.message;
    res.json(response);
  });
};
