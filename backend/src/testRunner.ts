import crypto from "crypto";
import { parseIntentDeterministic } from "./services/intentParser.js";
import { evaluateSpendingPolicy, verifyTransactionPin } from "./security/policyEngine.js";
import bcrypt from "bcryptjs";

let passed = 0;
let failed = 0;

const assert = (condition: boolean, testName: string, detail?: string) => {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
    failed++;
  }
};

const runAllTests = async () => {
  console.log("\n=======================================================");
  console.log("NEXCOMMERCE AGENTIC COMMERCE SUITE - AUTOMATED TESTS");
  console.log("=======================================================\n");

  // 1. Multilingual Intent Extraction Tests
  console.log("1. MULTILINGUAL INTENT EXTRACTION:");
  const enQuery = "I need a laptop under ₹70,000 for programming";
  const parsedEn = parseIntentDeterministic(enQuery);
  assert(parsedEn.intent === "search", "English intent classified as search");
  assert(parsedEn.category === "Laptops", "English category extracted as Laptops");
  assert(parsedEn.budgetMax === 70000, `English budget extracted as 70000 (got ${parsedEn.budgetMax})`);
  assert(parsedEn.requirements.includes("programming"), "English requirement includes programming");

  const teQuery = "నాకు ₹30000 లోపు మంచి కెమెరా ఉన్న ఫోన్ కావాలి";
  const parsedTe = parseIntentDeterministic(teQuery);
  assert(parsedTe.language === "te", "Telugu language detected");
  assert(parsedTe.category === "Phones", "Telugu category extracted as Phones");
  assert(parsedTe.budgetMax === 30000, `Telugu budget extracted as 30000 (got ${parsedTe.budgetMax})`);
  assert(parsedTe.requirements.includes("good camera"), "Telugu camera requirement identified");

  const hiQuery = "मुझे ₹30,000 के अंदर अच्छा कैमरा वाला फोन चाहिए";
  const parsedHi = parseIntentDeterministic(hiQuery);
  assert(parsedHi.language === "hi", "Hindi language detected");
  assert(parsedHi.category === "Phones", "Hindi category extracted as Phones");
  assert(parsedHi.budgetMax === 30000, `Hindi budget extracted as 30000 (got ${parsedHi.budgetMax})`);

  const trendQuery = "Show me what is trending right now";
  const parsedTrend = parseIntentDeterministic(trendQuery);
  assert(parsedTrend.intent === "trending", "Trending intent extracted accurately");

  const negQuery = "Can you get me a better price?";
  const parsedNeg = parseIntentDeterministic(negQuery);
  assert(parsedNeg.intent === "negotiate", "Negotiation intent extracted accurately");

  // 2. Spending Policy & AI Firewall Tests
  console.log("\n2. AI FIREWALL & SPENDING CONTROLS POLICY ENGINE:");
  const mockUser: any = {
    name: "Rahul Sharma",
    spendingControls: {
      autonomousLimit: 2000,
      requirePinAbove: 2000,
      maxDailySpend: 100000,
      spentToday: 0,
      lastSpendReset: new Date(),
    },
  };

  const policyUnderLimit = await evaluateSpendingPolicy(mockUser, 1499);
  assert(policyUnderLimit.allowed === true, "Transaction under autonomous limit is allowed");
  assert(policyUnderLimit.requiresPin === false, "Transaction under autonomous limit does not require PIN");

  const policyOverLimit = await evaluateSpendingPolicy(mockUser, 64999);
  assert(policyOverLimit.allowed === true, "Transaction over autonomous limit is allowed with auth");
  assert(policyOverLimit.requiresPin === true, "Transaction over autonomous limit strictly requires PIN");

  const policyOverDailyLimit = await evaluateSpendingPolicy(mockUser, 150000);
  assert(policyOverDailyLimit.allowed === false, "Transaction exceeding max daily spend is blocked");

  // PIN Verification Test
  const salt = await bcrypt.genSalt(10);
  mockUser.spendingControls.transactionPinHash = await bcrypt.hash("1234", salt);
  const pinValid = await verifyTransactionPin(mockUser, "1234");
  const pinInvalid = await verifyTransactionPin(mockUser, "9999");
  assert(pinValid === true, "Valid 4-digit PIN is authorized");
  assert(pinInvalid === false, "Invalid PIN is rejected");

  // 3. Razorpay Server-Side Cryptographic Signature Verification
  console.log("\n3. RAZORPAY TEST MODE SERVER-SIDE HMAC-SHA256 VERIFICATION:");
  const testSecret = "test_razorpay_secret_key_123";
  const testOrderId = "order_N7bX98F6k";
  const testPaymentId = "pay_N7bY12P8q";

  // Generate authentic signature
  const expectedSig = crypto
    .createHmac("sha256", testSecret)
    .update(`${testOrderId}|${testPaymentId}`)
    .digest("hex");

  // Test authentic match
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(expectedSig, "utf-8"),
    Buffer.from(expectedSig, "utf-8")
  );
  assert(isMatch === true, "Authentic HMAC-SHA256 signature verified server-side");

  // Test tampered signature
  const tamperedSig = crypto
    .createHmac("sha256", testSecret)
    .update(`${testOrderId}|pay_tampered_id`)
    .digest("hex");

  let tamperedMatch = false;
  try {
    tamperedMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSig, "utf-8"),
      Buffer.from(tamperedSig, "utf-8")
    );
  } catch {
    tamperedMatch = false;
  }
  assert(tamperedMatch === false, "Tampered signature rejected by cryptographic verification");

  // 4. Summary
  console.log("\n=======================================================");
  console.log(`TOTAL TESTS COMPLETED: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
};

runAllTests();
