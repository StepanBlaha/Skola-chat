import express from "express";
import { supabase } from "./lib/supabase.ts";


type messageBodyTypes = {
  name: string,
  text: string,
  color: string
}


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Serve the built frontend (after npm run build)
app.use(express.static("dist"));


// Get all messages
app.get("/api/messages", async (_req, res) => {
  const { data, error } = await supabase
    .from("messages")
    .select()
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not load messages" });
  }

  res.json(data);
});

// Post new message
app.post("/api/messages", async (req, res) => {
  const { name, text, color }: Partial<messageBodyTypes> = req.body ?? {};

  // Check the input
  if (typeof name !== "string" || name.trim() === "" || name.length > 30) {
    return res.status(400).json({ error: "Invalid name" });
  }
  if (typeof text !== "string" || text.trim() === "" || text.length > 500) {
    return res.status(400).json({ error: "Invalid message" });
  }
  if (typeof color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(color)) {
    return res.status(400).json({ error: "Invalid color" });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({ name: name.trim(), text: text.trim(), color: color })
    .select() // also select the inserted
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not send message" });
  }

  res.status(201).json(data);
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
