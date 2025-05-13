import { Building2, MessageCircle, Upload, RefreshCw, ChevronLeft, ChevronRight, Rss, Search, MessageSquare, Users, FileText, File } from "lucide-react";

function Sidebar({ 
  selectedEnvironment, 
  setSelectedEnvironment, 
  isCollapsed,
  setIsCollapsed
}) {
  // Create environment list
  const environments = [
    {
      label: "Home",
      color: "text-white",
      icon: <Building2 size={13} />,
      type: "section"
    },
    {
      label: "Fundamentals",
      color: "text-white",
      icon: <Search size={13} />,
      type: "section"
    },
    {
      label: "Earnings Calendar",
      color: "text-white",
      icon: <RefreshCw size={13} />,
      type: "section"
    },
    {
      label: "News",
      color: "text-white",
      icon: <Rss size={13} />,
      type: "section"
    },
    {
      label: "Congress Transactions",
      color: "text-white",
      icon: <MessageCircle size={13} />,
      type: "section"
    },
  ];

  return (
    <div className="py-2 relative flex flex-col h-full">
      {/* Scrollable content wrapper */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden pb-4">
        {/* Environment List */}
        <div className="space-y-2 pr-4">
          {environments.map((env, index) => (
            <div key={env.label}>
              <div
                className={`flex justify-between items-center p-1.5 pl-4 cursor-pointer rounded-r-md ${
                  selectedEnvironment === env.label
                    ? "bg-[#35b943]/45 border-l-5 border-[#35b943]"
                    : "hover:bg-[#35b943]/45 hover:text-[#35b943] "
                }`}
                onClick={() => setSelectedEnvironment(env.label)}
                title={isCollapsed ? env.label : ""}
              >
                <span className={`flex items-center gap-2 text-xs ${env.color} whitespace-nowrap`}>
                  {env.icon} 
                  <span className={`transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    {env.label}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

