import React from 'react';
import { Bell } from 'lucide-react';

const ReorderNotification = ({ requests }) => {
  if (!requests || requests.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center mb-2">
          <Bell className="text-yellow-500 mr-2" />
          <h3 className="font-semibold">Reorder Alerts</h3>
        </div>
        <div className="space-y-2">
          {requests.map(request => (
            <div key={request._id} className="text-sm text-gray-600">
              {request.medicineId.name} needs reordering ({request.medicineId.stock} remaining)
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReorderNotification;
