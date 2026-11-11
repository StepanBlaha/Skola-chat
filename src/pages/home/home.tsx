import { useEffect, useState } from "react";
import styles from "./home.module.css";


type messageTypes = {
  id: number,
  name: string,
  text: string,
  color: string,
  created_at: string
}


export default function Home() {

  const [name, setName] = useState<string>("")
  const [text, setText] = useState<string>("")
  const [color, setColor] = useState<string>("#4be546")
  const [messages, setMessages] = useState<messageTypes[]>([])
  const [error, setError] = useState<string>("")


  // Fetch messages from server
  async function getMessages() {
    const res = await fetch("/api/messages")
    const data = await res.json()
    if (!res.ok) {
      console.error(data.error)
      setError(data.error)
      return
    }
    // Set the messages
    setMessages(data)
    setError("")
  }

  // Post new message
  async function postMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !text.trim()) return

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, text: text, color: color })
    })
    const data = await res.json()
    if (!res.ok) {
      console.error(data.error)
      setError(data.error)
      return
    }

    // If the message got inserted append it
    setMessages([...messages, data])
    setError("")

    // Reset the message
    setText("")
  }


  // Load messages on start and then every 5 seconds
  useEffect(() => {
    const callApi = async () => {
      try {
        await getMessages()
      } catch (error) {
        console.error(error)
        setError("Could not load messages")
      }
    };

    callApi();
    const interval = setInterval(callApi, 5000)
    return () => clearInterval(interval)
  }, [])


  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Shoutbox</h1>

      <div className={styles.messages}>
        {messages.length === 0 && <p className={styles.empty}>No messages yet</p>}
        {messages.map(message =>
          <p key={message.id} className={styles.message}>
            <span className={styles.time}>
              {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <strong style={{ color: message.color }}>{message.name}:</strong> {message.text}
          </p>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <form className={styles.form} onSubmit={postMessage}>
        <div className={styles.row}>
          <label>
            Name
            <input
              type="text"
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Color
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </label>
        </div>
        <label>
          Message
          <input
            type="text"
            maxLength={500}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <button className={styles.button} type="submit">Send</button>
      </form>
    </div>
  );
}
