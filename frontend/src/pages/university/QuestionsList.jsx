import React, { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Trash2, Edit2 } from "lucide-react";
import usePyqStore from "@/store/pyqStore";
import { fetchCourses } from "@/utils/api/pyqApi";
import axios from "axios";

const API_URL = "http://localhost:8000/api/";

// Define currentUser globally
const currentUser = {
  id: null,
  email: null,
  name: null,
  profilePicture: null,
  token: null,
};

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}token/`, { email, password });
    const token = response.data.access;
    localStorage.setItem("token", token);
    currentUser.token = token;
    const userResponse = await axios.get(`${API_URL}users/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    currentUser.id = userResponse.data.id;
    currentUser.email = userResponse.data.email;
    currentUser.name = userResponse.data.name;
    currentUser.profilePicture = userResponse.data.profile?.profile_picture || null;
    console.log("Login successful, currentUser:", currentUser);
    return token;
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
    throw err;
  }
};

const fetchCommentsForQuestion = async (pyqId, token = null) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${API_URL}pyq/${pyqId}/ratings/`, config);
    console.log(`Fetched comments for PYQ ${pyqId}:`, response.data);
    return response.data;
  } catch (err) {
    console.error("Error fetching comments:", err.response?.data || err.message);
    return [];
  }
};

const saveCommentToBackend = async (pyqId, commentObj, token) => {
  const payload = { pyq: pyqId, rating: commentObj.rating, comment: commentObj.text };
  console.log("Saving comment for PYQ:", pyqId, "Payload:", payload);
  try {
    const response = await axios.post(`${API_URL}pyq/${pyqId}/rate/`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Saved comment response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error saving comment:", err.response?.data);
    throw err;
  }
};

const updateCommentInBackend = async (commentId, text, rating, token) => {
  try {
    const response = await axios.patch(`${API_URL}pyq/ratings/${commentId}/`, { comment: text, rating }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Updated comment:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error updating comment:", err.response?.data || err.message);
    throw err;
  }
};

const deleteCommentFromBackend = async (commentId, token) => {
  try {
    await axios.delete(`${API_URL}pyq/ratings/${commentId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Deleted comment:", commentId);
  } catch (err) {
    console.error("Error deleting comment:", err.response?.data || err.message);
    throw err;
  }
};

