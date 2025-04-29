// src/components/PYQFilter.jsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { fetchPrograms, fetchBranches, fetchCourses } from "@/utils/api/pyqApi";
import { API_URL } from '../../config';

const filterSchema = z.object({
  university: z.string().min(1, "Please select a university"),
  program: z.string().optional(),
  branch: z.string().optional(),
  course: z.string().optional(),
});

const PYQFilter = ({ onFilterComplete, onUniversityFilter }) => {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      university: "",
      program: "",
      branch: "",
      course: "",
    },
  });

  const { watch, setValue, handleSubmit } = form;
  const selectedUniversity = watch("university");
  const selectedProgram = watch("program");
  const selectedBranch = watch("branch");

  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const response = await axios.get(`${API_URL}/universities/universities/`);
        setUniversities(response.data);
      } catch (error) {
        setError(error.message || "Failed to fetch universities");
      }
    };
    loadUniversities();
  }, []);

  useEffect(() => {
    const loadPrograms = async () => {
      if (selectedUniversity) {
        try {
          const programData = await fetchPrograms(selectedUniversity);
          setPrograms(programData);
          setValue("program", "");
          setValue("branch", "");
          setValue("course", "");
        } catch (error) {
          setError(error.message || "Failed to fetch programs");
        }
      }
    };
    loadPrograms();
  }, [selectedUniversity, setValue]);

  useEffect(() => {
    const loadBranches = async () => {
      if (selectedProgram) {
        try {
          const branchData = await fetchBranches(selectedProgram);
          setBranches(branchData);
          setValue("branch", "");
          setValue("course", "");
        } catch (error) {
          setError(error.message || "Failed to fetch branches");
        }
      }
    };
    loadBranches();
  }, [selectedProgram, setValue]);

  useEffect(() => {
    const loadCourses = async () => {
      if (selectedBranch) {
        try {
          const courseData = await fetchCourses(selectedBranch);
          setCourses(courseData);
          setValue("course", "");
        } catch (error) {
          setError(error.message || "Failed to fetch courses");
        }
      }
    };
    loadCourses();
  }, [selectedBranch, setValue]);

  const onSubmit = (data) => {
    const { university, program, branch, course } = data;

    if (university && !program && !branch && !course) {
      // University-only filter: update UniversityTable
      const selectedUni = universities.find(uni => uni.id.toString() === university);
      if (selectedUni && onUniversityFilter) {
        onUniversityFilter(selectedUni.name);
        onFilterComplete();
        return;
      }
    }

    if (university && program && branch && course) {
      // Full filter: navigate to QuestionsList
      const filterUrl = `/questions?universityId=${university}&programId=${program}&branchId=${branch}&courseId=${course}`;
      navigate(filterUrl);
      if (onFilterComplete) onFilterComplete();
    } else {
      if (!university) toast.error("University is missing");
      if (program && (!university)) toast.error("Select a university first");
      if (branch && (!program)) toast.error("Select a program first");
      if (course && (!branch)) toast.error("Select a branch first");
      toast.error("Please select at least a university, or all fields for a full filter.");
    }
  };

  return (
    <div className="w-full">
      {error && <p className="text-red-500 mb-4 text-center text-sm">{error}</p>}
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">University</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a university" />
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
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="program"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Program</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedUniversity || programs.length === 0}
                >
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
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Branch</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedProgram || branches.length === 0}
                >
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
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="course"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Course</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedBranch || courses.length === 0}
                >
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
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full mt-4">
            Apply Filter
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PYQFilter;
