import React, { useEffect, useState, useContext, useRef, useLayoutEffect } from "react";
import { Paperclip, X, Send, Loader2, Menu, Phone, Video, MoreVertical, Search, MessageSquare, AtSign } from "lucide-react";
import socket from "../socket";
import api from "../api/axios";
import { AuthContext } from "../AuthContext";

// --- HELPER FUNCTIONS ---

// Formats time to a simple HH:MM AM/PM format
function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Formats the last seen status with more descriptive text
function formatLastSeen(date) {
  if (!date) return 'last seen recently';
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'online';
  if (minutes < 60) return `last seen ${minutes}m ago`;
  if (hours < 24) return `last seen ${hours}h ago`;
  return `last seen on ${new Date(date).toLocaleDateString()}`;
}


// --- CHILD COMPONENTS ---

// A simple, elegant loader for the chat window
function ChatLoader() {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}

// A welcome screen when no chat is selected
function WelcomeScreen({ onMenuClick }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
            <button className="md:hidden absolute top-4 left-4 p-3 bg-blue-500 text-white rounded-full shadow-lg" onClick={onMenuClick}>
                <Menu className="w-5 h-5" />
            </button>
            <div className="text-8xl mb-6 text-blue-200">
                <MessageSquare size={96} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-light text-gray-800 mb-4">Your Messages</h1>
            <p className="text-gray-600 max-w-md leading-relaxed">
                Select a contact from the sidebar to start a conversation. Your messages are secure and private.
            </p>
        </div>
    );
}

