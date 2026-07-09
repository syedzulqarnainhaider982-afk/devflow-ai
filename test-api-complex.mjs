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
        content: [{ type: "text", text: "hello complex payload" }]
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
