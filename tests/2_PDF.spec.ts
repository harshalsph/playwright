import * as fs from 'fs';
import { test, expect, request } from '@playwright/test';
import { sharedData, envData, env} from './globalData';

(env !== 'dev' && env !== 'main' ? test.skip : test)('TC6 - Paid article', async () => {
  console.log("Test case 6 ======================");
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      'x-api-key': `${envData.x_api_key}`,
      'Authorization': `Bearer ${envData.MYSPH_OAUTH_TOKEN}`,
    }
  });

  const response = await apiContext.get(`${envData.NEWSHUB_V2}/v2/feed/article/st/${envData.ST_PREMIUM_ARTICLE_ID}`);
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log('Article Response:', responseBody.data.documentId);
});

(env !== 'dev' && env !== 'main' ? test.skip : test)('TC7- Access PDF',async() => {
console.log("Test Case 7==============================================");
const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString(); // Default format
//Custom format (e.g., YYYY-MM-DD)
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
const day = String(currentDate.getDate()).padStart(2, '0');
const customFormattedDate = `${year}-${month}-${day}`;
console.log(customFormattedDate);
const apicontext = await request.newContext({
  extraHTTPHeaders:{
    'x-api-key': `${envData.x_api_key}`,
    'Authorization': `Bearer ${envData.MYSPH_OAUTH_TOKEN}`,
  },
})
const response = await apicontext.get(`${envData.NEWSHUB_V2}/v2/epaper/detail/st/${customFormattedDate}`)
expect(response.status()).toBe(200);
const responseBody = await response.json();
expect(responseBody.code).toBe(200);
expect(responseBody.message).toBe("Success");
});

