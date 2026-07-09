// Test each model directly with exact payload the SDK sends
const models = [
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-flash-lite-latest",
  "gpt-4o-mini",
];

for (const modelId of models) {
  console.log(`\n=== Testing model: ${modelId} ===`);
  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-test-override": "true"
      },
      body: JSON.stringify({
        modelId,
        messages: [{ 
          role: "user", 
          parts: [{ type: "text", text: `Hello from ${modelId} test. Reply in exactly 5 words.` }]
        }]
      })
    });

    console.log(`  HTTP Status: ${res.status}`);
    
    const text = await res.text();
    if (res.ok) {
      // Extract just the text deltas
      const deltas = text.match(/"delta":"([^"]+)"/g)?.map(d => d.replace(/"delta":"/, '').replace(/"$/, ''));
      if (deltas && deltas.length > 0) {
        console.log(`  ✅ SUCCESS - Response: ${deltas.join('')}`);
      } else {
        console.log(`  ⚠️ STREAM OK but no text deltas found. Body:`, text.substring(0, 300));
      }
    } else {
      console.log(`  ❌ ERROR - Body:`, text.substring(0, 500));
    }
  } catch (err) {
    console.log(`  ❌ EXCEPTION:`, err.message);
  }
}
