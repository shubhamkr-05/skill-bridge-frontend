import React, { useEffect, useState, useContext, useRef, useLayoutEffect } from "react";
import { Paperclip, X, Send, Loader2, Menu, Phone, Video, MoreVertical, Search } from "lucide-react";
import socket from "../socket";
import api from "../api/axios";
import { AuthContext } from "../AuthContext";

// Format time for chat messages (e.g., 10:30 PM)
function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Format last seen time
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
  return `last seen ${days}d ago`;
}

// Chat Loader Component
function ChatLoader() {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-[#25d366] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-[#25d366] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-[#25d366] rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}

// FIXED: ChatMessage Component
// Removed `isLast` prop and the entire tick system logic.
function ChatMessage({ msg, isSelf, showAvatar, avatar, name, time }) {
  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"} mb-1 items-end w-full group`}>
      {!isSelf && showAvatar && (
        <img
          src={avatar || "/icon.jpg"}
          alt="avatar"
          className="w-8 h-8 rounded-full mr-2 border border-gray-300 flex-shrink-0"
        />
      )}
      <div className={`relative px-4 py-2 rounded-2xl shadow-sm max-w-[85vw] sm:max-w-[70vw] md:max-w-[60vw] break-words transition-all duration-200 hover:shadow-md ${
        isSelf
          ? "bg-[#dcf8c6] text-black rounded-br-md ml-8"
          : "bg-white text-black rounded-bl-md border border-gray-100 mr-8"
      }`}
        style={{ wordBreak: 'break-word' }}
      >
        {msg.fileUrl && /\.(jpe?g|png|gif|webp)$/i.test(msg.fileUrl) ? (
          <img src={msg.fileUrl} alt="Sent" className="max-h-48 rounded-lg mb-2 w-full object-cover" />
        ) : msg.fileUrl ? (
          <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="text-[#25d366] underline block mb-2 flex items-center">
            <Paperclip className="w-4 h-4 mr-1" />
            View File
          </a>
        ) : null}
        {msg.message && (
          <div className="whitespace-pre-wrap break-words leading-relaxed">
            {msg.message}
          </div>
        )}
        <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1 justify-end">
          <span>{time}</span>
          {/* Tick system has been completely removed from here */}
        </div>
      </div>
    </div>
  );
}

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
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const messagesContainerRef = useRef(null);
  const typingTimer = useRef(null);
  const fileInputRef = useRef(null);

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
    // eslint-disable-next-line
  }, [currentUser, currentChat]); // Added currentChat dependency

  useEffect(() => {
    if (currentChat) {
      setLoading(true);
      fetchMessages(currentChat).finally(() => setLoading(false));
    }
  }, [currentChat]);

  useLayoutEffect(() => {
    if (messagesContainerRef.current) {
      const scrollToBottom = () => {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      };
      
      if (loading) return;
      
      scrollToBottom();
      setTimeout(scrollToBottom, 50);
      setTimeout(scrollToBottom, 200);
    }
  }, [messages, loading]); // Simplified dependency array

  const fetchContacts = async () => {
    try {
      const res = await api.get("/chats/contacts");
      setContacts(res.data.data || []);
    } catch (e) {
      console.error('Error fetching contacts', e);
      setContacts([]);
    }
  };

  const fetchChats = async () => {
    try {
      const res = await api.get("/chats/chats");
      setChats(res.data.data || []);
    } catch (e) {
      console.error('Error fetching chats', e);
      setChats([]);
    }
  };

  const fetchMessages = async (chat) => {
    try {
      const res = await api.get(`/chats/messages/${chat._id}`);
      setMessages(res.data.data || []);
      markAsSeen(chat);
    } catch (e) {
      console.error('Error fetching messages', e);
      setMessages([]);
    }
  };

  const getOther = (chat) => {
    if (!chat || !chat.members) return {};
    return chat.members.find((m) => m._id !== currentUser._id) || {};
  };

  const markAsSeen = (chat) => {
    const other = getOther(chat);
    if (!other._id) return;
    setUnread((prev) => ({ ...prev, [other._id]: 0 }));
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !file) || !currentChat || sending) return;
    setSending(true);
    const recipient = getOther(currentChat);
    if (!recipient._id) {
      setSending(false);
      return;
    }
    
    const messageText = newMessage.trim();
    const messageFile = file;
    
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      message: messageText,
      sender: { _id: currentUser._id },
      createdAt: new Date(),
      fileUrl: messageFile ? URL.createObjectURL(messageFile) : null,
      temp: true,
    };
    
    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");
    setFile(null);

    const formData = new FormData();
    formData.append("chatId", currentChat._id);
    formData.append("message", messageText);
    if (messageFile) formData.append("file", messageFile);

    socket.emit("send-msg", {
      to: recipient._id,
      from: currentUser._id,
      message: messageText,
    });

    try {
      // NOTE: The inability to send PDFs is a BACKEND issue.
      // Your server's file upload middleware (e.g., Multer) needs to be
      // configured to accept file types like 'application/pdf'.
      const res = await api.post("/chats/message", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setMessages((prev) => {
        const updated = prev.filter((m) => m._id !== tempMsg._id);
        return [...updated, res.data.data];
      });
    } catch (err) {
      console.error('Error sending message', err);
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
    }
    
    setSending(false);
  };

  // FIXED: handleIncomingMessage
  const handleIncomingMessage = (data) => {
    // This guard clause prevents the sender from processing their own message
    // from the socket, fixing the "message on wrong side" bug.
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

  const handleTyping = () => {
    if (!currentChat) return;
    const recipient = getOther(currentChat);
    if (!recipient._id) return;
    
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
      <div className="w-full h-screen flex items-center justify-center bg-[#f0f2f5]">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <div className="text-xl text-gray-600">Please login to continue</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex bg-[#f0f2f5] overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed md:static z-50 top-0 left-0 h-full w-full max-w-sm bg-white shadow-xl transition-transform duration-300 md:translate-x-0 ${
        mobileSidebar ? "translate-x-0" : "-translate-x-full"
      } md:w-80 md:border-r border-gray-200`}>
        
        {/* Sidebar Header */}
        <div className="bg-[#00a884] p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <img
                src={currentUser.avatar || "/icon.jpg"}
                className="w-10 h-10 rounded-full border-2 border-white/20 object-cover"
                alt="Profile"
              />
              <span className="font-medium">Chats</span>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
              <button 
                className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
                onClick={() => setMobileSidebar(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:bg-white/30 transition-colors"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="overflow-y-auto h-[calc(100vh-140px)]">
          {filteredContacts.map((contact) => {
            const chat = chats.find((chat) => chat.members?.some((m) => m._id === contact._id));
            return (
              <div
                key={contact._id}
                onClick={() => {
                  if (chat) {
                    setCurrentChat(chat);
                  }
                  setMobileSidebar(false);
                }}
                className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  currentChat?._id === chat?._id ? "bg-[#f0f2f5]" : ""
                }`}
              >
                <div className="relative">
                  <img
                    src={contact.avatar || "/icon.jpg"}
                    className="w-12 h-12 rounded-full object-cover"
                    alt={contact.fullName || "Contact"}
                  />
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#25d366] rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {contact.fullName || "Unknown Contact"}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(contact.lastSeen)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate max-w-[200px]">
                      {contact.lastMessage?.slice(0, 30) || "No messages yet"}
                    </p>
                    {unread[contact._id] > 0 && (
                      <div className="bg-[#25d366] text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                        {unread[contact._id]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#efeae2] relative">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#f0f2f5] border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  className="md:hidden p-2 hover:bg-gray-200 rounded-full transition-colors"
                  onClick={() => setMobileSidebar(true)}
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="relative">
                  <img
                    src={getOther(currentChat).avatar || "/icon.jpg"}
                    className="w-10 h-10 rounded-full object-cover"
                    alt={getOther(currentChat).fullName}
                  />
                  {getOther(currentChat).online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#25d366] rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {getOther(currentChat).fullName || "Unknown Contact"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {typing ? (
                      <span className="text-[#25d366]">typing...</span>
                    ) : (
                      formatLastSeen(getOther(currentChat).lastSeen)
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors"><Phone className="w-5 h-5 text-gray-600" /></button>
                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors"><Video className="w-5 h-5 text-gray-600" /></button>
                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors"><MoreVertical className="w-5 h-5 text-gray-600" /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
              ref={messagesContainerRef}
              style={{ backgroundImage: `url('/bg-chat-tile-dark.png')` }}
            >
              {loading ? <ChatLoader /> : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="text-6xl mb-4">💬</div>
                  <div className="text-lg font-medium mb-2">No messages yet</div>
                  <div className="text-sm">Start a conversation with {getOther(currentChat).fullName || "this contact"}</div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isSelf = msg.sender?._id === currentUser._id;
                  const showAvatar = !isSelf && (idx === 0 || messages[idx-1]?.sender?._id !== msg.sender?._id);
                  // The `isLast` variable is no longer needed and has been removed.
                  return (
                    <ChatMessage
                      key={msg._id || idx}
                      msg={msg}
                      isSelf={isSelf}
                      showAvatar={showAvatar}
                      avatar={isSelf ? currentUser.avatar : getOther(currentChat).avatar}
                      name={isSelf ? currentUser.fullName : getOther(currentChat).fullName}
                      time={formatTime(msg.createdAt)}
                    />
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div className="bg-[#f0f2f5] border-t border-gray-200 p-4">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-3">
                <div className="relative">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 hover:bg-gray-200 rounded-full transition-colors">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} aria-label="Attach file" />
                  {file && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setFile(null)} />
                    </div>
                  )}
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#25d366] focus:border-transparent transition-all"
                    autoFocus
                    aria-label="Type a message"
                  />
                  {file && (
                    <div className="absolute top-1 left-4 bg-[#25d366] text-white px-2 py-1 rounded text-xs">
                      📎 {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                    </div>
                  )}
                </div>
                <button type="submit" disabled={(!newMessage.trim() && !file) || sending} className="p-3 bg-[#25d366] hover:bg-[#128c7e] disabled:bg-gray-400 text-white rounded-full transition-colors disabled:cursor-not-allowed" aria-label="Send message">
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <button className="md:hidden absolute top-4 left-4 p-3 bg-[#25d366] text-white rounded-full shadow-lg" onClick={() => setMobileSidebar(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-8xl mb-6">💬</div>
            <h1 className="text-3xl font-light text-gray-800 mb-4">WhatsApp Web</h1>
            <p className="text-gray-600 max-w-md leading-relaxed">
              Send and receive messages without keeping your phone online. Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}