import React, { useState } from "react";
import "./ChatPage.css"; // 可选样式文件

const ChatPage = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 加入新消息（你自己说的话）
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");

    // TODO: 等后端接好，再用 fetch/axios 发送请求
    // 暂时假装 GPT 回复一句
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "gpt", text: "🤖 GPT 模拟回复: " + input },
      ]);
    }, 500);
  };

  return (
    <div className="chat-container">
      <h2>Chat with GPT</h2>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === "user" ? "user" : "gpt"}`}
          >
            <strong>{msg.sender === "user" ? "You" : "GPT"}:</strong>{" "}
            {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="chat-form">
        <input
          type="text"
          value={input}
          placeholder="Ask something..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatPage;
