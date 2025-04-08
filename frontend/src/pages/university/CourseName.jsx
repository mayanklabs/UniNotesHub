import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import usePyqStore from "@/store/pyqStore";
import { fetchCourses } from "@/utils/api/pyqApi";

const CourseName = () => {
  const { selectedPath, courses, setCourses, setSelectedPath } = usePyqStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCourses = async () => {
      if (!selectedPath.branchId) {
        setCourses([]);
        setError("No branch selected. Please choose a branch first.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCourses(selectedPath.branchId);
        console.log("Fetched courses for branch", selectedPath.branchId, ":", data);
        if (!Array.isArray(data) || data.length === 0) {
          setError(`No courses found for branch ID ${selectedPath.branchId}`);
          setCourses([]);
        } else {
          setCourses(data);
        }
      } catch (error) {
        setError(error.message || "Failed to fetch courses");
        console.error("Error fetching courses:", error.response?.data || error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [selectedPath.branchId, setCourses]);

  return (
    <div className="mt-20">
      <div className="flex justify-center">
        <h2 className="text-2xl font-bold mb-4">Choose a Course</h2>
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
                  src="https://tse2.mm.bing.net/th?id=OIP.FV5O7INzORJM7JPkSRB2iwHaHa&pid=Api&P=0&h=180"
                  alt="course"
                  className="w-full h-36 object-cover rounded-t-lg"
                />
              </div>
              <CardContent className="py-2 flex justify-center items-center">
                <Link to="/questions" onClick={() => setSelectedPath({ courseId: course.id })}>
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