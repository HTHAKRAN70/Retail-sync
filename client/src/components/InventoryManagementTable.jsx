// import React, { useState } from 'react';

// const InventoryManagementTable = ({ vendorProduct, handleEdit, handleDelete }) => {
//   const [expandedRow, setExpandedRow] = useState(null);

//   const handleToggleDescription = (id) => {
//     setExpandedRow(expandedRow === id ? null : id);
//   };
//   const handle

//   return (
//     <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="bg-gray-100 dark:bg-gray-700">
//             <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Item ID</th>
//             <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Image</th>
//             <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Name</th>
//             <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Description</th>
//             <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Price</th>
//             <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Quantity</th>
//             <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Category</th>
//             <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Actions</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y">
//           {vendorProduct.map((post) => {
//             const isExpanded = expandedRow === post._id;
//             const truncatedDescription = post.description.length > 100 
//               ? `${post.description.substring(0, 100)}...` 
//               : post.description;

//             return (
//               <tr key={post._id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
//                 <td className="py-3 px-4">{post.vendor_id}</td>
//                 <td className="py-3 px-4">
//                   <img
//                     src={post.image}
//                     alt={post.name}
//                     className="w-24 h-16 object-cover rounded-md border border-gray-200"
//                   />
//                 </td>
//                 <td className="py-3 px-4">
//                   <span className="font-medium text-gray-900 dark:text-gray-100">{post.name}</span>
//                 </td>
//                 <td className="py-3 px-4">
//                   <div>
//                     <span>{isExpanded ? post.description : truncatedDescription}</span>
//                     {post.description.length > 100 && (
//                       <button
//                         onClick={() => handleToggleDescription(post._id)}
//                         className="text-blue-500 hover:underline ml-2"
//                       >
//                         {isExpanded ? 'Show Less' : 'Show More'}
//                       </button>
//                     )}
//                   </div>
//                 </td>
//                 <td className="py-3 px-4 text-gray-700 dark:text-gray-300">${post.price}</td>
//                 <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{post.quantity}</td>
//                 <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{post.category}</td>
//                 <td className="py-3 px-4">
//                   <div className="flex space-x-2">
//                     <button
//                       onClick={handleclick(post)}
//                       className="text-sm text-blue-500 hover:underline"
//                     >
//                       Edit
//                     </button>
//                     <span>/</span>
//                     <button
//                       onClick={() => handleDelete(post._id)}
//                       className="text-sm text-red-600 hover:underline"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default InventoryManagementTable;

import React, { useState } from 'react';

const InventoryManagementTable = ({ vendorProduct, handleEdit, handleDelete }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const handleToggleDescription = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Item ID</th>
            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Image</th>
            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Name</th>
            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Description</th>
            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Price</th>
            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Quantity</th>
            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Category</th>
            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {vendorProduct.map((post) => {
            const isExpanded = expandedRow === post._id;
            const truncatedDescription = post.description.length > 100 
              ? `${post.description.substring(0, 100)}...` 
              : post.description;

            return (
              <tr key={post._id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-3 px-4">{post.vendor_id}</td>
                <td className="py-3 px-4">
                  <img
                    src={post.image}
                    alt={post.name}
                    className="w-24 h-16 object-cover rounded-md border border-gray-200"
                  />
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{post.name}</span>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <span>{isExpanded ? post.description : truncatedDescription}</span>
                    {post.description.length > 100 && (
                      <button
                        onClick={() => handleToggleDescription(post._id)}
                        className="text-blue-500 hover:underline ml-2"
                      >
                        {isExpanded ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">${post.price}</td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{post.quantity}</td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{post.category}</td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <span>/</span>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="text-sm text-red-600 hover:underline"
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
    </div>
  );
};

export default InventoryManagementTable;
