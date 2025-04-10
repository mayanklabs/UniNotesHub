// src/pages/user/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import usePyqStore from "@/store/pyqStore";
import PYQForm from "@/pages/user/PYQForm";
import { toast } from "sonner";

const Dashboard = () => {
  const { userPyqs, fetchUserPyqs, deleteUserPyq, updateUserPyq, error } = usePyqStore();
  const [loading, setLoading] = useState(false);
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
    } catch (error) {
      toast.error("Failed to update PYQ", { description: error.message });
    }
  };

  return (
    <div className="mt-20 px-14">
      <h1 className="flex justify-center text-2xl font-bold mb-4">My Uploaded PYQs</h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">S.No</TableHead>
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
          ) : userPyqs.length > 0 ? (
            userPyqs.map((pyq, index) => (
              <TableRow key={pyq.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{pyq.university_name}</TableCell>
                <TableCell>{pyq.branch_name}</TableCell>
                <TableCell>{pyq.course_name}</TableCell>
                <TableCell>{pyq.year}</TableCell>
                <TableCell>{pyq.semester}</TableCell>
                <TableCell>
                  <a href={pyq.fileUrl} target="_blank" rel="noopener noreferrer">
                    {pyq.file.split('/').pop()}
                  </a>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" className="mr-2" onClick={() => handleEdit(pyq)}>
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(pyq.id)}>
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

      {/* Edit Dialog */}
      {editingPyq && (
        <Dialog open={!!editingPyq} onOpenChange={() => setEditingPyq(null)}>
          <DialogContent>
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