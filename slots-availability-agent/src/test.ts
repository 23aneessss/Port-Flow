import * as readline from 'readline';
import { config } from 'dotenv';
import { SlotAvailabilityAgent, hasAccess, type UserRole } from './index.js';

// Load environment variables
config();

const ROLES: UserRole[] = ['ADMIN', 'OPERATOR', 'CARRIER', 'DRIVER'];

async function selectRole(): Promise<UserRole> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log('\n🔐 Select your role:');
    ROLES.forEach((role, index) => {
      const accessStatus = hasAccess(role) ? '✅' : '❌';
      console.log(`  ${index + 1}. ${role} ${accessStatus}`);
    });

    rl.question('\nEnter role number (1-4): ', (answer) => {
      rl.close();
      const index = parseInt(answer) - 1;
      if (index >= 0 && index < ROLES.length) {
        resolve(ROLES[index]);
      } else {
        console.log('Invalid selection, defaulting to CARRIER');
        resolve('CARRIER');
      }
    });
  });
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('       🚢 Port Flow - Slot Availability Agent             ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Deep knowledge of capacity engine state                  ');
  console.log('  Equipment constraints • Peak-hour restrictions           ');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Select role
  const userRole = await selectRole();
  console.log(`\n📋 Selected role: ${userRole}`);

  // Check access
  if (!hasAccess(userRole)) {
    console.log('\n❌ Access Denied: DRIVER role cannot use the Slot Availability Agent.');
    console.log('   Allowed roles: ADMIN, OPERATOR, CARRIER');
    process.exit(1);
  }

  console.log('✅ Access granted\n');

  // Create agent
  let agent: SlotAvailabilityAgent;
  try {
    agent = new SlotAvailabilityAgent({
      userRole,
    });
  } catch (error) {
    console.error('❌ Failed to create agent:', error);
    process.exit(1);
  }

  // Initialize agent (auto-login if configured)
  console.log('🔐 Initializing agent...');
  const initResult = await agent.initialize();
  
  if (!initResult.success) {
    console.error(`❌ Initialization failed: ${initResult.error}`);
    process.exit(1);
  }

  if (agent.isAuthenticated()) {
    console.log('✅ Authenticated successfully\n');
  } else {
    console.log('⚠️  Warning: Not authenticated. API calls may fail.');
    console.log('   Set AUTO_LOGIN_EMAIL and AUTO_LOGIN_PASSWORD in .env file,');
    console.log('   or set AUTH_TOKEN for manual authentication.\n');
  }

  console.log('🤖 Agent ready! Ask about slot availability, capacity, or constraints.');
  console.log('   Type "quit" to exit, "clear" to reset conversation.\n');
  console.log('Example questions:');
  console.log('  • What terminals have available slots right now?');
  console.log('  • What are the peak hours for Terminal A?');
  console.log('  • What equipment constraints should I know about?');
  console.log('  • Check capacity for all terminals');
  console.log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    rl.question(`[${userRole}] You: `, async (input) => {
      const trimmedInput = input.trim();

      if (!trimmedInput) {
        prompt();
        return;
      }

      if (trimmedInput.toLowerCase() === 'quit') {
        console.log('\n👋 Goodbye!');
        rl.close();
        process.exit(0);
      }

      if (trimmedInput.toLowerCase() === 'clear') {
        agent.clearHistory();
        console.log('🧹 Conversation cleared.\n');
        prompt();
        return;
      }

      try {
        process.stdout.write('\n🤖 Agent: ');

        // Use streaming for real-time output
        const generator = agent.chatStream(trimmedInput);
        let finalResponse;

        for await (const chunk of generator) {
          process.stdout.write(chunk);
          finalResponse = chunk;
        }

        // Get final result
        const result = await generator.next();
        if (result.value) {
          finalResponse = result.value;
        }

        console.log('\n');

        // Show tool calls if any
        if (
          typeof finalResponse === 'object' &&
          'toolCalls' in finalResponse &&
          finalResponse.toolCalls?.length
        ) {
          console.log('🔧 Tools used:');
          finalResponse.toolCalls.forEach((call: { toolName: string }) => {
            console.log(`   - ${call.toolName}`);
          });
          console.log('');
        }
      } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error);
        console.log('');
      }

      prompt();
    });
  };

  prompt();
}

main().catch(console.error);
