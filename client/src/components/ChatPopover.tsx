import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from "@/hooks/useAuth";
import {
  MessageSquare,
  Send,
  X,
  Globe,
  Lock,
  ArrowLeft,
  Maximize2,
} from "lucide-react";

let chatSocket: any = null;

interface ChatPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatPopover: React.FC<ChatPopoverProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuthState();
  const navigate = useNavigate();

  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch groups
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    const fetchGroups = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/groups`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setGroups(res.data);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      }
    };

    fetchGroups();
  }, [isOpen, isAuthenticated]);

  // Socket connection for selected group
  useEffect(() => {
    if (!selectedGroup || !user || !isAuthenticated) return;

    // Disconnect previous socket
    if (chatSocket) {
      chatSocket.disconnect();
    }

    chatSocket = io(`${import.meta.env.VITE_API_URL}`);

    chatSocket.emit("joinGroup", {
      groupId: selectedGroup._id,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });

    chatSocket.on("groupMessages", (msgs: any[]) => {
      const normalized = msgs.map((msg) => ({
        ...msg,
        sender: {
          _id: msg.sender?._id || "unknown",
          username: msg.sender?.username || "Unknown",
        },
      }));
      setMessages(normalized);
    });

    chatSocket.on("activeUsers", setActiveUsers);

    chatSocket.on("newMessage", ({ message }: any) => {
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          sender: {
            _id: message.sender?._id || "unknown",
            username: message.sender?.username || "Unknown",
          },
        },
      ]);
    });

    return () => {
      if (chatSocket) {
        chatSocket.off("groupMessages");
        chatSocket.off("activeUsers");
        chatSocket.off("newMessage");
        chatSocket.disconnect();
        chatSocket = null;
      }
    };
  }, [selectedGroup, user, isAuthenticated]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedGroup(null);
      setMessages([]);
      setNewMessage("");
      if (chatSocket) {
        chatSocket.disconnect();
        chatSocket = null;
      }
    }
  }, [isOpen]);

  const sendMessage = () => {
    if (!newMessage.trim() || !user || !chatSocket) return;

    chatSocket.emit("sendMessage", {
      groupId: selectedGroup._id,
      sender: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
      text: newMessage,
    });

    setNewMessage("");
  };

  const handleOpenFullPage = () => {
    if (selectedGroup) {
      navigate(`/community/${selectedGroup._id}`);
    } else {
      navigate("/community");
    }
    onClose();
  };

  if (!isOpen) return null;

  // Filter groups the user is a member of
  const myGroups = groups.filter(
    (g) =>
      Array.isArray(g.members) &&
      g.members.some((m: any) => {
        if (typeof m === "string") return m === user?._id;
        return m?._id === user?._id;
      })
  );

  return (
    <div className="fixed top-16 right-16 z-[100] w-[420px] h-[520px] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          {selectedGroup && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setSelectedGroup(null);
                setMessages([]);
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">
            {selectedGroup ? selectedGroup.name : "Messages"}
          </span>
          {selectedGroup && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {activeUsers.length} online
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleOpenFullPage}
            title="Open full page"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      {!selectedGroup ? (
        /* ── Group List ── */
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {myGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs mt-1">
                  Join a group in{" "}
                  <button
                    className="text-primary underline"
                    onClick={handleOpenFullPage}
                  >
                    Community
                  </button>
                </p>
              </div>
            ) : (
              myGroups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => setSelectedGroup(group)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/80 transition-colors text-left group"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/icons/svg?seed=${group.name}`}
                    />
                    <AvatarFallback className="text-xs">
                      {group.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{group.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      {group.type === "private" ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Globe className="w-3 h-3" />
                      )}
                      {group.type} · {group.members?.length || 0} members
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      ) : (
        /* ── Chat View ── */
        <>
          <ScrollArea className="flex-1 px-3 pt-2">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-16">
                <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isOwn = msg.sender?._id === user?._id;
                const msgDate = new Date(msg.createdAt);

                return (
                  <div
                    key={idx}
                    className={`flex mb-2 ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOwn && (
                      <Avatar className="h-6 w-6 mr-1.5 mt-1 shrink-0">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.username}`}
                        />
                        <AvatarFallback className="text-[10px]">
                          {msg.sender?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] px-3 py-1.5 rounded-xl text-sm ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-[10px] font-semibold opacity-70 mb-0.5">
                          {msg.sender.username}
                        </p>
                      )}
                      <p className="break-words">{msg.text}</p>
                      <p
                        className={`text-[9px] mt-0.5 ${
                          isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                        }`}
                      >
                        {msgDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Message Input */}
          <div className="p-2 border-t flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="h-9 text-sm"
            />
            <Button
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPopover;
