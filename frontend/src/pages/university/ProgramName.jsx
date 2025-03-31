import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import usePyqStore from "@/store/pyqStore";
import { fetchPrograms } from "@/utils/api/pyqApi";

const ProgramName = () => {
  const { selectedPath, programs, setPrograms, setSelectedPath } = usePyqStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPrograms = async () => {
      if (!selectedPath.universityId) {
        setPrograms([]);
        setError("No university selected. Please choose a university first.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPrograms(selectedPath.universityId);
        console.log("Fetched programs for university", selectedPath.universityId, ":", data);
        if (!Array.isArray(data) || data.length === 0) {
          setError(`No programs found for university ID ${selectedPath.universityId}`);
          setPrograms([]);
        } else {
          setPrograms(data);
        }
      } catch (error) {
        setError(error.message || "Failed to fetch programs");
        console.error("Error fetching programs:", error.response?.data || error);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };
    loadPrograms();
  }, [selectedPath.universityId, setPrograms]);

  return (
    <div className="mt-20">
      <div className="flex justify-center">
        <h2 className="text-2xl font-bold mb-4">Choose a Program</h2>
      </div>
      <div className="mx-10 gap-4 flex flex-row justify-center flex-wrap md:flex md:justify-start">
        {loading ? (
          <p className="text-center w-full">Loading programs...</p>
        ) : error ? (
          <p className="text-red-500 text-center w-full">{error}</p>
        ) : programs.length > 0 ? (
          programs.map((program) => (
            <Card
              key={program.id}
              className="w-44 overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={program.url || "https://via.placeholder.com/150"}
                  alt="program"
                  className="w-full h-36 object-cover rounded-t-lg"
                />
              </div>
              <CardContent className="py-2 flex justify-center items-center">
                <Link to="/branch" onClick={() => setSelectedPath({ programId: program.id })}>
                  <h1 className="hover:underline font-bold text-lg truncate">{program.name}</h1>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-red-500 text-center w-full">No Programs Found</p>
        )}
      </div>
    </div>
  );
};

export default ProgramName;