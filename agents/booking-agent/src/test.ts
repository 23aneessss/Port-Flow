/**
 * Test script for the Booking Agent
 * Run with: npm run test
 */
import 'dotenv/config';
import { createBookingAgent } from './agent.js';

async function main() {
  console.log('🤖 Booking Agent Test\n');
  console.log('='.repeat(50));

  // Create agent (will use MISTRAL_API_KEY from .env)
  const agent = createBookingAgent({
    config: {
      apiBaseUrl: 'http://localhost:4000',
    },
    // You would set this with an actual JWT token after login
    // authToken: 'your-jwt-token-here',
  });

  // Test queries
  const testQueries = [
    'List all available terminals',
    'What terminals do you have?',
    // 'Where is my booking #5432?',
    // 'Show me all pending bookings',
  ];

  for (const query of testQueries) {
    console.log(`\n📝 User: ${query}`);
    console.log('-'.repeat(50));

    try {
      const response = await agent.chat(query);
      console.log(`\n🤖 Agent: ${response.text}`);

      if (response.toolCalls && response.toolCalls.length > 0) {
        console.log('\n📦 Tool Calls:');
        for (const call of response.toolCalls) {
          console.log(`  - ${call.toolName}:`, JSON.stringify(call.args, null, 2));
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }

    console.log('\n' + '='.repeat(50));
  }
}

main().catch(console.error);
