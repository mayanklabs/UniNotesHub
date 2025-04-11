// src/pages/university/UniversityTable.jsx
import React, { useEffect, useState, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { fetchUniversities } from "@/utils/api/pyqApi";

const UniversityTable = memo(({ searchQuery }) => {
  const [universities, setUniversities] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUniversities = async () => {
      setLoading(true);
      try {
        const data = await fetchUniversities(searchQuery || '');
        console.log('Fetched universities:', data);
        setUniversities(data);
        setError(data.length === 0 && searchQuery ? "No universities found for your search." : null);
      } catch (error) {
        setError(error.message || "Failed to fetch universities");
        setUniversities([]);
      } finally {
        setLoading(false);
      }
    };
    loadUniversities();
  }, [searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center">
        <h2 className="text-2xl font-bold mb-4">Question Papers Available for Following Universities</h2>
      </div>
      <div className="gap-4 flex flex-row justify-center flex-wrap md:flex md:justify-start">
        {loading ? (
          <p className="text-center w-full">Loading universities...</p>
        ) : error ? (
          <p className="text-red-500 text-center w-full">{error}</p>
        ) : universities.length > 0 ? (
          universities.map((uni) => (
            <Card
              key={uni.id}
              className="w-44 overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={uni.image_url || "https://via.placeholder.com/150"}
                  alt={`${uni.name} logo`}
                  className="w-full h-36 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150"; // Fallback to placeholder on error
                  }}
                />
              </div>
              <CardContent className="py-2 flex flex-col justify-center items-center gap-2">
                <h1 className="font-bold text-lg truncate text-center">{uni.name}</h1>
                <Link to={`/program?universityId=${uni.id}`}>
                  <Button>Visit</Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-red-500 text-center w-full">No Universities Found</p>
        )}
      </div>
    </div>
  );
});

UniversityTable.displayName = 'UniversityTable';

export default UniversityTable;