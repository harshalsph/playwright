import * as fs from 'fs';
import {test, expect, request} from '@playwright/test';
import { sharedData, envData } from './globalData';
import path from 'path';

test.describe.serial('Create Auth Token', () => { 
test('TC1-Login/Signout', async ({ request }) => {
    console.log("Test case 1 ======================================================")
    const response = await request.get(`${envData.MYSPH_LOGIN_HOST}/login/signout`, {
        params: {
            clientId: `${envData.MYSPH_CLIENT_ID}`,
            redirectURL: `${envData.MYSPH_REDIRECT_URL}/v2/oauth/callback`,
            state: 'st',
        },
    });
    expect(response.status()).toBe(200);
});

let stateToken: String; // Declare stateToken in the outer scope.

test('TC2-Load Login Form & Get State Token From Redirect', async ({ request}) => {
    console.log("Test case 2 ======================================================")
    const response = await request.get(`${envData.MYSPH_LOGIN_HOST}/oauth2/${envData.SPH_OAUTH_SERVER}/v1/authorize`, {
        headers: {
            Cookie: 'DT=DI1A03b4MzkRqicXLCNmuPCUQ; sid=102DBjPAA21Q6mLut6FuyNYYw; xids=102otdVscIORd2ukUVnk-KXlQ',
        },
        params: {
            client_id: `${envData.MYSPH_CLIENT_ID}`,
            response_type: 'code',
            redirect_uri: `${envData.MYSPH_REDIRECT_URL}/v2/oauth/callback`,
            scope: 'openid offline_access profile magw',
            state: 'st',
            nonce: '0A97CB32-08C2-4ACB-93A4-C2B3819F0284',
            prompt: 'login',
        },
    });
    const responseText = await response.text();
    expect(response.status()).toBe(200);
    // const responseText = await response.text();
    const matchResult = responseText.match(/stateToken":"([^"]+)/);
    if (!matchResult) {
    throw new Error("stateToken not found in responseText");
    }
    const stateTokenMatch = matchResult[1];
    //const stateTokenMatch = responseText.match(/stateToken":"([^"]+)/)[1];
    const myString = stateTokenMatch;
    const resultArr = myString.split("\\x2D");
    stateToken = resultArr.join("-");
    // console.log('State Token:', stateToken);
    sharedData.stateToken=stateToken;
    // await use(stateToken);  
    expect(stateTokenMatch).not.toBeNull();
    console.log("state token: "+sharedData.stateToken);
    
});

test('TC3-MySPH login', async ({ request }) => {
    console.log("Test case 3 ======================================================")
    console.log('ST-', sharedData.stateToken);
    const response = await request.post(`${envData.MYSPH_LOGIN_HOST}/api/v1/authn`, {
        headers: {
            'Content-Type': 'application/json',
            'Cookie': 'DT=DI1A03b4MzkRqicXLCNmuPCUQ',
        },
        data: {
            username: `${envData.username}`,
            password: `${envData.password}`,
            stateToken: sharedData.stateToken,
        },
    });
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    //console.log('Response Body:', responseBody);

});
  let authCode: String;
  test('TC4-Enter login details state token', async ({ request }) => {
    console.log("Test case 4 ======================================================")
    console.log("ST:- "+sharedData.stateToken);
    // Send the GET request
    const response = await request.get(`${envData.MYSPH_LOGIN_HOST}/login/step-up/redirect?stateToken=`+stateToken, {
        maxRedirects: 0, // Prevent all redirects
    });
    // Ensure the response status is OK
    expect(response.status()).toBe(302);
    const locationHeader = response.headers()['location'];
    console.log('Location Header:', locationHeader);
   // Extract the auth code from the URL
   const url = new URL(locationHeader);
   const authCode = url.searchParams.get('code');
   sharedData.authCode = authCode;
   console.log('Auth Code:', authCode);
  });

  test('TC5-Mobile login', async () => {
    console.log("Test case 5 ======================================================");
    console.log("Authcode:- " + sharedData.authCode);
    console.log(envData.NEWSHUB_V2);
    const context = await request.newContext();
    const response = await context.post(`${envData.NEWSHUB_V2}/v2/oauth/mysph/login`, {
      headers: {
        'x-api-key': `${envData.x_api_key}`,
        'Content-Type': 'application/json'
      },
      data: {
        authCode: sharedData.authCode,
        appName: 'ST',
        appVersion: '10.0.1',
        deviceCode: 'SPHONE',
        deviceId: '9EA44EE6-5365-4BD4-95EE-8D4162417EA5',
        deviceName: 'Postman',
        osName: 'IOS',
        osVersion: '15.1',
        serviceCode: 'zb,sm,st,bt',
        redirecturi: `${envData.MYSPH_REDIRECT_URL}/v2/oauth/callback`
      }
    });
    // Validate the response status
    const responseBody = await response.json();
    console.log(responseBody);
    expect(response.status()).toBe(200);
    // Parse and log the response body
    const token = responseBody.data.token;
    console.log('Token:', token);
    // ✅ Read current env config
    const env = process.env.TEST_ENV || 'dev';
    const configPath = `./env/${env}.json`;
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    // ✅ Update token
    config.MYSPH_OAUTH_TOKEN = token;
    // ✅ Write it back
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  });
    
test('screenshot always', async ({ page }) => {
  await page.goto('https://playwright.dev');
  
  // Save screenshot in test-results/screenshots
  const screenshotDir = path.join(process.cwd(), 'playwright-report', 'screenshots');
  await page.screenshot({ 
    path: `${screenshotDir}/homepage.png`, 
    fullPage: true 
  });
});
})

