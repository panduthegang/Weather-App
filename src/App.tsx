import React, { useState, useEffect, useRef } from 'react';
import { Cloud, MessageCircle, Send, Bot, User, Sun, Moon, Plus, ThumbsUp, ThumbsDown, Copy, Download, Check, FileText, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }

    // Load saved sessions
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        const sessionsWithDates = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSessions(sessionsWithDates);
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    // Save sessions to localStorage whenever sessions change
    if (sessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Weather Chat',
      messages: [],
      createdAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    setSidebarOpen(false);
  };

  const selectSession = (session: ChatSession) => {
    setCurrentSession(session);
    setSidebarOpen(false);
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentSession && currentSession.id === sessionId) {
      setCurrentSession(null);
    }
  };

  const exportSessionToPDF = async (session: ChatSession) => {
    if (session.messages.length === 0) return;

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      // Set up the document
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      
      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Weather Chat Export', margin, yPosition);
      yPosition += 15;
      
      // Session info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Session: ${session.title}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Date: ${session.createdAt.toLocaleDateString()} ${session.createdAt.toLocaleTimeString()}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Messages: ${session.messages.length}`, margin, yPosition);
      yPosition += 20;
      
      // Messages
      session.messages.forEach((message, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Message header
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        const role = message.role === 'user' ? 'You' : 'Weather Assistant';
        const time = formatTime(message.timestamp);
        pdf.text(`${role} - ${time}`, margin, yPosition);
        yPosition += 8;
        
        // Message content
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        // Split text to fit within margins
        const lines = pdf.splitTextToSize(message.content, maxWidth);
        
        // Check if content fits on current page
        const contentHeight = lines.length * 5;
        if (yPosition + contentHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Add content with proper line spacing
        lines.forEach((line: string) => {
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });
        
        yPosition += 10; // Space between messages
      });
      
      // Footer on last page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Made by Harsh Rathod - Page ${i} of ${totalPages}`, margin, pageHeight - 10);
      }
      
      // Save the PDF
      const fileName = `weather-chat-${session.createdAt.toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };
  const updateSession = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            messages,
            title: messages.length > 0 ? generateTitle(messages[0].content) : 'New Weather Chat'
          }
        : session
    ));
    
    if (currentSession && currentSession.id === sessionId) {
      setCurrentSession(prev => prev ? {
        ...prev,
        messages,
        title: messages.length > 0 ? generateTitle(messages[0].content) : 'New Weather Chat'
      } : null);
    }
  };

  const generateTitle = (firstMessage: string): string => {
    const words = firstMessage.split(' ').slice(0, 4);
    return words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '');
  };

  const extractLocation = (message: string): string | null => {
    const words = message.toLowerCase().split(' ');
    const locationWords = ['in', 'at', 'for', 'weather', 'from', 'of'];
    
    const commonCities = [
      'tokyo', 'london', 'paris', 'new york', 'los angeles', 'chicago', 'houston', 'phoenix',
      'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville',
      'fort worth', 'columbus', 'charlotte', 'san francisco', 'indianapolis', 'seattle', 'denver',
      'washington', 'boston', 'el paso', 'nashville', 'detroit', 'oklahoma city', 'portland',
      'las vegas', 'memphis', 'louisville', 'baltimore', 'milwaukee', 'albuquerque', 'tucson',
      'fresno', 'sacramento', 'mesa', 'kansas city', 'atlanta', 'long beach', 'colorado springs',
      'raleigh', 'miami', 'virginia beach', 'omaha', 'oakland', 'minneapolis', 'tulsa', 'arlington',
      'tampa', 'new orleans', 'wichita', 'cleveland', 'bakersfield', 'aurora', 'anaheim', 'honolulu',
      'santa ana', 'corpus christi', 'riverside', 'lexington', 'stockton', 'toledo', 'st. paul',
      'newark', 'greensboro', 'plano', 'henderson', 'lincoln', 'buffalo', 'jersey city', 'chula vista',
      'fort wayne', 'orlando', 'st. petersburg', 'chandler', 'laredo', 'norfolk', 'durham', 'madison',
      'lubbock', 'irvine', 'winston-salem', 'glendale', 'garland', 'hialeah', 'reno', 'chesapeake',
      'gilbert', 'baton rouge', 'irving', 'scottsdale', 'north las vegas', 'fremont', 'boise',
      'richmond', 'san bernardino', 'birmingham', 'spokane', 'rochester', 'des moines', 'modesto',
      'fayetteville', 'tacoma', 'oxnard', 'fontana', 'montgomery', 'moreno valley', 'shreveport',
      'yonkers', 'akron', 'huntington beach', 'little rock', 'augusta', 'amarillo', 'mobile',
      'grand rapids', 'salt lake city', 'tallahassee', 'huntsville', 'grand prairie', 'knoxville',
      'worcester', 'newport news', 'brownsville', 'overland park', 'santa clarita', 'providence',
      'garden grove', 'chattanooga', 'oceanside', 'jackson', 'fort lauderdale', 'santa rosa',
      'rancho cucamonga', 'port st. lucie', 'tempe', 'ontario', 'vancouver', 'cape coral',
      'sioux falls', 'springfield', 'peoria', 'pembroke pines', 'elk grove', 'salem', 'lancaster',
      'corona', 'eugene', 'palmdale', 'salinas', 'pasadena', 'fort collins', 'hayward', 'pomona',
      'cary', 'rockford', 'alexandria', 'escondido', 'mckinney', 'joliet', 'sunnyvale'
    ];
    
    const messageText = message.toLowerCase();
    for (const city of commonCities) {
      if (messageText.includes(city)) {
        return city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
    }
    
    for (let i = 0; i < words.length; i++) {
      if (locationWords.includes(words[i]) && i + 1 < words.length) {
        let location = words[i + 1];
        if (i + 2 < words.length && words[i + 2].length > 2 && !['?', '.', '!'].includes(words[i + 2])) {
          location += ' ' + words[i + 2];
        }
        return location.charAt(0).toUpperCase() + location.slice(1);
      }
    }
    
    return null;
  };

  const getWeatherData = async (location: string): Promise<string> => {
    const url = "https://millions-screeching-vultur.mastra.cloud/api/agents/weatherAgent/stream";
    
    const weatherQuery = `What's the weather in ${location}?`;
    console.log('Sending weather query:', weatherQuery);
    
    const payload = {
      messages: [
        {
          role: "user",
          content: weatherQuery
        }
      ],
      runId: "weatherAgent",
      maxRetries: 2,
      maxSteps: 5,
      temperature: 0.5,
      topP: 1,
      runtimeContext: {},
      threadId: "22-AI&DSB14-26",
      resourceId: "weatherAgent"
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-mastra-dev-playground': 'true',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      let fullResponse = '';
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value);
        }
      }

      return fullResponse.trim();
    } catch (error) {
      console.error('Weather API error:', error);
      throw new Error('Failed to fetch weather data');
    }
  };

  const generateAIResponse = async (userMessage: string, weatherData?: string): Promise<string> => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    let prompt = `You are a helpful weather assistant chatbot. The user asked: "${userMessage}"\n\n`;
    
    if (weatherData) {
      prompt += `Weather data from API: ${weatherData}\n\n`;
      prompt += `Please analyze this weather data carefully. If the data is only for one location (like London) but the user asked about a different location, please acknowledge this limitation and provide the available data while explaining that you only have information for the location mentioned in the data. Be honest about what information you have available.\n\nProvide a concise, helpful response about the weather. Summarize the weather data in a user-friendly way.`;
    } else {
      prompt += `Please provide a helpful response. If this is a weather query, ask the user to specify a location for weather information.`;
    }
    
    prompt += `\n\nKeep the response conversational and helpful.`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t generate a response.';
    } catch (error) {
      console.error('Gemini AI error:', error);
      throw new Error('Failed to generate AI response');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...currentSession.messages, userMessage];
    updateSession(currentSession.id, updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      let weatherData: string | undefined;
      let aiResponse: string;

      const weatherKeywords = ['weather', 'temperature', 'forecast', 'rain', 'sunny', 'cloudy', 'climate'];
      const isWeatherQuery = weatherKeywords.some(keyword => 
        userMessage.content.toLowerCase().includes(keyword)
      );

      if (isWeatherQuery) {
        try {
          const location = extractLocation(userMessage.content);
          if (location) {
            console.log('Requesting weather for location:', location);
            weatherData = await getWeatherData(location);
          } else {
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: 'I\'d be happy to help you with weather information! Could you please specify which city or location you\'d like to know about? For example, "What\'s the weather in Tokyo?" or "How\'s the weather in New York?"',
              timestamp: new Date()
            };

            const finalMessages = [...updatedMessages, assistantMessage];
            updateSession(currentSession.id, finalMessages);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Weather API failed:', error);
        }
      }

      try {
        aiResponse = await generateAIResponse(userMessage.content, weatherData);
      } catch (error) {
        console.error('Gemini AI failed:', error);
        if (weatherData) {
          aiResponse = `Here's the weather information I found:\n\n${weatherData}`;
        } else {
          aiResponse = 'Sorry, I\'m having trouble processing your request right now. Please try again later.';
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      updateSession(currentSession.id, finalMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      const errorMessages = [...updatedMessages, errorMessage];
      updateSession(currentSession.id, errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLike = (messageId: string) => {
    if (!currentSession) return;
    
    const updatedMessages = currentSession.messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, liked: !msg.liked, disliked: false }
        : msg
    );
    updateSession(currentSession.id, updatedMessages);
  };

  const handleDislike = (messageId: string) => {
    if (!currentSession) return;
    
    const updatedMessages = currentSession.messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, disliked: !msg.disliked, liked: false }
        : msg
    );
    updateSession(currentSession.id, updatedMessages);
  };

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };


  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="h-screen flex app-container" data-theme={darkMode ? 'dark' : 'light'}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 sidebar-header">
            <div className="flex items-center space-x-2">
              <Cloud className="w-6 h-6 text-blue-500" />
              <h2 className="font-semibold sidebar-title">Weather Chats</h2>
            </div>
            <button
              onClick={createNewSession}
              className="p-2 rounded-lg transition-colors sidebar-button"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-muted">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No chats yet</p>
              </div>
            ) : (
              <div className="p-2 sidebar-scroll overflow-y-auto max-h-full">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`w-full p-3 mb-2 rounded-lg transition-colors session-item ${
                      currentSession?.id === session.id ? 'session-active' : ''
                    }`}
                  >
                    <div 
                      onClick={() => selectSession(session)}
                      className="cursor-pointer flex-1"
                    >
                      <h3 className="font-medium truncate session-title">
                        {session.title}
                      </h3>
                      <p className="text-sm text-muted">
                        {session.messages.length} messages
                      </p>
                      <p className="text-xs text-muted">
                        {session.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportSessionToPDF(session);
                        }}
                        className="p-1.5 rounded-md transition-colors session-action-btn"
                        title="Export to PDF"
                        disabled={session.messages.length === 0}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="p-1.5 rounded-md transition-colors session-action-btn delete-btn"
                        title="Delete chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col main-content main-scroll">
        {/* Header */}
        <header className="chat-header p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg transition-colors sidebar-button"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <Cloud className="w-6 h-6 text-blue-500" />
                <h1 className="text-xl font-semibold main-title">
                  Weather Assistant
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors theme-toggle"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={createNewSession}
                className="hidden sm:flex px-4 py-2 rounded-lg transition-colors items-center space-x-2 new-chat-btn"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            </div>
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {currentSession ? (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto messages-container messages-scroll">
                {currentSession.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4 welcome-screen">
                    <Cloud className="w-20 h-20 text-blue-500 mb-6 opacity-80" />
                    <h3 className="text-2xl font-bold mb-3 welcome-title">
                      Ask me about the weather!
                    </h3>
                    <p className="max-w-md mb-8 text-lg text-muted">
                      I can help you get current weather conditions, forecasts, and weather-related information for any location worldwide.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                      {[
                        "What's the weather in London?",
                        "How's the weather in Tokyo?",
                        "Will it rain in New York?",
                        "Temperature in Paris?"
                      ].map((example) => (
                        <button
                          key={example}
                          onClick={() => setInputMessage(example)}
                          className="p-4 rounded-xl transition-all duration-200 text-sm example-button"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-4 py-4 px-4 min-h-full">
                    {currentSession.messages.map((message) => (
                      <div key={message.id} className="message-wrapper">
                        <div className={`message-item ${message.role}`}>
                          <div className="message-avatar">
                            {message.role === 'user' ? (
                              <User className="w-5 h-5" />
                            ) : (
                              <Bot className="w-5 h-5" />
                            )}
                          </div>
                          
                          <div className="message-content">
                            <div className="message-bubble">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                            </div>
                            
                            {message.role === 'assistant' && (
                              <div className="flex items-center space-x-2 mt-2">
                                <button
                                  onClick={() => handleLike(message.id)}
                                  className={`p-1.5 rounded-lg transition-colors message-action-btn ${
                                    message.liked ? 'liked' : ''
                                  }`}
                                  title="Like this response"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDislike(message.id)}
                                  className={`p-1.5 rounded-lg transition-colors message-action-btn ${
                                    message.disliked ? 'disliked' : ''
                                  }`}
                                  title="Dislike this response"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleCopy(message.content, message.id)}
                                  className="p-1.5 rounded-lg transition-colors message-action-btn copy-btn"
                                  title="Copy response"
                                >
                                  {copiedMessageId === message.id ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            )}
                            
                            <div className="message-time">
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="message-wrapper">
                        <div className="message-item assistant">
                          <div className="message-avatar">
                            <Bot className="w-5 h-5" />
                          </div>
                          <div className="message-content">
                            <div className="message-bubble">
                              <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                <span className="text-sm">Getting weather information...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="input-area p-4">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me about the weather..."
                        className="w-full p-4 pr-14 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors input-field"
                        disabled={isLoading}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="absolute right-2 bottom-2 p-2.5 rounded-xl transition-colors send-button"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs mt-3 text-center text-muted">
                    Press Enter to send • Made by Harsh Rathod
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="text-center">
                <Cloud className="w-24 h-24 text-blue-500 mx-auto mb-6 opacity-80" />
                <h2 className="text-3xl font-bold mb-4 welcome-title">
                  Welcome to Weather Assistant
                </h2>
                <p className="mb-8 text-lg max-w-md mx-auto text-muted">
                  Start a new chat to get real-time weather information and forecasts powered by AI
                </p>
                <button 
                  onClick={createNewSession}
                  className="px-8 py-4 rounded-2xl transition-colors flex items-center space-x-3 mx-auto text-lg font-medium shadow-lg start-chat-btn"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>Start New Chat</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;