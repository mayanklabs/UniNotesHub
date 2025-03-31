// src/components/PYQForm.jsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import usePyqStore from "@/store/pyqStore";
import { useAuthStore } from "@/store/authStore";
import { uploadPyq, fetchPrograms, fetchBranches, fetchCourses } from "@/utils/api/pyqApi";
import axios from "axios";
import { toast } from "sonner";

const API_URL = "http://localhost:8000/api/";

const formSchema = z.object({
  university: z.string().min(1, "Please select a university"),
  program: z.string().min(1, "Please select a program"),
  branch: z.string().min(1, "Please select a branch"),
  course: z.string().min(1, "Please select a course"),
  year: z.string().min(4, "Please select a year"),
  semester: z.string().min(1, "Please select a semester"),
  file: z.any().optional(),
});

const PYQForm = ({ initialData = {}, onSubmit = null, isEditing = false }) => {
  const { isAuthenticated } = useAuthStore();
  const {
    selectedPath,
    programs,
    branches,
    courses,
    setPrograms,
    setBranches,
    setCourses,
    addPyq,
    setUploading,
    setError,
    error,
    fetchPyqsForPath,
  } = usePyqStore();

  const [universities, setUniversities] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      university: initialData.university?.toString() || selectedPath.universityId || "",
      program: initialData.program?.toString() || selectedPath.programId || "",
      branch: initialData.branch?.toString() || selectedPath.branchId || "",
      course: initialData.course?.toString() || selectedPath.courseId || "",
      year: initialData.year || "2024",
      semester: initialData.semester || "1",
      file: null,
    },
  });

  const selectedUniversity = form.watch("university");
  const selectedProgram = form.watch("program");
  const selectedBranch = form.watch("branch");

  useEffect(() => {
    const loadUniversities = async () => {
      try {
        setLoadingUniversities(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}universities/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUniversities(response.data);
      } catch (error) {
        setError(error.message || "Failed to fetch universities");
        toast.error("Failed to load universities");
      } finally {
        setLoadingUniversities(false);
      }
    };
    loadUniversities();
  }, [setError]);

  useEffect(() => {
    const loadPrograms = async () => {
      if (selectedUniversity && (!programs.length || programs[0].university !== Number(selectedUniversity))) {
        try {
          const programData = await fetchPrograms(selectedUniversity);
          setPrograms(programData);
          if (!isEditing) form.setValue("program", "");
          setBranches([]);
          setCourses([]);
        } catch (error) {
          setError(error.message || "Failed to fetch programs");
        }
      }
    };
    loadPrograms();
  }, [selectedUniversity, programs, setPrograms, setError, form, setBranches, setCourses, isEditing]);

  useEffect(() => {
    const loadBranches = async () => {
      if (selectedProgram && (!branches.length || branches[0].program !== Number(selectedProgram))) {
        try {
          const branchData = await fetchBranches(selectedProgram);
          setBranches(branchData);
          if (!isEditing) form.setValue("branch", "");
          setCourses([]);
        } catch (error) {
          setError(error.message || "Failed to fetch branches");
        }
      }
    };
    loadBranches();
  }, [selectedProgram, branches, setBranches, setError, form, setCourses, isEditing]);

  useEffect(() => {
    const loadCourses = async () => {
      if (selectedBranch && (!courses.length || courses[0].branch !== Number(selectedBranch))) {
        try {
          const courseData = await fetchCourses(selectedBranch);
          setCourses(courseData);
          if (!isEditing) form.setValue("course", "");
        } catch (error) {
          setError(error.message || "Failed to fetch courses");
        }
      }
    };
    loadCourses();
  }, [selectedBranch, courses, setCourses, setError, form, isEditing]);

  const handleProgramChange = (value) => {
    form.setValue("program", value);
    form.setValue("branch", "");
    form.setValue("course", "");
  };

  const handleBranchChange = (value) => {
    form.setValue("branch", value);
    form.setValue("course", "");
  };

  const onFormSubmit = async (data) => {
    if (!isAuthenticated) {
      toast.error("Please log in to upload PYQs");
      window.location.href = "/login";
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("university", data.university);
    formData.append("program", data.program);
    formData.append("branch", data.branch);
    formData.append("course", data.course);
    formData.append("year", data.year);
    formData.append("semester", data.semester);
    if (data.file?.length > 0) formData.append("file", data.file[0]);

    try {
      if (isEditing && onSubmit) {
        await onSubmit(formData);
        toast.success("PYQ updated successfully!");
      } else {
        const response = await uploadPyq(formData);
        addPyq(response);
        await fetchPyqsForPath(data.university, data.program, data.branch, data.course);
        form.reset();
        toast.success("PYQ uploaded successfully!", {
          description: `Uploaded for ${data.year} Semester ${data.semester}`,
        });
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to process PYQ";
      setError(errorMessage);
      toast.error(isEditing ? "Failed to update PYQ" : "Failed to upload PYQ", {
        description: errorMessage,
      });
      if (errorMessage.includes("token")) window.location.href = "/login";
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-red-500 mb-4">Please log in to upload PYQs</p>
        <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-12">
      <h2 className="text-2xl font-bold mb-6">{isEditing ? "Edit PYQ" : "Upload Previous Year Question Paper"}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel>University</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loadingUniversities || universities.length === 0}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        loadingUniversities ? "Loading universities..." :
                        universities.length === 0 ? "No universities available" : "Select a university"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.id} value={uni.id.toString()}>
                        {uni.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="program"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Program</FormLabel>
                <Select onValueChange={handleProgramChange} value={field.value} disabled={!selectedUniversity}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {programs.map((prog) => (
                      <SelectItem key={prog.id} value={prog.id.toString()}>
                        {prog.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>
                <Select onValueChange={handleBranchChange} value={field.value} disabled={!selectedProgram}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="course"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedBranch}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => 2000 + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a semester" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Question Paper (PDF)</FormLabel>
                <FormControl>
                  <Input type="file" accept=".pdf" onChange={(e) => onChange(e.target.files)} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={usePyqStore((state) => state.isUploading)} className="w-full">
            {usePyqStore((state) => state.isUploading) ? "Processing..." : isEditing ? "Update PYQ" : "Upload PYQ"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PYQForm;