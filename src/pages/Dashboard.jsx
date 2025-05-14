import { useState, useEffect } from "react";
import UpdatedNavbar from "../components/UpdatedNavbar";
import Sidebar from "../components/Sidebar";
import Chat from "./ChatHome";
import ChatFundamentals from "./ChatFundamentals";
import ChatEarnings from "./ChatEarnings";
import ChatNews from "./ChatNews";
import { GoogleOAuthProvider } from '@react-oauth/google';
import ChatCongressTransactions from "./ChatCongressTransactions";
import Agents from "./Agents";
import Pricing from "./Pricing";
import TC from "./TC";

function Dashboard() {
  const [selectedEnvironment, setSelectedEnvironment] = useState("Home");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInChat, setIsInChat] = useState(false);
  const [currentMessages, setCurrentMessages] = useState([]);

  useEffect(() => {
    const checkSession = () => {
      const sessionData = localStorage.getItem('userSession');
      if (sessionData) {
        const { userData, expiry } = JSON.parse(sessionData);
        if (new Date().getTime() < expiry) {
          setUser(userData);
        } else {
          // Session expired
          handleLogout();
        }
      }
    };

    checkSession();
    // Check session every minute
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSuccess = (credentialResponse) => {
    setLoading(true);
    try {
      // Decode the JWT token to get user information
      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      console.log(decoded);
      
      // Set user with the decoded information
      const userData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        sub: decoded.sub // Google's unique user ID
      };
      
      // Store user session in localStorage with 1 hour expiry
      const expiry = new Date().getTime() + (60 * 60 * 1000); // 1 hour from now
      localStorage.setItem('userSession', JSON.stringify({
        userData,
        expiry
      }));
      
      setUser(userData);
    } catch (error) {
      console.error('Error decoding token:', error);
      handleError();
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  const handleLogout = () => {
    setUser(null);
    // Clear session data
    localStorage.removeItem('userSession');
  };

  // Handler for creating a new chat
  const handleCreateChat = async (firstMessage) => {
    try {
      // Create initial messages array with first message
      const initialMessages = [{ 
        user: firstMessage, 
        response: "", 
        time: new Date(),
        loading: true // Add loading state
      }];
      
      setCurrentMessages(initialMessages);
      setIsInChat(true);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Handler for updating messages in chat
  const handleUpdateMessages = (updatedMessages) => {
    setCurrentMessages(updatedMessages);
  };

  // Add a function to render the appropriate chat component
  const renderChatComponent = () => {
    switch (selectedEnvironment) {
      case "Home":
        return (
          <Chat
            messages={currentMessages}
            updateMessages={handleUpdateMessages}
            initialMessage={currentMessages[0]?.user}
            onSendMessage={handleCreateChat}
            setSelectedEnvironment={setSelectedEnvironment}
          />
        );
      case "Fundamentals":
        return (
          <ChatFundamentals
            messages={currentMessages}
            updateMessages={handleUpdateMessages}
            initialMessage={currentMessages[0]?.user}
            onSendMessage={handleCreateChat}
          />
        );
      case "Earnings Calendar":
        return (
          <ChatEarnings />
        );
      case "News":
        return (
          <ChatNews />
        );
      case "Congress Transactions":
        return (
          <ChatCongressTransactions
            messages={currentMessages}
            updateMessages={handleUpdateMessages}
            initialMessage={currentMessages[0]?.user}
            onSendMessage={handleCreateChat}
          />
        );
      case "Agents":
        return <Agents />;
      case "Pricing":
        return <Pricing />;
      case "Terms":
        return <TC />;
      // Add other cases for different environments
      default:
        return (
          <Chat
            messages={currentMessages}
            updateMessages={handleUpdateMessages}
            initialMessage={currentMessages[0]?.user}
            onSendMessage={handleCreateChat}
          />
        );
    }
  };

  return (
    <GoogleOAuthProvider clientId="1074530580599-4cuksjmclvrhg3jq4ththg7pjuas709i.apps.googleusercontent.com">
      <div className="h-[100dvh] w-[100dvw] overflow-hidden">
        <div className="h-[50px] w-full overflow-hidden flex items-center">
          <UpdatedNavbar 
            user={user}
            loading={loading}
            handleLogout={handleLogout}
            handleSuccess={handleSuccess}
            handleError={handleError}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            setSelectedEnvironment={setSelectedEnvironment}
          />
        </div>
        <div className="w-full h-[calc(100dvh-50px)] overflow-auto flex">
          {/* Hide sidebar on mobile, show on md and up */}
          <div className={`hidden md:block h-full bg-black border-r border-gray-900 transition-all duration-300 ${isSidebarCollapsed ? 'w-[60px]' : 'w-[200px]'}`}>
            <Sidebar
              selectedEnvironment={selectedEnvironment}
              setSelectedEnvironment={setSelectedEnvironment}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
            />
          </div>
          {/* Full width on mobile, flex-1 on md and up */}
          <div className="w-full md:flex-1 bg-black p-4 overflow-auto z-50">
            {renderChatComponent()}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Dashboard;
