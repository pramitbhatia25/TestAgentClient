import "./index.css";
import { useState, useRef, useEffect } from "react";
import brLogo from "../assets/br.png";
// import { GoogleLogin } from '@react-oauth/google';
import { User, Settings, CreditCard, LogOut, ChevronLeft, Linkedin, Calendar } from "lucide-react";

export default function UpdatedNavbar({ /* user, loading, handleLogout, handleSuccess, handleError, */ isCollapsed, setIsCollapsed, setSelectedEnvironment }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const modalRef = useRef(null);

  const profileMenuItems = [
    { label: "Profile", icon: <User size={13} /> },
    { label: "Settings", icon: <Settings size={13} /> },
    { label: "Upgrade Plan", icon: <CreditCard size={13} /> },
    { label: "Sign Out", icon: <LogOut size={13} /> },
  ];

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`h-[50px] border-b border-gray-900 w-full bg-black flex flex-row items-center pr-4`}>
      <div className={`flex flex-row items-center h-full border-r border-gray-900 ${isCollapsed ? 'w-[60px]' : 'w-[200px]'}`}>
        {isCollapsed ? (
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-[25px] hover:opacity-80 transition-opacity ml-4 cursor-pointer"
            title="Expand sidebar"
          >
            <img src={brLogo} alt="Bullrun Logo" className="h-[25px]" />
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between w-full px-4">
              <div 
                className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedEnvironment("Home")}
              >
                <div className="flex items-center justify-center w-[25px]">
                  <img src={brLogo} alt="Bullrun Logo" className="h-[25px]" />
                </div>
                <div className="text-white font-bold ml-2 transition-all duration-300">
                  BULLRUN
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="flex items-center gap-2 px-2 py-1 text-xs border border-gray-700 hover:bg-gray-700 ml-2 rounded-md transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft size={13} />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center ml-4 flex-grow justify-between">
        {/* User authentication section commented out
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white text-sm">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-xs border border-gray-700 hover:bg-gray-700 rounded-md transition-colors h-[28px]"
              >
                <span>Sign Out</span>
              </button>
            </div>
          </>
        ) : (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            hosted_domain="bullrun.ai"
            theme="filled_black"
            shape="pill"
            size="medium"
            text="signin_with"
            locale="en"
          />
        )}
        */}
        <div className="flex items-center gap-2">
          <a
            href="https://www.linkedin.com/company/bullrunai/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-xs border border-gray-700 hover:bg-gray-700 rounded-md transition-colors h-[28px]"
          >
            <Linkedin size={13} />
            LinkedIn
          </a>
          <a
            href="https://calendly.com/prashanthkonda/bullrun"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-xs border border-gray-700 hover:bg-gray-700 rounded-md transition-colors h-[28px]"
          >
            <Calendar size={13} />
            <span>Book Meeting</span>
          </a>
        </div>
      </div>
    </div>
  );
}