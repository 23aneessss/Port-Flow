import { config } from 'dotenv';
config();

import { createConfig } from './src/config.js';
import { ApiClient } from './src/api-client.js';

async function test() {
  const cfg = createConfig();
  console.log('Config:', { 
    apiBaseUrl: cfg.apiBaseUrl, 
    hasAutoLogin: !!cfg.autoLogin,
    autoLoginEmail: cfg.autoLogin?.email 
  });
  
  const client = new ApiClient(cfg);
  
  // Test auto-login
  if (cfg.autoLogin) {
    console.log('\nTesting auto-login...');
    const result = await client.login(cfg.autoLogin.email, cfg.autoLogin.password);
    console.log('Login result:', result.success ? 'SUCCESS' : `FAILED: ${result.error}`);
    
    if (result.success) {
      console.log('Token received:', result.data?.token?.substring(0, 50) + '...');
      
      // Test API call
      console.log('\nTesting terminals API...');
      const terminals = await client.get('/admin/terminals');
      console.log('Terminals result:', terminals.success ? 'SUCCESS' : `FAILED: ${terminals.error}`);
      if (terminals.data) {
        console.log('Data:', JSON.stringify(terminals.data, null, 2));
      }
    }
  } else {
    console.log('\nNo auto-login configured. Set AUTO_LOGIN_EMAIL and AUTO_LOGIN_PASSWORD in .env');
  }
}

test().catch(console.error);
