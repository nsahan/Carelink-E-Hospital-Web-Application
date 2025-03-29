import React, { useState } from 'react';

const AddMedicine = ({ sidebar }) => {
  return (
    <div className={`p-6 ${sidebar ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
      <h1 className="text-2xl font-semibold mb-9 mt-14">Add Medicine</h1>
      <div className="bg-white rounded-lg shadow-md p-4">
        <form>
          <div className="mb-9">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Medicine Name
            </label>
            <input
              type="text"
              id="name"
              required
              placeholder="Enter medicine name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              required
              placeholder="Enter medicine description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Medicine
          </button>
        </form>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Medicine List</h2>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Medicine Name</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Add medicine list items here */}
          </tbody>
        </table>  
      </div>
    </div>
  );
};

export default AddMedicine;
