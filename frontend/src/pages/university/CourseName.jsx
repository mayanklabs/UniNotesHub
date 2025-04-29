// src/pages/university/CourseName.jsx
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import { fetchCourses } from "@/utils/api/pyqApi";

const CourseName = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const universityId = query.get('universityId');
  const programId = query.get('programId');
  const branchId = query.get('branchId');

  useEffect(() => {
    const loadCourses = async () => {
      if (!branchId) {
        setError("No branch selected. Please choose a branch first.");
        return;
      }
      setLoading(true);
      try {
        const data = await fetchCourses(branchId);
        console.log('Fetched courses:', data);
        setCourses(data);
        if (data.length === 0) {
          setError("No courses available for this branch.");
        }
      } catch (error) {
        setError(error.message || "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [branchId]);

  return (
    <div className="mt-20">
      <div className="flex justify-center">
        <h2 className="text-3xl md:text-2xl text-dark-blue font-bold">Choose a Course</h2>
      </div>
      <div className="mx-10 gap-4 flex flex-row justify-center flex-wrap md:flex md:justify-start">
        {loading ? (
          <p className="text-center w-full">Loading courses...</p>
        ) : error ? (
          <p className="text-red-500 text-center w-full">{error}</p>
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <Card
              key={course.id}
              className="w-40 overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={course.image_url || "https://placehold.co/150"}
                  alt={`${course.name} image`}
                  className="w-full h-36 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/150"; // Fallback to placeholder on error
                  }}
                />
              </div>
              <CardContent className="py-2 flex justify-center items-center">
                <Link to={`/questions?universityId=${universityId}&programId=${programId}&branchId=${branchId}&courseId=${course.id}`}>
                  <h1 className="hover:underline font-bold text-lg truncate">{course.name}</h1>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-red-500 text-center w-full">No Courses Found</p>
        )}
      </div>
    </div>
  );
};

export default CourseName;
