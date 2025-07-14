import React, { useEffect, useState, useContext, useRef } from "react";
import socket from "../socket";
import api from "../api/axios";
import { AuthContext } from "../AuthContext";
import { Paperclip } from "lucide-react";

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const currentUser = user?.data?.user;

  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState({});
  const [file, setFile] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // ========== Initial Data Fetch ==========
  useEffect(() => {
    if (!currentUser) return;
    socket.emit("add-user", currentUser._id);
    fetchContacts();
    fetchChats();
  }, [currentUser]);

  const fetchContacts = async () => {
    const res = await api.get("/chats/contacts");
    setContacts(res.data.data);
  };

  const fetchChats = async () => {
    const res = await api.get("/chats/chats");
    setChats(res.data.data);
  };

  const fetchMessages = async (chatId) => {
    const res = await api.get(`/chats/messages/${chatId}`);
    setMessages(res.data.data);
    scrollToBottom();
  };

  // ========== Scroll ==========
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // ========== Send Message ==========
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !file) return;

    try {
      let res;
      const recipient = currentChat?.members?.find((m) => m._id !== currentUser._id);

      if (file) {
        // 🔥 EMIT FILE SENDING EVENT
        socket.emit("sending-file", {
          to: recipient._id,
          from: currentUser._id,
        });

        const formData = new FormData();
        formData.append("chatId", currentChat._id);
        formData.append("message", newMessage);
        formData.append("file", file);

        res = await api.post("/chats/messages", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        res = await api.post("/chats/messages", {
          chatId: currentChat._id,
          message: newMessage,
        });
      }

      // Emit message after file or text
      if (recipient) {
        socket.emit("send-msg", {
          to: recipient._id,
          from: currentUser._id,
          message: newMessage,
        });
      }

      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage("");
      setFile(null);
      scrollToBottom();
    } catch (err) {
      console.error("Message send failed", err);
    }
  };


  // ========== Key Press ==========
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ========== Socket Listeners ==========
  useEffect(() => {
    socket.off("msg-receive").on("msg-receive", (data) => {
      if (
        currentChat &&
        data.from === currentChat.members.find((m) => m._id !== currentUser._id)?._id
      ) {
        setMessages((prev) => [
          ...prev,
          { message: data.message, sender: { _id: data.from }, createdAt: new Date() },
        ]);
        scrollToBottom();
      } else {
        setUnread((prev) => ({ ...prev, [data.from]: (prev[data.from] || 0) + 1 }));
      }
    });

    socket.off("typing").on("typing", (fromId) => {
      if (
        currentChat &&
        fromId === currentChat.members.find((m) => m._id !== currentUser._id)?._id
      ) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1500);
      }
    });
  }, [currentChat, currentUser]);

  // ========== Handle Contact Click ==========
  const handleContactClick = async (contact) => {
    let existingChat = chats.find((c) => c.members.some((m) => m._id === contact._id));

    if (!existingChat) {
      const res = await api.post("/chats/create", { recipientId: contact._id });
      existingChat = res.data.data;
      setChats((prev) => [...prev, existingChat]);
    }

    setCurrentChat(existingChat);
    setUnread((prev) => ({ ...prev, [contact._id]: 0 }));
    await fetchMessages(existingChat._id);
  };

  // ========== Format Time ==========
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessageContent = (msg) => {
    if (msg.fileUrl) {
      const isImage = /\.(jpg|jpeg|png|gif)$/i.test(msg.fileUrl);
      return isImage ? (
        <img src={msg.fileUrl} alt="attachment" className="mt-2 max-h-60 rounded-lg" />
      ) : (
        <a
          href={msg.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-blue-600 underline block"
        >
          📎 Download Attachment
        </a>
      );
    }
    return <div>{msg.message}</div>;
  };

  return (
    <div className="flex flex-col md:flex-row h-[90vh] mt-16">
      {/* Contacts */}
      <div className="w-full md:w-1/3 border-r overflow-y-auto bg-gray-100">
        <div className="p-4 font-bold text-xl border-b">Contacts</div>
        {contacts.map((contact) => {
          const chat = chats.find((c) => c.members.some((m) => m._id === contact._id));
          const lastMessage = chat?.lastMessage || "";
          return (
            <div
              key={contact._id}
              className={`p-4 cursor-pointer border-b hover:bg-green-100 flex items-center justify-between ${
                currentChat?.members.some((m) => m._id === contact._id) ? "bg-green-200" : ""
              }`}
              onClick={() => handleContactClick(contact)}
            >
              <div className="flex items-center gap-2">
                <img
                  src={contact.avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex flex-col">
                  <span className="font-medium">{contact.fullName}</span>
                  {unread[contact._id] > 0 ? (
                    <span className="text-sm text-green-600">New messages</span>
                  ) : (
                    <span className="text-xs text-gray-500">{lastMessage?.slice(0, 20)}</span>
                  )}
                </div>
              </div>
              {unread[contact._id] > 0 && (
                <span className="text-sm bg-red-500 text-white px-2 py-1 rounded-full">
                  {unread[contact._id]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Chat Window */}
      <div className="w-full md:w-2/3 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, idx) => {
            const isSentByCurrentUser =
              msg.sender === currentUser._id || msg.sender?._id === currentUser._id;
            return (
              <div
                key={idx}
                className={`mb-4 flex ${isSentByCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[70%] p-3 rounded-2xl shadow text-sm whitespace-pre-wrap ${
                    isSentByCurrentUser ? "bg-green-500 text-white" : "bg-gray-200 text-black"
                  }`}
                >
                  {renderMessageContent(msg)}
                  <div className="text-[10px] text-right text-gray-600 mt-1">
                    {msg.createdAt ? formatTime(msg.createdAt) : ""}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {typing && (
          <div className="text-sm text-gray-500 px-4 pb-2">Typing...</div>
        )}

        {currentChat && (
          <div className="p-4 border-t flex gap-2 items-center">
            <label className="cursor-pointer">
              <Paperclip className="w-5 h-5 text-gray-500" />
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            <input
              type="text"
              className="flex-1 border rounded-2xl px-4 py-2"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                const recipient = currentChat.members.find((m) => m._id !== currentUser._id);

                if (typingTimeout.current) clearTimeout(typingTimeout.current);

                typingTimeout.current = setTimeout(() => {
                  socket.emit("typing", recipient._id);
                }, 400);
              }}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
            />

            <button
              onClick={handleSendMessage}
              className="bg-green-600 text-white px-4 py-2 rounded-2xl shadow"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
