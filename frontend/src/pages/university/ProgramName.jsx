// src/pages/university/ProgramName.jsx
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import { fetchPrograms } from "@/utils/api/pyqApi";

const ProgramName = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const universityId = query.get('universityId');

  useEffect(() => {
    const loadPrograms = async () => {
      if (!universityId) {
        setError("No university selected. Please choose a university first.");
        return;
      }
      setLoading(true);
      try {
        const data = await fetchPrograms(universityId);
        console.log('Fetched programs:', data);
        setPrograms(data);
        if (data.length === 0) {
          setError("No programs available for this university.");
        }
      } catch (error) {
        setError(error.message || "Failed to fetch programs");
      } finally {
        setLoading(false);
      }
    };
    loadPrograms();
  }, [universityId]);

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
                  src={program.image_url || "https://via.placeholder.com/150"}
                  alt={`${program.name} image`}
                  className="w-full h-36 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150"; // Fallback to placeholder on error
                  }}
                />
              </div>
              <CardContent className="py-2 flex justify-center items-center">
                <Link to={`/branch?universityId=${universityId}&programId=${program.id}`}>
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