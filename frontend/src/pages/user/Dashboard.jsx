import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import usePyqStore from "@/store/pyqStore";
import PYQForm from "./PYQForm";
import { toast } from "sonner";

const Dashboard = () => {
  const { userPyqs, fetchUserPyqs, deleteUserPyq, updateUserPyq, error } = usePyqStore();
  const [loading, setLoading] = useState(true);
  const [editingPyq, setEditingPyq] = useState(null);

  useEffect(() => {
    const loadUserPyqs = async () => {
      setLoading(true);
      await fetchUserPyqs();
      setLoading(false);
    };
    loadUserPyqs();
  }, [fetchUserPyqs]);

  const handleDelete = async (pyqId) => {
    if (window.confirm("Are you sure you want to delete this PYQ?")) {
      try {
        await deleteUserPyq(pyqId);
        toast.success("PYQ deleted successfully!");
        // Re-fetch user PYQs to ensure state matches backend
        setLoading(true);
        await fetchUserPyqs();
        setLoading(false);
      } catch (error) {
        toast.error("Failed to delete PYQ", { description: error.message });
      }
    }
  };

  const handleEdit = (pyq) => {
    setEditingPyq(pyq);
  };

  const handleFormSubmit = async (formData) => {
    try {
      await updateUserPyq(editingPyq.id, formData);
      setEditingPyq(null);
      toast.success("PYQ updated successfully!");
      // Optionally re-fetch after update
      setLoading(true);
      await fetchUserPyqs();
      setLoading(false);
    } catch (error) {
      toast.error("Failed to update PYQ", { description: error.message });
    }
  };

  return (
    <div className="mt-20 px-4 sm:px-6 md:px-14 min-h-screen">
      <h1 className="flex justify-center text-xl sm:text-2xl font-bold mb-4">My Uploaded PYQs</h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">S.No</TableHead>
              <TableHead>University</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>File</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : !userPyqs ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Loading data...</TableCell>
              </TableRow>
            ) : userPyqs.length > 0 ? (
              userPyqs.map((pyq, index) => (
                <TableRow key={pyq.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{pyq.university_name || "N/A"}</TableCell>
                  <TableCell>{pyq.branch_name || "N/A"}</TableCell>
                  <TableCell>{pyq.course_name || "N/A"}</TableCell>
                  <TableCell>{pyq.year || "N/A"}</TableCell>
                  <TableCell>{pyq.semester || "N/A"}</TableCell>
                  <TableCell>
                    <a href={pyq.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {pyq.file ? pyq.file.split('/').pop() : "No File"}
                    </a>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(pyq)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(pyq.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-red-500 text-center">No PYQs uploaded yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : !userPyqs ? (
          <p className="text-center">Loading data...</p>
        ) : userPyqs.length > 0 ? (
          userPyqs.map((pyq, index) => (
            <div key={pyq.id} className="border rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-medium">S.No:</span>
                <span>{index + 1}</span>
                <span className="font-medium">University:</span>
                <span>{pyq.university_name || "N/A"}</span>
                <span className="font-medium">Branch:</span>
                <span>{pyq.branch_name || "N/A"}</span>
                <span className="font-medium">Course:</span>
                <span>{pyq.course_name || "N/A"}</span>
                <span className="font-medium">Year:</span>
                <span>{pyq.year || "N/A"}</span>
                <span className="font-medium">Semester:</span>
                <span>{pyq.semester || "N/A"}</span>
                <span className="font-medium">File:</span>
                <span>
                  <a href={pyq.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {pyq.file ? pyq.file.split('/').pop() : "No File"}
                  </a>
                </span>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(pyq)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(pyq.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-red-500 text-center">No PYQs uploaded yet</p>
        )}
      </div>

      {/* Edit Dialog */}
      {editingPyq && (
        <Dialog open={!!editingPyq} onOpenChange={() => setEditingPyq(null)}>
          <DialogContent className="max-w-[90vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit PYQ</DialogTitle>
            </DialogHeader>
            <PYQForm
              initialData={editingPyq}
              onSubmit={handleFormSubmit}
              isEditing={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Dashboard;