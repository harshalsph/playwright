import * as fs from 'fs';

export let sharedData: any = {};

export const env = process.env.TEST_ENV || 'dev'; // default to 'dev'
const configPath = `./env/${env}.json`; 
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

export const envData = {
  MYSPH_LOGIN_HOST:config.MYSPH_LOGIN_HOST,
  MYSPH_REDIRECT_URL:config.MYSPH_REDIRECT_URL,
  MYSPH_CLIENT_ID:config.MYSPH_CLIENT_ID,
  SPH_OAUTH_SERVER:config.SPH_OAUTH_SERVER,
  NEWSHUB_V2: config.NEWSHUB_V2,
  x_api_key: config.x_api_key,
  username:config.username,
  password:config.password,
  MYSPH_OAUTH_TOKEN: config.MYSPH_OAUTH_TOKEN,
  ST_PREMIUM_ARTICLE_ID:config.ST_PREMIUM_ARTICLE_ID
};

