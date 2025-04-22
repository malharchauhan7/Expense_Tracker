import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import {
  FiSend,
  FiMessageSquare,
  FiX,
  FiInfo,
  FiPlusCircle,
  FiZap,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);
    setShowTips(false);

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        text: userMessage,
        sender: "user",
        timestamp: new Date(),
      },
    ]);

    try {
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        setMessages((prev) => [
          ...prev,
          {
            text: "Error: User ID not found. Please log in again.",
            sender: "bot",
            isError: true,
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
        return;
      }

      console.log("Sending request with userId:", userId);
      const response = await axios.post(
        "http://localhost:8000/api/chatbot/process",
        {
          message: userMessage,
          userId: userId,
        }
      );

      console.log("Response received:", response.data);

      // Add bot response to chat
      setMessages((prev) => [
        ...prev,
        {
          text: response.data.message,
          sender: "bot",
          isError: response.data.error ? true : false,
          details:
            response.data.transactionDetails ||
            response.data.budgetDetails ||
            null,
          timestamp: new Date(),
        },
      ]);

      // Refresh transactions if needed
      if (response.data.transactionCreated) {
        // This will trigger a refresh in parent component if provided
        if (typeof window.refreshTransactions === "function") {
          window.refreshTransactions();
        }
      }

      // Refresh budgets if needed
      if (response.data.budgetCreated) {
        // This will trigger a refresh in parent component if provided
        if (typeof window.refreshBudgets === "function") {
          window.refreshBudgets();
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);

      // Extract error message from response if available
      let errorMessage =
        "Sorry, I encountered an error processing your message. Please try again.";
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = `Error: ${error.response.data.detail}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          text: errorMessage,
          sender: "bot",
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);

    // Show welcome message when chat is opened and no messages exist
    if (!isChatOpen && messages.length === 0) {
      setMessages([
        {
          text:
            "👋 Hi there! I'm your ExpenseMate Assistant. I can help you add transactions, create budgets, and manage your finances. How can I help you today?",
          sender: "bot",
          isError: false,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const examplePhrases = [
    // Expense examples
    "I spent $50 on Groceries",
    "I spent $75 on Entertainment on April 15",
    "$25 for Coffee on Monday",
    // Income examples
    "I earned $1000 in Salary yesterday",
    "Received $500 in Freelance income",
    "Got $2000 income for Consulting",
    // Budget examples
    "Create budget of $1000 for May",
    "Set budget of $500 for Groceries from May 1 to May 31",
    "Add budget of $300 for Entertainment for June",
  ];

  // Try an example phrase
  const tryExamplePhrase = (phrase) => {
    setInputMessage(phrase);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setShowTips(true);
  };

  // Helper function to check if a message indicates a new category was created
  const wasNewCategoryCreated = (message) => {
    return (
      message.text &&
      message.text.includes("Created new") &&
      message.sender === "bot"
    );
  };

  // Helper function to format timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageDate = new Date(timestamp);

    // If the message is from today, just show time
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // If it's from yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === messageDate.toDateString()) {
      return `Yesterday, ${messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Otherwise, show date and time
    return (
      messageDate.toLocaleDateString([], { month: "short", day: "numeric" }) +
      ", " +
      messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      <motion.button
        onClick={toggleChat}
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        whileHover={{
          scale: 1.05,
          boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)",
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: isChatOpen ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {isChatOpen ? (
          <FiX className="h-6 w-6" />
        ) : (
          <FiMessageSquare className="h-6 w-6" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-16 right-0 w-[90vw] sm:w-96 md:w-[420px] lg:w-[450px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 relative overflow-hidden">
              <div className="flex justify-between items-center relative z-10">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FiMessageSquare className="h-5 w-5" />
                  <span>ExpenseMate Assistant</span>
                </h3>
                {messages.length > 0 && (
                  <motion.button
                    onClick={resetChat}
                    whileHover={{ scale: 1.05, backgroundColor: "#1e40af" }}
                    whileTap={{ scale: 0.95 }}
                    className="text-white text-xs bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-full"
                  >
                    New Chat
                  </motion.button>
                )}
              </div>
              <p className="text-xs mt-1 text-blue-100">
                I can help you add transactions and budgets quickly
              </p>
              {/* Abstract decorative elements */}
              <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-blue-500/30 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-indigo-500/20 blur-lg"></div>
            </div>

            <div className="p-5 h-[450px] md:h-[500px] flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 pr-2 custom-scrollbar">
                <AnimatePresence>
                  {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`mb-4 ${
                          message.sender === "user"
                            ? "flex justify-end"
                            : "flex justify-start"
                        }`}
                      >
                        <div
                          className={`p-3.5 rounded-2xl max-w-[85%] shadow-sm ${
                            message.sender === "user"
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none"
                              : message.isError
                              ? "bg-red-50 text-red-800 rounded-tl-none border border-red-100"
                              : "bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100"
                          }`}
                        >
                          {/* Message timestamp */}
                          {message.timestamp && (
                            <div
                              className={`text-[10px] ${
                                message.sender === "user"
                                  ? "text-blue-100"
                                  : "text-gray-400"
                              } mb-1`}
                            >
                              {formatMessageTime(message.timestamp)}
                            </div>
                          )}

                          {/* Check if message indicates a new category was created */}
                          {wasNewCategoryCreated(message) ? (
                            <div>
                              <div className="mb-2 flex items-center">
                                <span className="mr-2">
                                  {message.text.split("Created new")[0]}
                                </span>
                              </div>
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className="p-2 bg-green-50 rounded-md border border-green-200 text-sm flex items-center"
                              >
                                <FiPlusCircle className="text-green-500 mr-2" />
                                <span className="text-green-800">
                                  Created new{" "}
                                  {
                                    message.text
                                      .split("Created new '")[1]
                                      .split("'")[0]
                                  }{" "}
                                  category
                                </span>
                              </motion.div>
                            </div>
                          ) : (
                            <span>{message.text}</span>
                          )}

                          {/* Check if message has transaction details */}
                          {message.details && message.details.type && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="mt-2.5"
                            >
                              <div className="text-xs bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                                <div className="font-semibold mb-2 text-blue-700 flex items-center">
                                  <FiDollarSign className="mr-1.5" />{" "}
                                  Transaction Details
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                  <span className="text-gray-600">Amount:</span>
                                  <span
                                    className={`font-medium ${
                                      message.details.type === "Expense"
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    $
                                    {parseFloat(message.details.amount).toFixed(
                                      2
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                  <span className="text-gray-600">Type:</span>
                                  <span
                                    className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                                      message.details.type === "Expense"
                                        ? "bg-red-50 text-red-600"
                                        : "bg-green-50 text-green-600"
                                    }`}
                                  >
                                    {message.details.type}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                  <span className="text-gray-600">
                                    Category:
                                  </span>
                                  <span className="font-medium">
                                    {message.details.category}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                  <span className="text-gray-600">Date:</span>
                                  <span className="font-medium flex items-center">
                                    <FiCalendar
                                      className="mr-1 text-blue-400"
                                      size={12}
                                    />
                                    {formatMessageTime(message.details.date)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-gray-100 mt-1">
                                  <span className="text-gray-600">
                                    Balance:
                                  </span>
                                  <span
                                    className={`font-medium ${
                                      message.details.balance >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    ${message.details.balance.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* Check if message has budget details */}
                          {message.details && message.details.title && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="mt-2.5"
                            >
                              <div className="text-xs bg-white rounded-xl p-3 border border-blue-100 shadow-sm">
                                <div className="font-semibold mb-2 text-blue-700 flex items-center">
                                  <FiZap className="mr-1.5" /> Budget Created
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                  <span className="text-gray-600">Title:</span>
                                  <span className="font-medium">
                                    {message.details.title}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                  <span className="text-gray-600">Amount:</span>
                                  <span className="font-medium text-blue-600">
                                    $
                                    {parseFloat(message.details.amount).toFixed(
                                      2
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                  <span className="text-gray-600">Period:</span>
                                  <span className="font-medium text-xs">
                                    {formatMessageTime(
                                      message.details.start_date
                                    )}{" "}
                                    to{" "}
                                    {formatMessageTime(
                                      message.details.end_date
                                    )}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : showTips ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mb-4 border border-blue-100"
                    >
                      <div className="flex items-start mb-3">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <FiInfo className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800">
                            How to use
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            I can help you add transactions, create budgets, and
                            manage categories. Try saying:
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2.5">
                        {examplePhrases.map((phrase, index) => (
                          <motion.button
                            key={index}
                            whileHover={{
                              scale: 1.02,
                              backgroundColor: "#EEF2FF",
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => tryExamplePhrase(phrase)}
                            className="w-full text-left text-sm bg-white p-3 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors shadow-sm"
                          >
                            "{phrase}"
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start mb-3"
                  >
                    <div className="bg-gray-100 p-3.5 rounded-lg rounded-tl-none">
                      <div className="flex space-x-2">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: 0,
                          }}
                          className="w-2 h-2 bg-blue-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: 0.2,
                          }}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: 0.4,
                          }}
                          className="w-2 h-2 bg-blue-600 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <motion.form
                onSubmit={handleSendMessage}
                className="flex gap-2 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3.5 pl-5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  disabled={isLoading}
                />
                <motion.button
                  type="submit"
                  className={`rounded-full p-3.5 flex items-center justify-center shadow-sm ${
                    isLoading || !inputMessage.trim()
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  }`}
                  disabled={isLoading || !inputMessage.trim()}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiSend className="h-5 w-5 text-white" />
                </motion.button>
              </motion.form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
