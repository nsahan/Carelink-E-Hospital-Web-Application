import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:9000", {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 10000,
  auth: {
    token: localStorage.getItem("token"),
  },
  transports: ["websocket", "polling"],
});

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [groupMessages, setGroupMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("group");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, messageId: null });
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const initialLoadRef = useRef(false);
  const [authError, setAuthError] = useState(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Debounced scroll to prevent excessive scrolling
  const debouncedScroll = useCallback(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [scrollToBottom]);

  useEffect(() => {
    return debouncedScroll();
  }, [groupMessages.length, messages.length, debouncedScroll]);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setAuthError("Please login to continue");
          setLoading(false);
          navigate("/login");
          return;
        }

        // Detailed API call logging
        console.group("User Profile Retrieval");
        console.log("Attempting to fetch user profile...");

        const response = await axios.get("http://localhost:9000/api/chat/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Log full API response
        console.log("Raw API Response:", response);
        console.log("Response Status:", response.status);
        console.log("Response Data:", response.data);
        console.groupEnd();

        // Validate response structure
        if (!response.data || !response.data.success) {
          throw new Error(response.data?.message || "Failed to retrieve user profile");
        }

        const user = response.data.data;

        // Comprehensive validation of user data
        const requiredFields = ['_id', 'name', 'email'];
        const missingFields = requiredFields.filter(field => !user[field]);

        if (missingFields.length > 0) {
          console.error("Missing required user fields:", missingFields);
          toast.error(`Incomplete user profile. Missing: ${missingFields.join(', ')}`, {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#FF6B6B',
              color: 'white',
            }
          });
          setAuthError("Incomplete user profile");
          setLoading(false);
          return;
        }

        // Normalize user data with comprehensive fallbacks
        const normalizedUser = {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          image: user.image || '/default-avatar.png',
          phone: user.phone || '',
          address: user.address || '',
          blood_group: user.blood_group || 'Not Selected',
          height: user.height || 0,
          weight: user.weight || 0,
        };

        // Detailed logging of normalized user
        console.group("Normalized User Profile");
        console.log("Normalized User:", normalizedUser);
        console.log("User ID:", normalizedUser._id);
        console.log("User Name:", normalizedUser.name);
        console.log("User Email:", normalizedUser.email);
        console.groupEnd();

        // Set current user
        setCurrentUser(normalizedUser);
        setLoading(false);

        // Success notification
        toast.success(`Welcome, ${normalizedUser.name}!`, {
          icon: '👋',
          duration: 3000
        });

      } catch (error) {
        // Comprehensive error handling
        console.group("User Profile Error");
        console.error("Detailed Error:", error);
        console.log("Error Response:", error.response);
        console.groupEnd();

        // Set loading and auth error states
        setLoading(false);
        setAuthError("Failed to load user profile");

        // Specific error handling
        if (error.response) {
          // The request was made and the server responded with a status code
          const errorMessage = error.response.data?.message ||
            "Failed to load user profile. Please try again.";

          if (error.response.status === 401) {
            toast.error("Session expired. Please login again.", {
              icon: '⏰',
              duration: 4000
            });
            localStorage.removeItem("token");
            navigate("/login");
          } else {
            toast.error(errorMessage, {
              icon: '❌',
              duration: 4000
            });
          }
        } else if (error.request) {
          // The request was made but no response was received
          toast.error("No response from server. Please check your connection.", {
            icon: '🌐',
            duration: 4000
          });
        } else {
          // Something happened in setting up the request
          toast.error("Error setting up profile request. Please try again.", {
            icon: '⚠️',
            duration: 4000
          });
        }
      }
    };

    loadUserData();
  }, [navigate]);

  // Socket connection handling
  useEffect(() => {
    const handleConnect = () => {
      setSocketConnected(true);
      console.log("Socket connected successfully");
      toast.success("Connected to chat server");
    };

    const handleDisconnect = (reason) => {
      setSocketConnected(false);
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        socket.connect();
      }
      toast.error("Disconnected from chat server");
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
      toast.error("Failed to connect to chat server. Retrying...");
    };

    const handleError = (error) => {
      console.error("Socket error:", error);
      toast.error("Chat server error occurred");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("error", handleError);
    };
  }, []);

  // Message handling
  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      if (newMessage.conversationId === activeChat?._id) {
        setMessages((prev) => {
          if (prev.some((msg) => msg._id === newMessage._id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    };

    const handleGroupMessage = (newMessage) => {
      setGroupMessages((prev) => {
        if (prev.some((msg) => msg._id === newMessage._id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    };

    const handleMessageDeleted = ({ messageId }) => {
      setGroupMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, isDeleted: true, deletedAt: new Date() }
            : msg
        )
      );
    };

    socket.on("message", handleNewMessage);
    socket.on("groupMessage", handleGroupMessage);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("message", handleNewMessage);
      socket.off("groupMessage", handleGroupMessage);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [activeChat?._id]);

  // File handling
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        event.target.value = "";
        setImagePreview(null);
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("File size should be less than 5MB");
        event.target.value = "";
        setImagePreview(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        toast.error("Error reading file");
        setImagePreview(null);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, []);

  // Form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const content = messageContent.trim();
    const fileInput = document.getElementById("imageUpload");
    const file = fileInput?.files[0];

    // Log form data for debugging
    console.log("Form submission attempt:", {
      content,
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
    });

    // Validate inputs
    if (!content && !file) {
      toast.error("Please enter a message or select a file");
      return;
    }

    if (file) {
      // Validate file size and type
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("File size should be less than 5MB");
        fileInput.value = "";
        setImagePreview(null);
        return;
      }
      if (file.size === 0) {
        toast.error("Selected file is empty");
        fileInput.value = "";
        setImagePreview(null);
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        fileInput.value = "";
        setImagePreview(null);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      // Append message only if it exists
      if (content) {
        formData.append("message", content);
      }

      // Append file only if it exists
      if (file) {
        formData.append("file", file);
      }

      // Log FormData contents for debugging
      const formDataEntries = [];
      for (let [key, value] of formData.entries()) {
        formDataEntries.push({ key, value: value.name || value });
      }
      console.log("FormData contents:", formDataEntries);

      // Verify FormData is not empty
      if (formDataEntries.length === 0) {
        throw new Error("FormData is empty");
      }

      const loadingToast = toast.loading(
        file && content
          ? "Sending message with image..."
          : file
            ? "Uploading image..."
            : "Sending message..."
      );

      const response = await axios.post(
        "http://localhost:9000/api/chat/group",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            // Do NOT set Content-Type manually; let axios handle it
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 30000, // Increase timeout to 30 seconds
        }
      );

      toast.dismiss(loadingToast);

      if (response.data.success) {
        setMessageContent("");
        if (fileInput) fileInput.value = "";
        setImagePreview(null);

        if (!socketConnected) {
          setGroupMessages((prev) => [...prev, response.data.data]);
        }

        toast.success(
          file && content
            ? "Message and image sent successfully"
            : file
              ? "Image sent successfully"
              : "Message sent"
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  }, [messageContent, imagePreview, isSubmitting, socketConnected]);

  // Send private message
  const sendMessage = useCallback(async (content) => {
    if (!activeChat || !content.trim()) {
      toast.error("Please select a conversation and enter a message");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:9000/api/chat/messages",
        {
          conversationId: activeChat._id,
          content: content.trim(),
          sender: currentUser._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );

      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.data]);

        if (socketConnected) {
          socket.emit("sendMessage", {
            ...response.data.data,
            conversationId: activeChat._id,
          });
        } else {
          toast.warn("Message sent but real-time updates disabled");
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.message || "Failed to send message");
      }
    } finally {
      setLoading(false);
    }
  }, [activeChat, currentUser?._id, socketConnected, navigate]);

  // Fetch messages
  const fetchMessages = useCallback(
    async (conversationId) => {
      try {
        setLoadingMessages(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          `http://localhost:9000/api/chat/messages/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setMessages(response.data.data || []);
          socket.emit("join", conversationId);
        } else {
          throw new Error(response.data.message || "Failed to load messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again");
          localStorage.removeItem("token");
          navigate("/login");
        } else if (error.response?.status === 403) {
          toast.error("You do not have permission to access these messages");
        } else {
          toast.error(error.response?.data?.message || "Failed to load messages");
        }
      } finally {
        setLoadingMessages(false);
      }
    },
    [navigate]
  );

  // Fetch group messages
  const fetchGroupMessages = useCallback(async () => {
    if (!initialLoadRef.current) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get("http://localhost:9000/api/chat/group", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setGroupMessages(response.data.data || []);
        initialLoadRef.current = true;
      } catch (error) {
        console.error("Error fetching group messages:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
        toast.error("Failed to load group messages");
      } finally {
        setLoading(false);
      }
    }
  }, [navigate]);

  // Load conversations
  const fetchConversations = useCallback(async () => {
    if (!initialLoadRef.current) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          "http://localhost:9000/api/chat/conversations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setConversations(response.data.data || []);
        } else {
          throw new Error(response.data.message || "Failed to load conversations");
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again");
          localStorage.removeItem("token");
          navigate("/login");
        } else if (error.response?.status === 403) {
          toast.error("You do not have permission to access conversations");
        } else {
          toast.error(error.response?.data?.message || "Failed to load conversations");
        }
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (currentUser?._id) {
      fetchConversations();
    }
  }, [currentUser?._id, fetchConversations]);

  useEffect(() => {
    fetchGroupMessages();
  }, [fetchGroupMessages]);

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setActiveChat(conversation);
    fetchMessages(conversation._id);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("file", audioBlob, "voice-message.wav");

        try {
          const response = await axios.post(
            "http://localhost:9000/api/chat/group",
            formData,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (response.data.success) {
            setGroupMessages((prev) => [...prev, response.data.data]);
            toast.success("Voice message sent successfully");
          }
        } catch (error) {
          console.error("Error sending voice message:", error);
          toast.error("Failed to upload voice message");
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !currentUser) {
        toast.error("Please login to delete messages");
        navigate("/login");
        return;
      }

      const messageToDelete = groupMessages.find((msg) => msg._id === messageId);
      if (!messageToDelete) {
        toast.error("Message not found");
        return;
      }

      const senderId = messageToDelete.sender?._id?.toString();
      const userId = currentUser._id?.toString();

      console.log("Delete check: ", {
        messageSender: messageToDelete.sender,
        currentUser: currentUser,
        senderId: senderId,
        userId: userId,
        isOwnMessageCheck: senderId === userId,
        messageCreatedAt: messageToDelete.createdAt,
        currentTime: new Date().toISOString(),
        messageAge: Date.now() - new Date(messageToDelete.createdAt).getTime(),
        timeLimit: 7 * 60 * 1000,
        timeLimitExceeded: (Date.now() - new Date(messageToDelete.createdAt).getTime()) > (7 * 60 * 1000)
      });

      if (senderId !== userId) {
        toast.error("You can only delete your own messages");
        return;
      }

      const loadingToast = toast.loading("Deleting message...");

      const response = await axios.delete(
        `http://localhost:9000/api/chat/group/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.dismiss(loadingToast);

      if (response.data.success) {
        setGroupMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, isDeleted: true } : msg
          )
        );
        toast.success("Message deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      if (error.response?.status === 403) {
        if (error.response.data.message.includes("7 minutes")) {
          toast.error("Messages can only be deleted within 7 minutes of sending");
        } else {
          toast.error("You can only delete your own messages");
        }
      } else {
        toast.error(error.response?.data?.message || "Failed to delete message");
      }
    }
  };

  const toggleMessageSelection = (messageId) => {
    const message = groupMessages.find((msg) => msg._id === messageId);
    if (!message) return;

    const currentTime = new Date().getTime();
    const messageTime = new Date(message.createdAt).getTime();
    const twoDays = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

    // --- FIX: Defensive checks for sender._id and currentUser._id ---
    if (!message.sender || !message.sender._id || !currentUser || !currentUser._id) {
      toast.error("User information is missing. Please refresh or contact support.");
      return;
    }

    const isOwnMessage = message.sender._id.toString() === currentUser._id.toString();

    if (!isOwnMessage) {
      toast.error("You can only delete your own messages");
      return;
    }

    if (currentTime - messageTime > twoDays) {
      toast.error("Messages older than 2 days cannot be deleted");
      return;
    }

    setSelectedMessages((prev) => {
      if (prev.includes(messageId)) {
        return prev.filter((id) => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedMessages.length === 0) {
      toast.error("No message selected");
      return;
    }
    if (!currentUser || !currentUser._id) {
      toast.error("User information is missing. Please refresh or contact support.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete selected messages?")) return;

    const loadingToast = toast.loading(`Deleting ${selectedMessages.length} messages...`);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to delete messages");
        // navigate("/login"); // (if you want to keep this)
        return;
      }

      // Filter out nulls and warn if any selected message is missing
      const messagesToDelete = selectedMessages
        .map((messageId) => groupMessages.find((msg) => msg._id === messageId))
        .filter(Boolean);

      if (messagesToDelete.length !== selectedMessages.length) {
        toast.dismiss(loadingToast);
        toast.error("Some selected messages could not be found.");
        setSelectedMessages([]);
        setIsSelectionMode(false);
        return;
      }

      const currentTime = new Date().getTime();
      const twoDays = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

      const invalidMessages = messagesToDelete.filter((msg) => {
        console.log("Detailed debug before isOwnMessage:", {
          currentMsg: msg,
          currentMsgSender: msg.sender,
          currentMsgSenderId: msg.sender ? msg.sender._id : 'msg.sender is null/undefined',
          currentUserObject: currentUser,
          currentUserId: currentUser ? currentUser._id : 'currentUser is null/undefined',
        });

        // Ensure sender, sender._id, and currentUser exist before accessing properties
        if (!msg.sender || !msg.sender._id || !currentUser || !currentUser._id) {
          console.warn("Skipping message due to missing sender, sender._id, currentUser, or currentUser._id data:", msg);
          return true; // Treat as invalid if essential data is missing
        }

        const messageTime = new Date(msg.createdAt).getTime();
        const timeDiff = currentTime - messageTime;
        const isOwnMessage = msg.sender._id.toString() === currentUser._id.toString();

        return !isOwnMessage || timeDiff > twoDays;
      });

      if (invalidMessages.length > 0) {
        toast.dismiss(loadingToast);
        toast.error(
          `Cannot delete ${invalidMessages.length} messages - either they're too old or not yours`
        );
        return;
      }

      const results = await Promise.allSettled(
        messagesToDelete.map((msg) =>
          axios.delete(`http://localhost:9000/api/chat/group/${msg._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      const successfullyDeletedIds = results
        .map((result, index) =>
          result.status === "fulfilled" ? messagesToDelete[index]._id : null
        )
        .filter(Boolean);

      setGroupMessages((prev) =>
        prev.map((msg) =>
          successfullyDeletedIds.includes(msg._id)
            ? { ...msg, isDeleted: true, deletedAt: new Date() }
            : msg
        )
      );

      toast.dismiss(loadingToast);
      setSelectedMessages([]);
      setIsSelectionMode(false);

      if (successful === messagesToDelete.length) {
        toast.success("All selected messages deleted successfully");
      } else if (successful > 0) {
        toast.success(`Deleted ${successful} messages successfully. ${failed} failed.`);
      } else {
        toast.error("Failed to delete messages");
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Failed to delete messages");
      setSelectedMessages([]);
      setIsSelectionMode(false);
    }
  };

  // --- FIX: Define handleContextMenu before use ---
  const handleContextMenu = useCallback((e, msg) => {
    e.preventDefault();
    // If not in selection mode, select only this message
    if (!isSelectionMode) {
      setSelectedMessages([msg._id]);
      setIsSelectionMode(true);
    } else if (!selectedMessages.includes(msg._id)) {
      // If in selection mode and not already selected, add to selection
      setSelectedMessages((prev) => [...prev, msg._id]);
    }
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      messageId: msg._id,

    });
  }, [isSelectionMode, selectedMessages]);

  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.visible) setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    };
    const handleScroll = () => {
      if (contextMenu.visible) setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    };
    window.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [contextMenu.visible]);

  // --- FIX: Use handleContextMenu in renderGroupMessages ---
  const renderGroupMessages = (msg, index) => {
    // Comprehensive logging for debugging
    console.log("Rendering message:", {
      messageId: msg._id,
      currentUser: currentUser,
      sender: msg.sender,
      messageDetails: {
        senderId: msg.sender?._id,
        senderName: msg.sender?.name,
        senderEmail: msg.sender?.email,
        currentUserId: currentUser?._id,
        currentUserName: currentUser?.name
      }
    });

    // Early return if message or current user is not available
    if (!msg || !currentUser) {
      console.warn("Skipping message rendering due to missing data", { msg, currentUser });
      return null;
    }

    // Defensive checks for sender and current user identification
    const senderId = msg.sender?._id ?
      (typeof msg.sender._id === 'object' ? msg.sender._id.toString() : msg.sender._id)
      : null;
    const userId = currentUser?._id ?
      (typeof currentUser._id === 'object' ? currentUser._id.toString() : currentUser._id)
      : null;

    // Detailed logging of ID comparison
    console.log("ID Comparison:", {
      senderId: senderId,
      userId: userId,
      isCurrentUser: senderId === userId
    });

    const isCurrentUser = senderId === userId;

    const isSelected = selectedMessages.includes(msg._id);
    const canDelete =
      isCurrentUser &&
      !msg.isDeleted &&
      new Date() - new Date(msg.createdAt) <= 2 * 24 * 60 * 60 * 1000; // 2 days

    return (
      <div
        key={`${msg._id || "temp"}-${index}`}
        className={`mb-6 flex w-full ${isCurrentUser ? "justify-end" : "justify-start"}`}
        onContextMenu={(e) => handleContextMenu(e, msg)}
        tabIndex={0}
      >
        <div
          className={`group flex items-end gap-3 max-w-[75%] ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
          onClick={() => isSelectionMode && toggleMessageSelection(msg._id)}
        >
          {!isCurrentUser && (
            <div className="flex-shrink-0 mb-1">
              <div className="relative">
                <img
                  src={msg.sender?.image || "/default-avatar.png"}
                  alt={msg.sender?.name || "User"}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${socketConnected ? "bg-green-400" : "bg-gray-400"
                    }`}
                ></div>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-1">
            <div
              className={`flex items-center gap-2 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {!isCurrentUser && (
                <span className="text-sm font-semibold text-gray-700">
                  {msg.sender?.name || msg.sender?.email || "Unknown User"}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div
              className={`relative rounded-2xl px-4 py-3 shadow-sm ${isCurrentUser
                ? "bg-blue-500 text-white rounded-br-md"
                : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                } transition-all duration-200 hover:shadow-md`}
            >
              {msg.isDeleted ? (
                <p className="italic text-sm opacity-75 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  This message was deleted
                </p>
              ) : (
                <>
                  {msg.messageType === "image" && msg.mediaUrl && (
                    <div className="max-w-xs overflow-hidden rounded-xl mb-2 shadow-sm">
                      <img
                        src={msg.mediaUrl}
                        alt="Shared image"
                        className="w-full h-auto object-contain hover:scale-105 transition-transform duration-200 cursor-pointer"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/image-error-placeholder.png";
                        }}
                        onClick={() => window.open(msg.mediaUrl, "_blank")}
                      />
                    </div>
                  )}
                  {msg.messageType === "voice" && msg.mediaUrl && (
                    <div className="my-2">
                      <audio controls className="max-w-full rounded-lg">
                        <source src={msg.mediaUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  {msg.messageType === "text" && (
                    <p className="break-words whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </p>
                  )}

                  {isCurrentUser && (
                    <div className="flex items-center justify-end mt-1 gap-1">
                      <svg
                        className="w-4 h-4 text-blue-200"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <svg
                        className="w-4 h-4 text-blue-200"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </>
              )}

              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMessage(msg._id);
                  }}
                  className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
                  title="Delete message"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {isCurrentUser && (
            <div className="flex-shrink-0 mb-1">
              <div className="relative">
                <img
                  src={currentUser?.image || "/default-avatar.png"}
                  alt={currentUser?.name || "Me"}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${socketConnected ? "bg-green-400" : "bg-gray-400"
                    }`}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading && !currentUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authError || "Loading chat..."}
          </p>
          {authError && (
            <button
              onClick={() => navigate("/login")}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="pt-20 pb-6">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Professional Chat Hub
            </h1>
            <p className="text-gray-600 text-lg">
              Connect, collaborate, and communicate seamlessly
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 backdrop-blur-sm bg-opacity-95">
            <div className="flex gap-2 border-b border-gray-200">
              <button
                className={`relative pb-4 px-6 font-semibold transition-all duration-300 ${activeTab === "group"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("group")}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                  Public Forum
                </div>
              </button>
              <button
                className={`relative pb-4 px-6 font-semibold transition-all duration-300 ${activeTab === "private"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("private")}
              >
                <div className="flex items-center gap-2">

                
                </div>
              </button>
            </div>
          </div>

          {activeTab === "group" ? (
            <div className="bg-white rounded-2xl shadow-xl backdrop-blur-sm bg-opacity-95 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Public Forum</h2>
                    <p className="text-blue-100">
                      {socketConnected ? (
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          Connected • {groupMessages.length} messages
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          Offline • {groupMessages.length} messages
                        </span>
                      )}
                    </p>
                  </div>

                  {isSelectionMode ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setIsSelectionMode(false);
                          setSelectedMessages([]);
                        }}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      {selectedMessages.length > 0 && (
                        <button
                          onClick={handleDeleteSelected}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-lg"
                        >
                          Delete ({selectedMessages.length})
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsSelectionMode(true)}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                      title="Select Messages"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="h-[600px] overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                {groupMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg
                      className="w-16 h-16 mb-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm">Be the first to start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {groupMessages.map((msg, index) => renderGroupMessages(msg, index))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <div className="border-t bg-white p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {imagePreview && (
                    <div className="relative inline-block group">
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            const fileInput = document.getElementById("imageUpload");
                            if (fileInput) fileInput.value = "";
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-end gap-3">
                    <div className="relative">
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="imageUpload"
                        className={`flex items-center justify-center w-12 h-12 rounded-xl cursor-pointer transition-colors shadow-sm ${imagePreview
                          ? "bg-green-100 hover:bg-green-200 text-green-600"
                          : "bg-blue-100 hover:bg-blue-200 text-blue-600"
                          }`}
                        title="Upload Image"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </label>
                    </div>

                 

                    <div className="flex-1">
                      <textarea
                        name="message"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder={
                          imagePreview
                            ? "Add a message with your image..."
                            : "Type your message here..."
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                        rows="1"
                        style={{ minHeight: "48px", maxHeight: "120px" }}
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height =
                            Math.min(e.target.scrollHeight, 120) + "px";
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && !isSubmitting) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                        disabled={isSubmitting}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || (!messageContent.trim() && !imagePreview)}
                      className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Send Message"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl h-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
                    <h3 className="text-lg font-semibold">Conversations</h3>
                    <p className="text-indigo-100 text-sm">{conversations.length} chats</p>
                  </div>

                  <div className="overflow-y-auto h-full">
                    {loading && conversations.length === 0 ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-gray-500 p-4">
                        <svg
                          className="w-12 h-12 mb-2 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <p className="text-sm text-center">No conversations yet</p>
                      </div>
                    ) : (
                      conversations.map((conversation) => (
                        <div
                          key={conversation._id}
                          onClick={() => handleSelectConversation(conversation)}
                          className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${activeChat?._id === conversation._id
                            ? "bg-blue-50 border-r-4 border-r-blue-500"
                            : ""
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={
                                  conversation.participants?.find(
                                    (p) => p._id !== currentUser._id
                                  )?.image || currentUser?.image || "/default-avatar.png"
                                }
                                alt="User"
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {conversation.participants?.find(
                                  (p) => p._id !== currentUser._id
                                )?.name || conversation.participants?.find(
                                  (p) => p._id !== currentUser._id
                                )?.email || currentUser?.name || "Unknown User"}
                              </h4>
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.lastMessage?.content || "No messages yet"}
                              </p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <div className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                {conversation.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl h-full overflow-hidden flex flex-col">
                  {activeChat ? (
                    <>
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center gap-3">
                        <img
                          src={
                            activeChat.participants?.find(
                              (p) => p._id !== currentUser._id
                            )?.image || "/default-avatar.png"
                          }
                          alt="User"
                          className="w-10 h-10 rounded-full object-cover border-2 border-white"
                        />
                        <div>
                          <h3 className="font-semibold">
                            {activeChat.participants?.find(
                              (p) => p._id !== currentUser._id
                            )?.name || "Unknown User"}
                          </h3>
                          <p className="text-purple-100 text-sm">
                            {socketConnected ? "Online" : "Offline"}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                        {loadingMessages ? (
                          <div className="flex items-center justify-center h-32">
                            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <svg
                              className="w-16 h-16 mb-4 text-gray-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            <p className="text-lg font-medium">Start your conversation</p>
                            <p className="text-sm">Send a message to get started!</p>
                          </div>
                        ) : (
                          <div
                            className={`transition-opacity duration-300 ${loadingMessages ? "opacity-50" : "opacity-100"
                              }`}
                          >
                            {messages.map((msg, index) => (
                              <div
                                key={`${msg._id}-${index}`}
                                className={`mb-4 flex ${msg.sender === currentUser._id
                                  ? "justify-start"
                                  : "justify-end"
                                  }`}
                              >
                                <div
                                  className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender === currentUser._id
                                    ? "bg-gray-200 text-gray-800 rounded-bl-md"
                                    : "bg-purple-500 text-white rounded-br-md"
                                    } shadow-sm`}
                                >
                                  <p className="break-words">{msg.content}</p>
                                  <p className="text-xs mt-1 opacity-75">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      <div className="border-t p-4">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const content = e.target.message.value;
                            if (content.trim()) {
                              sendMessage(content);
                              e.target.message.value = "";
                            }
                          }}
                          className="flex gap-2"
                        >
                          <input
                            name="message"
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                            disabled={loading}
                          />
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                          >
                            {loading ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              "Send"
                            )}
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <svg
                          className="w-20 h-20 mx-auto mb-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <h3 className="text-xl font-medium mb-2">
                          Select a conversation
                        </h3>
                        <p className="text-gray-400">
                          Choose a conversation from the sidebar to start chatting
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu for message delete */}
      {contextMenu.visible && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            padding: "0.5rem 0",
            minWidth: "140px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
            onClick={() => {
              handleDeleteSelected();
              setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
            }}
          >
            Delete Selected Message{selectedMessages.length > 1 ? "s" : ""}
          </button>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .5;
            }
          }
        `,
        }}
      />
    </div>
  );
};

export default ChatPage;