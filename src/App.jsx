import { useState } from "react";
import OpenAI from "openai";
import products from "./products";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true,
});

function App() {
  const [query, setQuery] = useState("");
  const [recommended, setRecommended] = useState(products);
  const [loading, setLoading] = useState(false);

  const getRecommendations = async () => {
    if (!query) return;

    setLoading(true);

    try {
      const prompt = `
You are a strict product recommendation assistant.

User request:
"${query}"

Available products:
${JSON.stringify(products)}

Instructions:
- Recommend ONLY the MOST relevant products.
- Do NOT include unrelated categories.
- If the request mentions premium, choose expensive/high-end products.
- If the request mentions budget, cheap, affordable, or under a price, choose lower-priced products.
- If the request mentions students, prioritize value-for-money products.
- Prefer exact category matches whenever possible.
- Return ONLY a valid JSON array of product names.
- Do NOT explain anything.
- Do NOT add extra text.

Examples:
["Dell Inspiron 15"]
["Sony WH-1000XM5"]
["Samsung Galaxy A54", "OnePlus Nord CE 3"]
["Apple Watch Series 9"]
["iPad Air"]
`;

      const response = await client.chat.completions.create({
        temperature: 0,
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const text = response.choices[0].message.content;

      const cleaned = text.replace(/```json|```/g, "").trim();
      const names = JSON.parse(cleaned);
    let filtered = products.filter((product) =>
  names.includes(product.name)
);

const lowerQuery = query.toLowerCase();

if (lowerQuery.includes("phone")) {
  filtered = filtered.filter((p) => p.category === "phone");
}

if (lowerQuery.includes("laptop")) {
  filtered = filtered.filter((p) => p.category === "laptop");
}

if (lowerQuery.includes("headphone")) {
  filtered = filtered.filter((p) => p.category === "headphones");
}

if (lowerQuery.includes("smartwatch") || lowerQuery.includes("watch")) {
  filtered = filtered.filter((p) => p.category === "smartwatch");
}

if (lowerQuery.includes("tablet")) {
  filtered = filtered.filter((p) => p.category === "tablet");
}

      setRecommended(filtered);
    } catch (error) {
      console.error(error);
      alert("Error fetching recommendations");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1>AI Product Recommendation System</h1>
      <p> 
        Enter your preferences and get AI-powered product recommendations.
      </p>
      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder="Enter preference..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={getRecommendations}
          style={styles.button}
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Recommendations"}
        </button>
      </div>

      <h2>Recommended Products</h2>

      <div style={styles.grid}>
        {recommended.map((product) => (
          <div key={product.id} style={styles.card}>
            <h3>{product.name}</h3>
            <p>Category: {product.category}</p>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    fontFamily: "Arial",
  },
  searchBox: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
  },
  input: {
    padding: "10px",
    width: "300px",
  },
  button: {
    padding: "10px 20px",
    cursor: "pointer",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  card: {
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "10px",
    transition: "0.3s",
    cursor: "pointer",
  },
};

export default App;