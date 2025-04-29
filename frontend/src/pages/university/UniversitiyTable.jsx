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
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl text-dark-blue font-bold ">
            Question Papers Available for Following Universities
          </h2>
        </div>

        <div className="flex flex-wrap justify-center md:justify-center gap-6">
          {loading ? (
            <p className="text-center w-full text-gray-600">Loading universities...</p>
          ) : error ? (
            <p className="text-red-500 text-center w-full">{error}</p>
          ) : universities.length > 0 ? (
            universities.map((uni) => (
              <Card
                key={uni.id}
                className="w-44 overflow-hidden rounded-xl border border-purple-100 bg-white hover:shadow-md transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={uni.image_url || "https://placehold.co/150"}
                    alt={`${uni.name} logo`}
                    className="w-full h-36 object-contain"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/150";
                    }}
                  />
                </div>
                <CardContent className="py-3 px-1 flex flex-col justify-center items-center gap-2">
                  <h3 className="font-semibold text-center text-sm text-gray-700 line-clamp-1">
                    {uni.name}
                  </h3>
                  <Link to={`/program?universityId=${uni.id}`} className="mt-auto">
                    <Button className="text-white bg-gradient-to-br from-purple-600 to-blue-600/70 hover:bg-gradient-to-br hover:from-purple-700 hover:to-blue-700/70 border-none">
                      Visit
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-red-500 text-center w-full">No Universities Found</p>
          )}
        </div>
      </div>
    </section>
  );



});

UniversityTable.displayName = 'UniversityTable';

export default UniversityTable;
