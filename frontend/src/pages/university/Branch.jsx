// src/pages/university/BranchName.jsx
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import { fetchBranches } from "@/utils/api/pyqApi";

const BranchName = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const universityId = query.get('universityId');
  const programId = query.get('programId');

  useEffect(() => {
    const loadBranches = async () => {
      if (!programId) {
        setError("No program selected. Please choose a program first.");
        return;
      }
      setLoading(true);
      try {
        const data = await fetchBranches(programId);
        console.log('Fetched branches:', data);
        setBranches(data);
        if (data.length === 0) {
          setError("No branches available for this program.");
        }
      } catch (error) {
        setError(error.message || "Failed to fetch branches");
      } finally {
        setLoading(false);
      }
    };
    loadBranches();
  }, [programId]);

  return (
    <div className="mt-20">
      <div className="flex justify-center">
        <h2 className="text-3xl md:text-2xl text-dark-blue font-bold">Choose a Branch</h2>
      </div>
      <div className="mx-10 gap-4 flex flex-row justify-center flex-wrap md:flex md:justify-start">
        {loading ? (
          <p className="text-center w-full">Loading branches...</p>
        ) : error ? (
          <p className="text-red-500 text-center w-full">{error}</p>
        ) : branches.length > 0 ? (
          branches.map((branch) => (
            <Card
              key={branch.id}
              className="w-40 overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={branch.image_url || "https://via.placeholder.com/150"}
                  alt={`${branch.name} image`}
                  className="w-full h-36 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150"; // Fallback to placeholder on error
                  }}
                />
              </div>
              <CardContent className="py-2 flex justify-center items-center">
                <Link to={`/course?universityId=${universityId}&programId=${programId}&branchId=${branch.id}`}>
                  <h1 className="hover:underline font-bold text-lg truncate">{branch.name}</h1>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-red-500 text-center w-full">No Branches Found</p>
        )}
      </div>
    </div>
  );
};

export default BranchName;