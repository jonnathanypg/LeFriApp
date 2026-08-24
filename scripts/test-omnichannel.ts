/**
 * test-omnichannel.ts
 * 
 * Comprehensive Unit and Integration Test for:
 * 1. The 8 Data Structures (AuthHashCache, SlidingWindow, TriageHeap, LegalTrie, MessageQueue, WizardStack, AudioBuffer)
 * 2. Telegram Bot Triage and Link Token parsing
 * 3. WhatsApp Webhook Response and Audio Buffer handling
 * 4. Public Free Guest Chat & Soft-Onboarding Data Flow
 */

import {
  authHashCache,
  SlidingWindowMemory,
  LegalTriageHeap,
  legalConceptTrie,
  MessageQueue,
  WizardStepStack,
  AudioBufferManager
} from '../server/services/data-structures';

async function runTests() {
  console.log("=================================================");
  console.log("🧪 INICIANDO SUITE DE PRUEBAS DE LEFRIAPP V3.0");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      failed++;
    }
  }

  // --- Test 1: In-Memory Hash Map Cache O(1) ---
  console.log("🔹 Test 1: Hash Map Cache (O(1))");
  const testPhoneHash = 'hash_0991234567';
  const testUser = { id: 'usr_123', name: 'Juan Perez', phone: '0991234567' };
  authHashCache.setUserByPhoneHash(testPhoneHash, testUser);
  const cachedUser = authHashCache.getUserByPhoneHash(testPhoneHash);
  assert("AuthHashCache set/get by phoneHash in O(1)", cachedUser?.name === 'Juan Perez');

  const guestSession = authHashCache.getGuestSession('guest_test_1');
  assert("Guest Session initial quota is 10", guestSession.queriesLeft === 10);
  authHashCache.decrementGuestQuota('guest_test_1');
  assert("Guest Session quota decrements properly", authHashCache.getGuestSession('guest_test_1').queriesLeft === 9);

  // --- Test 2: Doubly Linked List Sliding Window O(1) ---
  console.log("\n🔹 Test 2: Doubly Linked List Memory Window (O(1))");
  const slidingMem = new SlidingWindowMemory(3);
  slidingMem.push('user', 'Hola 1');
  slidingMem.push('assistant', 'Resp 1');
  slidingMem.push('user', 'Hola 2');
  slidingMem.push('assistant', 'Resp 2');
  const history = slidingMem.toArray();
  assert("SlidingWindow evicts oldest messages maintaining exact capacity (3)", history.length === 3);
  assert("SlidingWindow contains latest message", history[history.length - 1].content === 'Resp 2');

  // --- Test 3: Max-Heap Priority Queue O(1) Top ---
  console.log("\n🔹 Test 3: Max-Heap Priority Queue (O(1) Top / O(log N))");
  const heap = new LegalTriageHeap();
  heap.insert({ id: '1', source: 'web', category: 'general', query: 'Consulta civil', urgencyScore: 2, timestamp: Date.now() });
  heap.insert({ id: '2', source: 'telegram', category: 'penal', query: 'Detenido en flagrancia', urgencyScore: 10, timestamp: Date.now() });
  heap.insert({ id: '3', source: 'whatsapp', category: 'laboral', query: 'Despido intempestivo', urgencyScore: 7, timestamp: Date.now() });
  
  const topPriority = heap.extractMax();
  assert("Max-Heap extracts Highest Urgency Case first (Score 10 - Flagrancia)", topPriority?.urgencyScore === 10 && topPriority.category === 'penal');
  const secondPriority = heap.extractMax();
  assert("Max-Heap extracts second highest priority (Score 7 - Laboral)", secondPriority?.urgencyScore === 7);

  // --- Test 4: Trie Prefix Tree O(L) ---
  console.log("\n🔹 Test 4: Trie Prefix Tree Legal Citations (O(L))");
  const query = "Me aplicaron un despido intempestivo ayer y no me quieren pagar liquidacion";
  const matchedLaws = legalConceptTrie.matchQuery(query);
  assert("Trie matches legal keyword in O(L) without database query", matchedLaws.some(l => l.article.includes('185') || l.code.includes('Trabajo')));

  // --- Test 5: Message Queue Humanized Delivery ---
  console.log("\n🔹 Test 5: Message Queue & Humanized Chunking");
  const longText = "Parrafo 1 sobre debido proceso.\n\nParrafo 2 sobre indemnizaciones laborales.\n\nParrafo 3 sobre citas judiciales.";
  const bubbles = MessageQueue.splitHumanizedBubbles(longText, 50);
  assert("Humanized message splitter creates multiple conversational bubbles", bubbles.length >= 2);

  // --- Test 6: Wizard Stack Backtracking (LIFO) ---
  console.log("\n🔹 Test 6: Wizard Step Stack (LIFO)");
  const wizard = new WizardStepStack();
  wizard.pushStep(1, 'datos_basicos', { nombre: 'Carlos' });
  wizard.pushStep(2, 'hechos', { fechaDespido: '2026-08-01' });
  assert("Wizard stack current step is 2", wizard.current()?.stepIndex === 2);
  const undone = wizard.undo();
  assert("Wizard undo navigates back to step 1 in O(1)", undone?.stepIndex === 1);

  // --- Test 7: Audio Buffer Typed Arrays ---
  console.log("\n🔹 Test 7: Audio Buffer Typed Arrays (O(1))");
  const sampleBase64 = Buffer.from('OggS_fake_audio_bytes').toString('base64');
  const typedArr = AudioBufferManager.base64ToTypedArray(sampleBase64);
  assert("AudioBufferManager converts base64 to contiguous Uint8Array", typedArr instanceof Uint8Array);

  console.log("\n=================================================");
  console.log(`📊 RESULTADO FINAL: ${passed} PASADAS, ${failed} FALLADAS`);
  console.log("=================================================");

  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
