import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Input, Button, Spin, Empty, Badge } from 'antd';
import { SendOutlined, UserOutlined, MessageOutlined, CheckOutlined, CheckCircleOutlined } from '@ant-design/icons';
import socketService from '../services/socketService.js';
import '../componentcss/chat.css';
import axios from "axios";

const { TextArea } = Input;

function ChatApp() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);
  const isVendor = currentUser?.roll === 'vendor';
  const isRetailer = currentUser?.roll === 'retailer';

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (currentUser?._id) {
      let currentSocket = socketService.getSocket();
      if (!currentSocket || !socketService.isSocketConnected()) {
        console.log('Initializing new socket connection for user:', currentUser._id);
        currentSocket = socketService.connect(currentUser._id, currentUser.roll);
      } else {
        console.log('Reusing existing socket connection for user:', currentUser._id);
      }
      setSocket(currentSocket);

      const handleGetOnlineUsers = (users) => {
        console.log('Online users updated:', users);
        console.log("currentuser",currentUser._id);
        setOnlineUsers(new Set(users));
      };

      if (currentSocket) {
        currentSocket.on('getOnlineUsers', handleGetOnlineUsers);
      }

      return () => {
        if (currentSocket) {
          currentSocket.off('getOnlineUsers', handleGetOnlineUsers);
        }
      };
    }
  }, [currentUser]);

  useEffect(() => {
    const currentSocket = socketService.getSocket();

    if (currentSocket && currentChat) {
      console.log('Setting up chat-specific listeners for chat ID:', currentChat._id);

      const handleNewMessage = (message) => {
        console.log('Received new message:', message);
        if (message.chatId === currentChat._id) {
          setMessages(prevMessages => {
            const filteredMessages = prevMessages.filter(msg => {
              return !(
                (message.tempIdToReplace && msg._id === message.tempIdToReplace) || 
                (msg._id === message._id) 
              );
            });
            const definitiveMessage = { ...message, isSending: false };
            console.log("definitiveMessage",definitiveMessage);
            console.log("filteredmessage",filteredMessages);
            const newMessages = [...filteredMessages, definitiveMessage];
            return newMessages;
          });
        }else{

        }
      };

      const handleUserTyping = (data) => {
        if (data.chatId === currentChat._id && data.userId !== currentUser._id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.add(data.userId);
            return newSet;
          });
        }
      };

      const handleUserStoppedTyping = (data) => {
        if (data.chatId === currentChat._id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      };

      currentSocket.on('newMessage', handleNewMessage);
      currentSocket.on('userTyping', handleUserTyping);
      currentSocket.on('userStoppedTyping', handleUserStoppedTyping);

      return () => {
        // console.log('Cleaning up chat-specific listeners for chat ID:', currentChat._id);
        currentSocket.off('newMessage', handleNewMessage);
        currentSocket.off('userTyping', handleUserTyping);
        currentSocket.off('userStoppedTyping', handleUserStoppedTyping);
      };
    }
  }, [socket, currentChat, currentUser?._id]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentUser?._id) {
        console.log('No current user ID found');
        return;
      }

      setLoading(true);
      try {
        let endpoint = '';
        if (isVendor) {
          endpoint = `/Api/Chat/allretailers/${currentUser._id}`;
        } else if (isRetailer) {
          endpoint = `/Api/Chat/allvendors/${currentUser._id}`;
        }
        if (endpoint) {
          const res = await axios.get(endpoint);

          if (res.data) {
            const contactData = isVendor ? res.data.retailers : res.data.vendors;
            setContacts(contactData || []);
          } else {
            console.log('No data in response');
            setContacts([]);
          }
        } else {
          console.log('No endpoint determined');
          setContacts([]);
        }
      } catch (error) {
        console.error('=== ERROR FETCHING CONTACTS ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        setContacts([]);
      } finally {
        setLoading(false);
        console.log('=== CONTACTS FETCH COMPLETE ===');
      }
    };

    fetchContacts();
  }, [currentUser, isVendor, isRetailer]);

  const handleContactSelect = async (contact) => {
    setSelectedContact(contact);
    setChatLoading(true);
    setMessages([]);
    console.log("onlineuser",onlineUsers);
    console.log("currentuser",currentUser._id);

    try {
      const retailerId = isVendor ? contact._id : currentUser._id;
      const vendorId = isVendor ? currentUser._id : contact._id;

      const chatRes = await axios.get(`/Api/Chat/${retailerId}/${vendorId}`);
      const chat = chatRes.data;
      setCurrentChat(chat);

      const currentSocket = socketService.getSocket();
      if (currentSocket && chat?._id) {
        currentSocket.emit('joinChat', chat._id);
        currentSocket.emit()
        console.log(`Socket ${currentSocket.id} joined chat room: ${chat._id}`);
      }

      const messagesRes = await axios.get(`/Api/Chat/${chat._id}/message`);
      setMessages(messagesRes.data || []);
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChat || !socket) return;

    const currentSocket = socketService.getSocket();

    const messageDataToSend = {
      chatId: currentChat._id,
      senderType: currentUser.roll,
      senderId: currentUser._id,
      text: newMessage.trim(),
      recipientId: selectedContact._id
    };

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const tempMessage = {
      ...messageDataToSend,
      _id: tempId,
      timestamp: new Date().toISOString(),
      seen: false,
      isSending: true
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const res = await axios.post('/Api/Chat/message', messageDataToSend);
      const actualMessage = res.data;

      currentSocket.emit('sendMessage', { ...actualMessage, tempIdToReplace: tempId });

      setIsTyping(false);
      clearTimeout(window.typingTimeout);
      if (currentSocket && currentChat) {
        currentSocket.emit('stopTyping', { chatId: currentChat._id, userId: currentUser._id });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setNewMessage(tempMessage.text);
    }
  };

  const handleTyping = (e) => {
    const text = e.target.value;
    setNewMessage(text);
    const currentSocket = socketService.getSocket();
    if (!currentSocket || !currentChat) return;

    const currentlyTyping = isTyping;
    const willBeTyping = text.length > 0;

    if (!currentlyTyping && willBeTyping) {
      setIsTyping(true);
      currentSocket.emit('typing', { chatId: currentChat._id, userId: currentUser._id });
    } else if (currentlyTyping && !willBeTyping) {
      setIsTyping(false);
      currentSocket.emit('stopTyping', { chatId: currentChat._id, userId: currentUser._id });
    }

    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      if (currentSocket && currentChat && isTyping) {
        setIsTyping(false);
        currentSocket.emit('stopTyping', { chatId: currentChat._id, userId: currentUser._id });
      }
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLastMessagePreview = (contact) => {
    return "Click to start chatting";
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex">
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-green-500 text-white">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <MessageOutlined />
            {isVendor ? 'My Retailers' : 'My Vendors'}
          </h1>
          <p className="text-sm opacity-90">Select a contact to start chatting</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Spin size="large" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <Empty description="No contacts found" />
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact._id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedContact?._id === contact._id ? 'bg-green-100 border-l-4 border-l-green-500' : ''
                }`}
                onClick={() => handleContactSelect(contact)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar
                      src={contact.profilePicture}
                      size={48}
                      icon={<UserOutlined />}
                      className="border-2 border-gray-200"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      isUserOnline(contact._id) ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {contact.username}
                      </h3>
                      {isUserOnline(contact._id) && (
                        <span className="text-xs text-green-500">• online</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {contact.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {getLastMessagePreview(contact)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedContact ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3">
              <Avatar
                src={selectedContact.profilePicture}
                size={40}
                icon={<UserOutlined />}
              />
              <div>
                <h2 className="font-semibold text-gray-900">
                  {selectedContact.username}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedContact.email}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Spin size="large" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  <Empty description="No messages yet. Start the conversation!" />
                </div>
              ) : (
                messages.map((message) => (
                  <div
                   key={message._id}
                    className={`flex ${message.senderId === currentUser._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === currentUser._id
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p
                          className={`text-xs ${
                            message.senderId === currentUser._id
                              ? 'text-green-100'
                              : 'text-gray-400'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                        {message.senderId === currentUser._id && (
                          <div className="flex items-center gap-1">
                            {message.isSending ? (
                              <Spin size="small" className="text-green-100" />
                            ) : (
                              <>
                                <CheckOutlined className="text-xs text-green-100" />
                                {message.seen && (
                                  <CheckCircleOutlined className="text-xs text-green-100" />
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-500 px-4 py-2 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs">
                        {Array.from(typingUsers).map(id => {
                          const user = contacts.find(c => c._id === id);
                          return user ? user.username : 'Someone';
                        }).join(', ')} is typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <TextArea
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  className="flex-1"
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-green-500 border-green-500 hover:bg-green-600"
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageOutlined className="text-6xl text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                Welcome to Chat
              </h2>
              <p className="text-gray-500">
                Select a contact from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatApp;