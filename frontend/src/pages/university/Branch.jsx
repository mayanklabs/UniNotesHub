import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import usePyqStore from "@/store/pyqStore";
import { fetchBranches } from "@/utils/api/pyqApi";

const BranchName = () => {
  const { selectedPath, branches, setBranches, setSelectedPath } = usePyqStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBranches = async () => {
      if (!selectedPath.programId) {
        setBranches([]);
        setError("No program selected. Please choose a program first.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBranches(selectedPath.programId);
        console.log("Fetched branches for program", selectedPath.programId, ":", data);
        if (!Array.isArray(data) || data.length === 0) {
          setError(`No branches found for program ID ${selectedPath.programId}`);
          setBranches([]);
        } else {
          setBranches(data);
        }
      } catch (error) {
        setError(error.message || "Failed to fetch branches");
        console.error("Error fetching branches:", error.response?.data || error);
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };
    loadBranches();
  }, [selectedPath.programId, setBranches]);

  return (
    <div className="mt-20">
      <div className="flex justify-center">
        <h2 className="text-2xl font-bold mb-4">Choose a Branch</h2>
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
                  src="https://tse2.mm.bing.net/th?id=OIP.rZN0_UKCjsEpDqjhUazn0gHaEK&pid=Api&P=0&h=180"
                  alt="branch"
                  className="w-full h-36 object-cover rounded-t-lg"
                />
              </div>
              <CardContent className="py-2 flex justify-center items-center">
                <Link to="/course" onClick={() => setSelectedPath({ branchId: branch.id })}>
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