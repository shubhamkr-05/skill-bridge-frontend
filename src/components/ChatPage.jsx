
import React, { useEffect, useState, useContext, useRef, useLayoutEffect } from "react";
// Format time for chat messages (e.g., 10:30 PM)
function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
import socket from "../socket";
import api from "../api/axios";
import { AuthContext } from "../AuthContext";
import { Paperclip, X, Send, Loader2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatLoader from "./ChatLoader";
import NotificationsDropdown from "./NotificationsDropdown";


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
    // eslint-disable-next-line
  }, [currentUser]);


  useEffect(() => {
    if (currentChat) {
      setLoading(true);
      fetchMessages(currentChat).finally(() => setLoading(false));
    }
  }, [currentChat]);


  // Always scroll to bottom on chat open or new message
  useLayoutEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [currentChat, messages, loading]);


  const fetchContacts = async () => {
    try {
      const res = await api.get("/chats/contacts");
      setContacts(res.data.data);
    } catch (e) {
      console.error('Error fetching contacts', e);
      setContacts([]);
    }
  };


  const fetchChats = async () => {
    try {
      const res = await api.get("/chats/chats");
      setChats(res.data.data);
    } catch (e) {
      console.error('Error fetching chats', e);
      setChats([]);
    }
  };


  const fetchMessages = async (chat) => {
    try {
      const res = await api.get(`/chats/messages/${chat._id}`);
      setMessages(res.data.data);
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
        // Remove only the matching temp message from self
        const updated = prev.filter((m) => !(m.temp && m.sender._id === currentUser._id && m.message === newMessage));
        return [...updated, res.data.data];
      });
    } catch (err) {
      console.error('Error sending message', err);
    }
    setNewMessage("");
    setFile(null);
    setSending(false);
  };


  const handleIncomingMessage = (data) => {
    const from = data.from;
    const newMsg = {
      message: data.message,
      sender: { _id: from },
      createdAt: data.createdAt || new Date(),
      fileUrl: data.fileUrl || null,
    };
    if (currentChat && from === getOther(currentChat)._id) {
      setMessages((prev) => {
        // Remove any temp message from self with same content (for sent messages)
        const filtered = prev.filter(
          (m) => !(m.temp && m.sender._id === currentUser._id && m.message === data.message)
        );
        return [...filtered, newMsg];
      });
      markAsSeen(currentChat);
    } else {
      setUnread((prev) => ({ ...prev, [from]: (prev[from] || 0) + 1 }));
      // Optionally: show toast/notification
    }
    // Debug incoming message
    console.log('Received message', data);
  };


  const handleTypingEvent = (fromId) => {
    if (currentChat && fromId === getOther(currentChat)._id) {
      setTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(false), 1500);
    }
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col md:flex-row bg-[#ece5dd]">
      {/* Sidebar Drawer */}
      <div className={`fixed md:static z-30 top-0 left-0 h-full w-4/5 max-w-xs bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 md:translate-x-0 ${mobileSidebar ? "translate-x-0" : "-translate-x-full"} md:w-1/3 md:block max-w-full`}>
        <div className="flex items-center justify-between p-4 border-b bg-[#075e54] text-white sticky top-0">
          <span className="text-xl font-bold">Chats</span>
          <button className="md:hidden" onClick={() => setMobileSidebar(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100dvh-64px)] md:h-[calc(100dvh-64px)] pb-2">
          {contacts.length === 0 && <div className="p-4 text-gray-400">No contacts</div>}
          {contacts.map((c) => {
            const chat = chats.find((chat) => chat.members.some((m) => m._id === c._id));
            return (
              <div
                key={c._id}
                onClick={() => {
                  setCurrentChat(chat);
                  setMobileSidebar(false);
                }}
                className={`p-3 flex justify-between items-center cursor-pointer border-b hover:bg-[#f0f0f0] transition-colors ${
                  currentChat?.members.some((m) => m._id === c._id)
                    ? "bg-[#e1f3fb]"
                    : ""
                } max-w-full`}
                style={{overflow: 'hidden'}}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={c.avatar || "/icon.jpg"}
                    className="w-10 h-10 rounded-full border border-gray-200 flex-shrink-0"
                    alt="avatar"
                  />
                  <div className="min-w-0">
                    <div className="font-medium truncate max-w-[120px]">{c.fullName}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[120px]">
                      {c.lastMessage?.slice(0, 30)}
                    </div>
                  </div>
                </div>
                {unread[c._id] > 0 && (
                  <div className="bg-[#25d366] text-white px-2 py-1 text-xs rounded-full ml-2 flex-shrink-0">
                    {unread[c._id]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-[#ece5dd] relative max-w-full overflow-x-hidden">
        {/* Mobile menu button */}
        <button className="absolute top-4 left-4 md:hidden z-40 bg-[#25d366] text-white p-2 rounded-full shadow" onClick={() => setMobileSidebar(true)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b px-4 py-3 bg-[#075e54] min-h-[64px] sticky top-0 z-20 text-white shadow">
          {currentChat ? (
            <>
              <img
                src={getOther(currentChat).avatar || "/icon.jpg"}
                className="w-10 h-10 rounded-full border border-gray-200"
                alt="avatar"
              />
              <div className="font-semibold text-lg truncate">{getOther(currentChat).fullName}</div>
              {typing && <span className="ml-2 text-xs text-[#25d366]">typing...</span>}
            </>
          ) : (
            <span className="text-gray-200">Select a chat to start messaging</span>
          )}
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-2 py-2 md:p-4 max-w-full" ref={messagesContainerRef} style={{background:'#ece5dd', maxHeight: '100%', minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain'}}>
          {loading ? (
            <ChatLoader />
          ) : (
            <>
              {messages.length === 0 && <div className="text-gray-400 text-center mt-10">No messages yet</div>}
              {messages.map((msg, idx) => {
                const isSelf = msg.sender?._id === currentUser._id;
                const showAvatar = !isSelf && (idx === 0 || messages[idx-1]?.sender?._id !== msg.sender?._id);
                const isLast = idx === messages.length - 1 && isSelf;
                return (
                  <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} w-full`} key={idx}>
                    <div className="max-w-[90vw] md:max-w-[60vw] w-fit">
                      <ChatMessage
                        msg={msg}
                        isSelf={isSelf}
                        showAvatar={showAvatar}
                        avatar={isSelf ? currentUser.avatar : getOther(currentChat)?.avatar}
                        name={isSelf ? currentUser.fullName : getOther(currentChat)?.fullName}
                        time={formatTime(msg.createdAt)}
                        isLast={isLast}
                      />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
        {/* Message input */}
        {currentChat && (
          <form
            className="sticky bottom-0 left-0 right-0 border-t px-2 py-2 flex items-center gap-2 bg-[#f7f7f7] z-30"
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <label className="relative cursor-pointer">
              <Paperclip className="w-5 h-5 text-gray-500" />
              <input
                type="file"
                className="hidden"
                onChange={e => setFile(e.target.files[0])}
                aria-label="Attach file"
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
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#25d366] bg-white"
              onChange={e => {
                setNewMessage(e.target.value);
                clearTimeout(typingTimer.current);
                typingTimer.current = setTimeout(() => {
                  socket.emit("typing", getOther(currentChat)._id);
                }, 400);
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              aria-label="Type a message"
              autoFocus
            />
            <button
              type="submit"
              disabled={sending}
              className="bg-[#25d366] hover:bg-[#128c7e] transition-colors text-white px-5 py-2 rounded-full flex items-center gap-2 disabled:opacity-60"
              aria-label="Send message"
            >
              {sending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}