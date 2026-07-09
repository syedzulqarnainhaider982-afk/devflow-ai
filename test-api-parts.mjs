async function run() {
  const res = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-test-override": "true"
    },
    body: JSON.stringify({
      modelId: "gemini-flash-lite-latest",
      messages: [{ 
        role: "user", 
        parts: [{ type: "text", text: "what languages do you understand? reply with exactly one word." }]
      }]
    })
  });
  
  if (res.ok) {
    const text = await res.text();
    console.log("SUCCESS:", text);
  } else {
    const text = await res.text();
    console.log("ERROR:", res.status, text);
  }
}
run();