const Comment = React.memo(({ comment, onEdit, onDelete, userId }) => {
  const canEditDelete = userId && String(comment.user?.id) === String(userId);
  console.log("Rendering comment:", comment, "userId:", userId, "canEditDelete:", canEditDelete);
  return (
    <div key={comment.id} className="flex items-start mb-2 border-b pb-2">
      <img
        src={comment.user?.profile_picture || "/default-avatar.png"}
        alt={comment.user?.name || comment.user?.email || "Unknown User"}
        className="w-10 h-10 rounded-full mr-2"
        onError={(e) => (e.target.src = "/default-avatar.png")}
      />
      <div className="flex-1">
        <p className="font-semibold">{comment.user?.name || comment.user?.email || "Unknown User"}</p>
        <p className="text-gray-700">{comment.comment || "No comment"}</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${comment.rating >= star ? "text-yellow-500" : "text-gray-400"}`}
            />
          ))}
        </div>
        {canEditDelete ? (
          <div className="flex gap-2 mt-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(comment)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(comment.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
});

const QuestionsList = () => {
  const { pyqs, selectedPath, fetchPyqsForPath, error } = usePyqStore();
  const [loading, setLoading] = useState(false);
  const [courseName, setCourseName] = useState("Loading course name...");
  const [expandedRow, setExpandedRow] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [ratings, setRatings] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || currentUser.token);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const performLogin = async () => {
      const storedToken = localStorage.getItem("token");
      console.log("Initial token check - storedToken:", storedToken, "currentUser.token:", currentUser.token);
      if (!token && !storedToken) {
        try {
          const newToken = await login("manishprasad2065@gmail.com", "yourpassword"); // Replace with real credentials
          setToken(newToken);
          setUserId(currentUser.id);
          console.log("After login, userId set to:", currentUser.id);
        } catch (err) {
          console.error("Auto-login failed:", err.response?.data);
          setAuthError("Login failed. Please check your credentials.");
        }
      } else if (!userId && (token || storedToken)) {
        const activeToken = token || storedToken;
        try {
          const userResponse = await axios.get(`${API_URL}users/profile/`, {
            headers: { Authorization: `Bearer ${activeToken}` },
          });
          currentUser.id = userResponse.data.id;
          currentUser.email = userResponse.data.email;
          currentUser.name = userResponse.data.name;
          currentUser.profilePicture = userResponse.data.profile?.profile_picture || null;
          setUserId(currentUser.id);
          setToken(activeToken);
          console.log("Fetched user profile, userId set to:", currentUser.id);
        } catch (err) {
          console.error("Failed to fetch user profile:", err.response?.data);
          setAuthError("Failed to fetch user profile. Token may be invalid.");
        }
      }
      console.log("Current userId after login attempt:", userId || "not set yet");
    };
    performLogin();
  }, [token]);

  useEffect(() => {
    const loadPyqsAndCourse = async () => {
      if (selectedPath.universityId && selectedPath.programId && selectedPath.branchId && selectedPath.courseId) {
        setLoading(true);
        try {
          await fetchPyqsForPath(selectedPath.universityId, selectedPath.programId, selectedPath.branchId, selectedPath.courseId);
          const courses = await fetchCourses(selectedPath.branchId);
          const course = courses.find((c) => c.id === Number(selectedPath.courseId));
          setCourseName(course ? course.name : "Course Not Found");
        } catch (err) {
          console.error("Error fetching data:", err);
          setCourseName("Error loading course");
        } finally {
          setLoading(false);
        }
      } else {
        setCourseName("No Course Selected");
      }
    };
    loadPyqsAndCourse();
  }, [selectedPath, fetchPyqsForPath]);

  useEffect(() => {
    const loadComments = async () => {
      if (pyqs.length === 0) return;
      setLoadingComments(true);
      const commentsData = {};
      try {
        await Promise.all(
          pyqs.map(async (question) => {
            commentsData[question.id] = await fetchCommentsForQuestion(question.id, token);
          })
        );
        setComments(commentsData);
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setLoadingComments(false);
      }
    };
    loadComments();
  }, [pyqs, token]); // Removed userId dependency

  const sortedPyqs = [...pyqs].sort((a, b) => (b.year || b.uploaded_at || b.id) - (a.year || b.uploaded_at || a.id));

  const toggleRow = (questionId) => {
    setExpandedRow(expandedRow === questionId ? null : questionId);
    setNewComment("");
    setEditingComment(null);
    setRatings((prev) => ({ ...prev, [questionId]: 0 }));
  };

  const handleRating = (questionId, rating) => {
    setRatings((prev) => ({ ...prev, [questionId]: rating }));
  };

  const hasUserCommented = useCallback((questionId) => {
    const hasCommented = comments[questionId]?.some((comment) => String(comment.user?.id) === String(userId));
    console.log(`Has user ${userId} commented on ${questionId}? ${hasCommented}`);
    return hasCommented;
  }, [comments, userId]);

  const getUserComment = useCallback((questionId) => {
    return comments[questionId]?.find((comment) => String(comment.user?.id) === String(userId));
  }, [comments, userId]);

  const submitComment = async (questionId) => {
    if (!token || !userId) {
      alert("Please log in to comment or rate.");
      return;
    }
    const rating = ratings[questionId] || 0;
    if (!newComment.trim() && rating === 0) return;
    if (submitting) return;

    setSubmitting(true);
    try {
      const userHasCommented = hasUserCommented(questionId);
      if (editingComment && editingComment.questionId === questionId) {
        const updatedComment = await updateCommentInBackend(
          editingComment.commentId,
          newComment,
          rating,
          token
        );
        setComments((prev) => ({
          ...prev,
          [questionId]: prev[questionId].map((c) => (c.id === updatedComment.id ? updatedComment : c)),
        }));
        setEditingComment(null);
      } else if (!userHasCommented) {
        const commentObj = { text: newComment, rating: rating };
        const savedComment = await saveCommentToBackend(questionId, commentObj, token);
        setComments((prev) => ({
          ...prev,
          [questionId]: [savedComment, ...(prev[questionId] || [])],
        }));
      } else {
        alert("You have already commented on this question. You can only edit or delete your existing comment.");
      }
      setNewComment("");
      setRatings((prev) => ({ ...prev, [questionId]: 0 }));
    } catch (err) {
      const errorMessage = err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || err.message;
      alert("Failed to save comment: " + errorMessage);
    } finally {
      setSubmitting(false);
    }
    console.log("User ID after submission:", userId);
  };

  const startEditingComment = (comment) => {
    setEditingComment({ questionId: comment.pyq, commentId: comment.id, rating: comment.rating });
    setNewComment(comment.comment || "");
    setRatings((prev) => ({ ...prev, [comment.pyq]: comment.rating }));
  };

  const deleteComment = async (questionId, commentId) => {
    if (!token || !userId) {
      alert("Please log in to delete.");
      return;
    }
    try {
      await deleteCommentFromBackend(commentId, token);
      setComments((prev) => ({
        ...prev,
        [questionId]: prev[questionId].filter((c) => c.id !== commentId),
      }));
      setEditingComment(null);
      setNewComment("");
      setRatings((prev) => ({ ...prev, [questionId]: 0 }));
    } catch (err) {
      alert("Failed to delete comment: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDownload = (fileUrl) => {
    if (!fileUrl) {
      console.error("No file URL provided for download");
      return;
    }
    const absoluteUrl = fileUrl.startsWith("http") ? fileUrl : `${API_URL}${fileUrl}`;
    const link = document.createElement("a");
    link.href = absoluteUrl;
    link.download = absoluteUrl.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-20 px-14">
      <h1 className="text-2xl font-bold text-center mb-6">{courseName}</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {authError && <p className="text-red-500 text-center mb-4">{authError}</p>}
      {loading ? (
        <p className="text-center">Loading questions...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S. No.</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Download</TableHead>
              <TableHead>Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPyqs.length > 0 ? (
              sortedPyqs.map((question, index) => {
                const userComment = getUserComment(question.id);
                return (
                  <React.Fragment key={question.id}>
                    <TableRow>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{question.year}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleDownload(question.file_url)}>Download</Button>
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => toggleRow(question.id)}>Rate</Button>
                      </TableCell>
                    </TableRow>
                    {expandedRow === question.id && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <div className="p-4 border rounded">
                            <div className="max-h-64 overflow-y-auto mb-4">
                              <h3 className="font-semibold mb-2">Comments & Ratings</h3>
                              {loadingComments ? (
                                <p>Loading comments...</p>
                              ) : comments[question.id]?.length > 0 ? (
                                comments[question.id].map((comment) => (
                                  <Comment
                                    key={comment.id}
                                    comment={comment}
                                    onEdit={startEditingComment}
                                    onDelete={() => deleteComment(question.id, comment.id)}
                                    userId={userId} // Pass userId, can be null for non-logged-in
                                  />
                                ))
                              ) : (
                                <p>No comments yet.</p>
                              )}
                            </div>
                            {userId ? (
                              !hasUserCommented(question.id) || editingComment?.questionId === question.id ? (
                                <div>
                                  <div className="flex gap-3 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`cursor-pointer ${ratings[question.id] >= star ? "text-yellow-500" : "text-gray-400"}`}
                                        onClick={() => handleRating(question.id, star)}
                                      />
                                    ))}
                                  </div>
                                  <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={editingComment?.questionId === question.id ? "Edit your comment..." : "Write a comment..."}
                                    className="mb-2"
                                    disabled={submitting}
                                  />
                                  <Button
                                    onClick={() => submitComment(question.id)}
                                    disabled={submitting}
                                  >
                                    {submitting
                                      ? "Submitting..."
                                      : editingComment?.questionId === question.id
                                      ? "Save Edit"
                                      : "Post Comment"}
                                  </Button>
                                </div>
                              ) : (
                                <p className="text-gray-500">
                                  You have already commented and rated this question. See your comment above.
                                </p>
                              )
                            ) : (
                              <p className="text-gray-500">Please log in to comment or rate.</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-red-500 text-center">
                  Questions are not Available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default QuestionsList;