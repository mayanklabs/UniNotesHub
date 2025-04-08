import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import axios from "axios";
import usePyqStore from "@/store/pyqStore";

const API_URL = "http://localhost:8000/api/";

const UniversityTable = () => {
  const { setSelectedPath } = usePyqStore();
  const [universities, setUniversities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const response = await axios.get(`${API_URL}universities/`);
        setUniversities(response.data);
      } catch (error) {
        setError(error.message || "Failed to fetch universities");
      }
    };
    loadUniversities();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Question Papers Available for Following Universities</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">University</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {universities.length > 0 ? (
            universities.map((uni) => (
              <TableRow key={uni.id}>
                <TableCell className="font-medium">{uni.name}</TableCell>
                <TableCell className="text-right">
                  <Link to="/program" onClick={() => setSelectedPath({ universityId: uni.id })}>
                    <Button>Visit</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="text-red-500 text-center">
                No Universities Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UniversityTable;