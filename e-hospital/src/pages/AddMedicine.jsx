// ...existing imports and initial code...

const AddMedicine = ({ sidebar }) => {
  // ...existing state and functions...

  const getStockStatus = (stockLevel) => {
    if (stockLevel === 0) {
      return {
        text: 'Out of Stock',
        className: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold'
      };
    } else if (stockLevel <= 10) {
      return {
        text: 'Low Stock',
        className: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold animate-pulse'
      };
    } else {
      return {
        text: 'In Stock',
        className: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold'
      };
    }
  };

  return (
    <div className={`p-6 ${sidebar ? 'ml-64' : 'ml-20'} transition-all duration-300 mt-12`}>
      {/* ...existing alert code... */}

      {/* ...existing form code... */}

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Medicine List</h2>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Stock Status</th>
              <th className="py-2 px-4 border-b">Expiry</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med) => {
              const stockStatus = getStockStatus(med.stock);
              return (
                <tr key={med._id}>
                  <td className="py-2 px-4 border-b">{med.name}</td>
                  <td className="py-2 px-4 border-b">{med.description}</td>
                  <td className="py-2 px-4 border-b">Rs.{med.price}</td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex items-center gap-2">
                      <span className={stockStatus.className}>
                        {stockStatus.text}
                      </span>
                      {med.stock > 0 && (
                        <span className="text-gray-500 text-xs">
                          ({med.stock} units)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex flex-col">
                      <span>{new Date(med.expiryDate).toLocaleDateString()}</span>
                      {new Date(med.expiryDate) <= new Date() && (
                        <span className="text-red-600 text-xs">Expired</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(med)}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(med._id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {medicines.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No medicines found
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMedicine;
