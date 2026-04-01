import React, { useEffect, useRef } from 'react';
import { 
  FiBell, FiAlertCircle, FiClock, 
  FiMail, FiUser, FiX, FiCheck
} from 'react-icons/fi';

const NotificationsPanel = ({ 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDelete,
  onClose,
  formatTimeAgo 
}) => {
  const scrollRef = useRef(null);

  // Restore scroll position when notifications update
  useEffect(() => {
    if (scrollRef.current) {
      const savedScroll = sessionStorage.getItem('notificationScrollPosition');
      if (savedScroll) {
        scrollRef.current.scrollTop = parseInt(savedScroll);
      }
    }
  }, [notifications]);

  // Save scroll position when scrolling
  const handleScroll = () => {
    if (scrollRef.current) {
      sessionStorage.setItem('notificationScrollPosition', scrollRef.current.scrollTop);
    }
  };

  const getNotificationIcon = (type, riskLevel) => {
    if (riskLevel === 'high') {
      return <FiAlertCircle className="h-5 w-5 text-red-500" />;
    } else if (riskLevel === 'medium') {
      return <FiAlertCircle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <FiMail className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBg = (riskLevel, read) => {
    if (read) return 'bg-gray-50';
    if (riskLevel === 'high') return 'bg-red-50';
    if (riskLevel === 'medium') return 'bg-yellow-50';
    return 'bg-blue-50';
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiBell className="h-5 w-5 text-white" />
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMarkAllAsRead();
                }}
                className="text-xs text-white bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="text-white hover:text-gray-200 p-1 hover:bg-white hover:bg-opacity-10 rounded"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List - Scrollable */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="max-h-96 overflow-y-auto"
        style={{ 
          maxHeight: '400px',
          overflowY: 'auto'
        }}
      >
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <FiBell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">
              When emails are sent to at-risk students, they'll appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 ${getNotificationBg(notification.riskLevel, notification.read)} hover:bg-opacity-80 transition-colors relative`}
              >
                {!notification.read && (
                  <span className="absolute top-4 right-4 h-2 w-2 bg-blue-500 rounded-full"></span>
                )}
                
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type, notification.riskLevel)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div>
                      <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.message}
                      </p>
                      <div className="mt-1 flex items-center space-x-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          notification.riskLevel === 'high' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {notification.riskLevel.toUpperCase()} RISK
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 flex items-center">
                          <FiClock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(notification.time)}
                        </span>
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="mt-2 bg-white bg-opacity-50 rounded-lg p-2 text-xs">
                      <div className="flex items-center space-x-2 mb-1">
                        <FiUser className="h-3 w-3 text-gray-400" />
                        <span className="font-medium text-gray-700">{notification.studentName}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <span className="text-gray-500">CGPA:</span>
                          <span className={`ml-1 font-medium ${
                            notification.details?.cgpa < 2.0 ? 'text-red-600' : 
                            notification.details?.cgpa < 2.5 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {notification.details?.cgpa || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Attendance:</span>
                          <span className={`ml-1 font-medium ${
                            notification.details?.attendance < 60 ? 'text-red-600' : 
                            notification.details?.attendance < 75 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {notification.details?.attendance || 'N/A'}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Only Mark as Read and Delete */}
                    <div className="mt-2 flex items-center justify-end space-x-2">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                          title="Mark as read"
                        >
                          <FiCheck className="h-3 w-3 mr-1" />
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete(notification.id);
                        }}
                        className="text-xs text-gray-400 hover:text-red-500 flex items-center"
                        title="Delete"
                      >
                        <FiX className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            High: {notifications.filter(n => n.riskLevel === 'high').length}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            Med: {notifications.filter(n => n.riskLevel === 'medium').length}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            Total: {notifications.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;