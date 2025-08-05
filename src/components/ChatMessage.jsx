import React from "react";

export default function ChatMessage({ msg, isSelf, showAvatar, avatar, name, time, isLast }) {
  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"} mb-1 items-end w-full`}>
      {!isSelf && showAvatar && (
        <img
          src={avatar || "/icon.jpg"}
          alt="avatar"
          className="w-8 h-8 rounded-full mr-2 border border-gray-300 hidden xs:block"
        />
      )}
      <div className={`relative px-3 py-2 rounded-2xl shadow-sm max-w-[85vw] md:max-w-[60vw] break-words ${
        isSelf
          ? "bg-[#dcf8c6] text-black rounded-br-md"
          : "bg-white text-black rounded-bl-md border border-gray-200"
      }`}
        style={{ wordBreak: 'break-word' }}
      >
        {msg.fileUrl && /\.(jpe?g|png|gif|webp)$/i.test(msg.fileUrl) ? (
          <img src={msg.fileUrl} alt="Sent" className="max-h-40 rounded mb-1" />
        ) : msg.fileUrl ? (
          <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline block mb-1">📎 View File</a>
        ) : null}
        {msg.message && <div className="whitespace-pre-wrap break-words">{msg.message}</div>}
        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1 justify-end">
          <span>{time}</span>
          {isSelf && (
            <span className="ml-1">
              {/* Double tick for seen, single for sent */}
              {isLast ? (
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="inline align-middle"><path d="M7 13l3 3 7-7" stroke="#34b7f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 11l4 4 7-7" stroke="#34b7f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="inline align-middle"><path d="M3 11l4 4 7-7" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </span>
          )}
        </div>
      </div>
      {isSelf && showAvatar && (
        <img
          src={avatar || "/icon.jpg"}
          alt="avatar"
          className="w-8 h-8 rounded-full ml-2 border border-gray-300 hidden xs:block"
        />
      )}
    </div>
  );
}
