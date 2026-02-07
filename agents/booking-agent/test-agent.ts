/**
 * Test script for the Booking Agent via tRPC
 * Run: npx tsx test-agent.ts
 */

const API_BASE = 'http://localhost:4000';

interface LoginResponse {
  token: string;
  role: string;
  userId: string;
}

interface ChatResponse {
  text: string;
  sessionId: string;
  toolCalls?: Array<{
    toolName: string;
    args: unknown;
    result: unknown;
  }>;
}

async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status}`);
  }
  
  return res.json();
}

async function chatWithAgent(token: string, message: string, sessionId?: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/trpc/agent.chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      json: { message, sessionId },
    }),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Chat failed: ${res.status} - ${error}`);
  }
  
  const data = await res.json();
  return data.result.data.json;
}

async function getAgentInfo(token: string) {
  const res = await fetch(`${API_BASE}/trpc/agent.getAgentInfo`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    throw new Error(`Get info failed: ${res.status}`);
  }
  
  const data = await res.json();
  return data.result.data.json;
}

async function main() {
  console.log('🚀 Booking Agent Test\n');
  console.log('='.repeat(60));

  // Test users from seed data
  const testUsers = [
    { email: 'admin@port.com', password: 'Admin123!', role: 'ADMIN' },
    { email: 'op1@port.com', password: 'Op123456', role: 'OPERATOR' },
    // Add carrier if seeded
  ];

  for (const user of testUsers) {
    console.log(`\n📧 Testing as ${user.role} (${user.email})`);
    console.log('-'.repeat(60));

    try {
      // Login
      const { token, role, userId } = await login(user.email, user.password);
      console.log(`✅ Logged in as ${role} (${userId.slice(0, 8)}...)`);

      // Get agent info
      const info = await getAgentInfo(token);
      console.log(`\n📋 Agent Capabilities for ${info.role}:`);
      info.capabilities.forEach((cap: string) => console.log(`   • ${cap}`));

      // Test chat
      console.log('\n💬 Sending message: "List all terminals"');
      const response = await chatWithAgent(token, 'List all terminals');
      
      console.log(`\n🤖 Agent Response:`);
      console.log(response.text);
      
      if (response.toolCalls && response.toolCalls.length > 0) {
        console.log(`\n🔧 Tools Used:`);
        response.toolCalls.forEach(tc => {
          console.log(`   • ${tc.toolName}`);
        });
      }

      console.log(`\n📝 Session ID: ${response.sessionId}`);

    } catch (error) {
      console.error(`❌ Error:`, error instanceof Error ? error.message : error);
    }

    console.log('\n' + '='.repeat(60));
  }
}

main().catch(console.error);
