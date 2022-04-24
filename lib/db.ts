import {createPool} from 'mysql2';

export const pool = createPool({
  uri: process.env.MYSQL_URI,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
}).promise();