// Renders a single chat message bubble
function ChatMessage({ msg, isSelf, showAvatar, avatar, time }) {
  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"} mb-1 items-end w-full group`}>
      {!isSelf && (
        <img
          src={avatar || "/icon.jpg"}
          alt="avatar"
          className={`w-8 h-8 rounded-full mr-2 border border-gray-300 flex-shrink-0 transition-opacity duration-300 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      <div className={`relative px-4 py-2 rounded-2xl shadow-sm max-w-[85vw] sm:max-w-[70vw] md:max-w-[60vw] break-words transition-all duration-200 hover:shadow-md ${
        isSelf
          ? "bg-blue-500 text-white rounded-br-md ml-10"
          : "bg-white text-black rounded-bl-md border border-gray-100 mr-10"
      }`}>
        {/* File/Image Display */}
        {msg.fileUrl && /\.(jpe?g|png|gif|webp)$/i.test(msg.fileUrl) ? (
          <img src={msg.fileUrl} alt="Sent" className="max-h-56 rounded-lg mb-2 w-full object-cover cursor-pointer" onClick={() => window.open(msg.fileUrl, '_blank')} />
        ) : msg.fileUrl ? (
          <a href={msg.fileUrl} target="_blank" rel="noreferrer" className={`block mb-2 flex items-center ${isSelf ? 'text-blue-200 hover:text-white' : 'text-blue-600 hover:text-blue-800'} underline`}>
            <Paperclip className="w-4 h-4 mr-1" />
            View Document
          </a>
        ) : null}

        {/* Message Text */}
        {msg.message && (
          <div className="whitespace-pre-wrap break-words leading-relaxed">
            {msg.message}
          </div>
        )}

        {/* Time Stamp */}
        <div className={`flex items-center gap-1 text-[11px] mt-1 justify-end ${isSelf ? 'text-blue-200' : 'text-gray-500'}`}>
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}


// --- MAIN CHAT PAGE COMPONENT ---

export default function ChatPage() {
  const { user: currentUser } = useContext(AuthContext);

  // --- STATE MANAGEMENT ---
  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState({});
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- REFS ---
  const messagesContainerRef = useRef(null);
  const typingTimer = useRef(null);
  const fileInputRef = useRef(null);

  // --- EFFECTS ---

  // Initial setup for sockets and data fetching
  useEffect(() => {
    if (!currentUser) return;
    socket.emit("add-user", currentUser._id);
    fetchContacts();
    fetchChats();

    const handleIncomingMessage = (data) => {
      // ** FIX: This guard clause is crucial. **
      // It stops the sender's own message from being processed via socket,
      // preventing it from appearing on the wrong (left) side.
      if (!currentUser || data.from === currentUser._id) {
        return;
      }

      const from = data.from;
      const newMsg = {
        _id: data._id || `socket_${Date.now()}`,
        message: data.message,
        sender: { _id: from },
        createdAt: data.createdAt || new Date(),
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

    socket.on("msg-receive", handleIncomingMessage);
    socket.on("typing", handleTypingEvent);

    return () => {
      socket.off("msg-receive", handleIncomingMessage);
      socket.off("typing", handleTypingEvent);
    };
  }, [currentUser, currentChat]);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (currentChat) {
      setLoading(true);
      fetchMessages(currentChat).finally(() => setLoading(false));
    }
  }, [currentChat]);

  // Auto-scroll to the bottom of the chat
  useLayoutEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // --- DATA FETCHING & HELPERS ---
  
  const getOther = (chat) => {
    if (!chat || !chat.members) return {};
    return chat.members.find((m) => m._id !== currentUser._id) || {};
  };

  const fetchContacts = async () => {
    try {
      const res = await api.get("/chats/contacts");
      setContacts(res.data.data || []);
    } catch (e) { console.error('Error fetching contacts', e); }
  };

  const fetchChats = async () => {
    try {
      const res = await api.get("/chats/chats");
      setChats(res.data.data || []);
    } catch (e) { console.error('Error fetching chats', e); }
  };

  const fetchMessages = async (chat) => {
    try {
      const res = await api.get(`/chats/messages/${chat._id}`);
      setMessages(res.data.data || []);
      markAsSeen(chat);
    } catch (e) { console.error('Error fetching messages', e); }
  };

  const markAsSeen = (chat) => {
    const other = getOther(chat);
    if (!other._id) return;
    setUnread((prev) => ({ ...prev, [other._id]: 0 }));
  };

  // --- EVENT HANDLERS ---

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !file) || !currentChat || sending) return;
    setSending(true);
    
    const recipient = getOther(currentChat);
    if (!recipient._id) { setSending(false); return; }

    // ** FIX: This temporary message is displayed immediately on the RIGHT side. **
    // The `sender._id` is set to the `currentUser._id`, so the `isSelf`
    // check in the ChatMessage component will evaluate to `true`.
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      message: newMessage.trim(),
      sender: { _id: currentUser._id },
      createdAt: new Date(),
      fileUrl: file ? URL.createObjectURL(file) : null,
      temp: true,
    };
    
    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");
    setFile(null);

    const formData = new FormData();
    formData.append("chatId", currentChat._id);
    formData.append("message", newMessage.trim());
    if (file) formData.append("file", file);

    socket.emit("send-msg", {
      to: recipient._id,
      from: currentUser._id,
      message: newMessage.trim(),
    });

    try {
      const res = await api.post("/chats/message", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Replace temporary message with the real one from the server
      setMessages((prev) => prev.map(m => m._id === tempMsg._id ? res.data.data : m));
    } catch (err) {
      console.error('Error sending message', err);
      // Remove the temporary message if the API call fails
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!currentChat) return;
    const recipient = getOther(currentChat);
    if (!recipient._id) return;
    
    // Emit typing event after a short delay to avoid flooding the socket
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing", recipient._id);
    }, 400);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl text-gray-700">Authentication Required</h2>
          <p className="text-gray-500">Please log in to access your messages.</p>
        </div>
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="w-full h-screen flex bg-gray-100 overflow-hidden font-sans">
      {/* Sidebar (Contacts List) */}
      <div className={`fixed md:static z-50 top-0 left-0 h-full w-full max-w-sm bg-white shadow-xl transition-transform duration-300 md:translate-x-0 ${
        mobileSidebar ? "translate-x-0" : "-translate-x-full"
      } md:w-80 lg:w-96 md:border-r border-gray-200 flex flex-col`}>
        
        {/* Sidebar Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img src={currentUser.avatar || "/icon.jpg"} className="w-10 h-10 rounded-full object-cover" alt="Profile"/>
              <span className="font-semibold text-lg text-gray-800">Chats</span>
            </div>
            <div className="flex space-x-1">
              <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
              <button className="md:hidden p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors" onClick={() => setMobileSidebar(false)}><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="overflow-y-auto flex-1">
          {filteredContacts.map((contact) => {
            const chat = chats.find((chat) => chat.members?.some((m) => m._id === contact._id));
            return (
              <div
                key={contact._id}
                onClick={() => {
                  if (chat) { setCurrentChat(chat); }
                  setMobileSidebar(false);
                }}
                className={`p-4 flex items-center space-x-4 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 ${
                  currentChat?._id === chat?._id ? "bg-blue-100" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img src={contact.avatar || "/icon.jpg"} className="w-12 h-12 rounded-full object-cover" alt={contact.fullName}/>
                  {contact.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{contact.fullName}</h3>
                    <span className="text-xs text-gray-500">{formatTime(chat?.lastMessage?.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate max-w-[150px] lg:max-w-[200px]">{chat?.lastMessage?.message || <span className="italic">No messages yet</span>}</p>
                    {unread[contact._id] > 0 && <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] h-6 flex items-center justify-center">{unread[contact._id]}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full" onClick={() => setMobileSidebar(true)}>
                  <Menu className="w-5 h-5" />
                </button>
                <div className="relative">
                  <img src={getOther(currentChat).avatar || "/icon.jpg"} className="w-10 h-10 rounded-full object-cover" alt={getOther(currentChat).fullName}/>
                  {getOther(currentChat).online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{getOther(currentChat).fullName}</h2>
                  <p className="text-sm text-gray-600">
                    {typing ? <span className="text-blue-500 italic">typing...</span> : formatLastSeen(getOther(currentChat).lastSeen)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Phone className="w-5 h-5" /></button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Video className="w-5 h-5" /></button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 space-y-2 bg-cover bg-center" style={{ backgroundImage: `url('/chat-bg.svg')` }}>
              {loading ? <ChatLoader /> : (
                messages.map((msg, idx) => {
                  // ** FIX: This logic correctly determines if the message is from the logged-in user. **
                  const isSelf = msg.sender?._id === currentUser._id;
                  const showAvatar = !isSelf && (idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id);
                  return (
                    <ChatMessage
                      key={msg._id || idx}
                      msg={msg}
                      isSelf={isSelf}
                      showAvatar={showAvatar}
                      avatar={getOther(currentChat).avatar}
                      time={formatTime(msg.createdAt)}
                    />
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-3">
                <div className="relative">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:bg-gray-100 rounded-full">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  {file && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>}
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                    placeholder="Type a message..."
                    className="w-full px-5 py-3 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    autoFocus
                  />
                  {file && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-2">
                      <span>📎 {file.name.substring(0, 15)}...</span>
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setFile(null)} />
                    </div>
                  )}
                </div>
                <button type="submit" disabled={(!newMessage.trim() && !file) || sending} className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full transition-colors disabled:cursor-not-allowed flex-shrink-0">
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <WelcomeScreen onMenuClick={() => setMobileSidebar(true)} />
        )}
      </div>
    </div>
  );
}