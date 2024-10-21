import React from "react";

const Documents: React.FC = () => {
  return (
    <div className="flex">
      {/* Main Content */}
      <div className="bg-white p-4 rounded-lg shadow-md flex-grow mr-52">
        <h2 className="text-xl font-bold mb-4">Document Checklist</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Document Name</th>
                <th className="py-2 px-4 border-b">Document Type</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">Bank Statements</td>
                <td className="py-2 px-4 border-b text-center">
                  <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full">Financial</span>
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <span className="bg-orange-100 text-orange-800 py-1 px-3 rounded-full">Pending</span>
                </td>
                <td className="py-2 px-4 border-b">
                  The company filed the ITR-6 for AY on (Mention the date)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:flex flex-col fixed right-0 h-full -mt-3 w-52 border-l-black border-gray-300 bg-gray-800 text-white">
        <ul className="flex-grow p-5 space-y-4">
          {[
            "Document Checklist",
            "Patents",
            "Incubation",
          ].map((link, index) => (
            <li key={index}>
              <a
                href="#"
                className={`block py-2 w-screen -ml-4 transition-colors ${
                  link === "Document Checklist" ? "bg-white text-black" : "text-white"
                } hover:bg-white hover:text-black`}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default Documents;