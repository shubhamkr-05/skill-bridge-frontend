import React, { useEffect, useState, useContext, useRef, useLayoutEffect } from "react";
import socket from "../socket";
import api from "../api/axios";
import { AuthContext } from "../AuthContext";
import { Paperclip, X } from "lucide-react";

export default function ChatPage() {
  const { user } = useContext(AuthContext);
  const currentUser = user;

  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState({});
  const [file, setFile] = useState(null);

  const messagesContainerRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    socket.emit("add-user", currentUser._id);
    fetchContacts();
    fetchChats();

    socket.on("msg-receive", handleIncomingMessage);
    socket.on("typing", handleTypingEvent);

    return () => {
      socket.off("msg-receive", handleIncomingMessage);
      socket.off("typing", handleTypingEvent);
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentChat) {
      fetchMessages(currentChat);
    }
  }, [currentChat]);

  useLayoutEffect(() => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "instant",
    });
  }, [messages]);

  const fetchContacts = async () => {
    const res = await api.get("/chats/contacts");
    setContacts(res.data.data);
  };

  const fetchChats = async () => {
    const res = await api.get("/chats/chats");
    setChats(res.data.data);
  };

  const fetchMessages = async (chat) => {
    const res = await api.get(`/chats/messages/${chat._id}`);
    setMessages(res.data.data);
    markAsSeen(chat);
  };

  const getOther = (chat) =>
    chat.members.find((m) => m._id !== currentUser._id);

  const markAsSeen = (chat) => {
    const otherId = getOther(chat)._id;
    setUnread((prev) => ({ ...prev, [otherId]: 0 }));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !file) return;
    if (!currentChat) return;

    const recipient = getOther(currentChat);
    const formData = new FormData();
    formData.append("chatId", currentChat._id);
    formData.append("message", newMessage);
    if (file) formData.append("file", file);

    const tempMsg = {
      message: newMessage,
      sender: { _id: currentUser._id },
      createdAt: new Date(),
      fileUrl: file ? URL.createObjectURL(file) : null,
      temp: true,
    };
    setMessages((prev) => [...prev, tempMsg]);

    socket.emit("send-msg", {
      to: recipient._id,
      from: currentUser._id,
      message: newMessage,
    });

    try {
      const res = await api.post("/chats/message", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessages((prev) => {
        const updated = prev.filter((m) => !m.temp);
        return [...updated, res.data.data];
      });
    } catch (err) {
      console.error("Failed to send message", err);
    }

    setNewMessage("");
    setFile(null);
  };

  const handleIncomingMessage = (data) => {
    const from = data.from;
    const newMsg = {
      message: data.message,
      sender: { _id: from },
      createdAt: new Date(),
      fileUrl: data.fileUrl || null,
    };

    if (currentChat && from === getOther(currentChat)._id) {
      setMessages((prev) => [...prev, newMsg]);
      markAsSeen(currentChat);
    } else {
      setUnread((prev) => ({ ...prev, [from]: (prev[from] || 0) + 1 }));
    }
  };

  const handleTypingEvent = (fromId) => {
    if (currentChat && fromId === getOther(currentChat)._id) {
      setTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(false), 1500);
    }
  };

  const renderContent = (msg) => {
    const isImage = /\.(jpe?g|png|gif|webp)$/i.test(msg.fileUrl || "");
    if (msg.fileUrl) {
      return (
        <>
          {isImage ? (
            <img
              src={msg.fileUrl}
              alt="Sent"
              className="max-h-52 rounded-lg mb-1"
            />
          ) : (
            <a
              href={msg.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              📎 View File
            </a>
          )}
          {msg.message && <div className="mt-1">{msg.message}</div>}
        </>
      );
    }
    return <div>{msg.message}</div>;
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-[90vh] mt-16">
      {/* Contact Sidebar */}
      <div className="w-1/3 bg-gray-100 border-r overflow-y-auto">
        <div className="p-4 text-xl font-bold border-b">Contacts</div>
        {contacts.map((c) => (
          <div
            key={c._id}
            onClick={() =>
              setCurrentChat(
                chats.find((chat) =>
                  chat.members.some((m) => m._id === c._id)
                )
              )
            }
            className={`p-4 flex justify-between items-center cursor-pointer border-b hover:bg-green-100 ${
              currentChat?.members.some((m) => m._id === c._id)
                ? "bg-green-200"
                : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src={c.avatar || "/default-avatar.png"}
                className="w-10 h-10 rounded-full"
                alt=""
              />
              <div>
                <div className="font-medium">{c.fullName}</div>
                <div className="text-xs text-gray-500">
                  {c.lastMessage?.slice(0, 20)}
                </div>
              </div>
            </div>
            {unread[c._id] > 0 && (
              <div className="bg-red-500 text-white px-2 py-1 text-xs rounded-full">
                {unread[c._id]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef}>
          {messages.map((msg, idx) => {
            const isSelf = msg.sender?._id === currentUser._id;
            return (
              <div
                key={idx}
                className={`mb-3 flex ${isSelf ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`${
                    isSelf ? "bg-green-500 text-white" : "bg-gray-200 text-black"
                  } p-3 rounded-2xl max-w-[75%] text-sm whitespace-pre-wrap`}
                >
                  {renderContent(msg)}
                  <div className="text-[10px] text-right mt-1 text-gray-300">
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {typing && (
          <div className="px-4 py-1 text-sm text-gray-500">Typing...</div>
        )}

        {currentChat && (
          <div className="border-t p-3 flex items-center gap-2">
            <label className="relative cursor-pointer">
              <Paperclip className="w-5 h-5 text-gray-500" />
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
              {file && (
                <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs p-1 rounded-full flex items-center">
                  <span className="mr-1">{file.name.slice(0, 10)}...</span>
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFile(null)}
                  />
                </div>
              )}
            </label>

            <input
              type="text"
              value={newMessage}
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-4 py-2"
              onChange={(e) => {
                setNewMessage(e.target.value);
                clearTimeout(typingTimer.current);
                typingTimer.current = setTimeout(() => {
                  socket.emit("typing", getOther(currentChat)._id);
                }, 400);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <button
              onClick={handleSendMessage}
              className="bg-green-600 text-white px-5 py-2 rounded-full"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
