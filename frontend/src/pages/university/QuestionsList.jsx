// src/components/QuestionsList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Trash2, Edit2 } from 'lucide-react';
import usePyqStore from '@/store/pyqStore';
import useRatingStore from '@/store/ratingStore';
import { useAuthStore } from '@/store/authStore';
import { fetchCourses } from '@/utils/api/pyqApi';

const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAEZJREFUWEft1jEKACAIRVG4/5W9wSgwCgrChdN2sADk9gMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4LcD2Y0AAXwQMSkAAAAASUVORK5CYII=';

const API_URL = 'http://localhost:8000/api/';

const calculateAverageRating = (comments) => {
  if (!comments || !Array.isArray(comments) || comments.length === 0) return 0;
  const totalRating = comments.reduce((sum, comment) => sum + (comment.rating || 0), 0);
  return (totalRating / comments.length).toFixed(1);
};

const Comment = React.memo(({ comment, onEdit, onDelete }) => {
  const { user } = useAuthStore();
  const displayName = comment.user || 'Unknown User';
  const profilePicture = comment.user_profile_picture || FALLBACK_IMAGE;

  return (
    <div key={comment.id} className="flex items-start mb-2 border-b pb-2">
      <img
        src={profilePicture}
        alt={displayName}
        className="w-10 h-10 rounded-full mr-2"
        onError={(e) => { if (e.target.src !== FALLBACK_IMAGE) e.target.src = FALLBACK_IMAGE; }}
      />
      <div className="flex-1">
        <p className="font-semibold">{displayName}</p>
        <p className="text-gray-700">{comment.comment || 'No comment'}</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${comment.rating >= star ? 'text-yellow-500' : 'text-gray-400'}`}
            />
          ))}
        </div>
        {comment.user_id === user?.id && (
          <div className="flex gap-2 mt-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(comment)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(comment.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

const QuestionsList = () => {
  const { pyqs, fetchPyqsForPath, error: pyqError } = usePyqStore();
  const { comments, loadingComments, fetchComments, addComment, updateComment, deleteComment, error: ratingError } = useRatingStore();
  const { user, token } = useAuthStore();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const universityId = query.get('universityId');
  const programId = query.get('programId');
  const branchId = query.get('branchId');
  const courseId = query.get('courseId');

  const [loading, setLoading] = useState(false);
  const [courseName, setCourseName] = useState('No Course Selected');
  const [expandedRow, setExpandedRow] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [ratings, setRatings] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFetchError(null);

      if (!universityId || !programId || !branchId || !courseId) {
        setFetchError("Please select a university, program, branch, and course to view questions.");
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching PYQs with:', { universityId, programId, branchId, courseId });
        await fetchPyqsForPath(universityId, programId, branchId, courseId);

        const courses = await fetchCourses(branchId);
        console.log('Fetched courses:', courses);
        const course = courses.find(c => c.id === Number(courseId));
        setCourseName(course ? course.name : 'Course Not Found');
      } catch (error) {
        console.error('Error fetching data:', error);
        setFetchError(error.message || 'Failed to load questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [universityId, programId, branchId, courseId, fetchPyqsForPath]);

  useEffect(() => {
    const loadComments = async () => {
      if (pyqs.length > 0) {
        setLoading(true);
        try {
          for (const question of pyqs) {
            if (!comments[question.id]) {
              console.log(`Fetching comments for pyqId: ${question.id}`);
              await fetchComments(question.id, token);
            }
          }
        } catch (error) {
          console.error('Error loading comments:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadComments();
  }, [pyqs, fetchComments, comments, token]);

  const sortedPyqs = [...pyqs].sort((a, b) => (b.year || b.uploaded_at || b.id) - (a.year || a.uploaded_at || a.id));

  const toggleRow = (questionId) => {
    setExpandedRow(expandedRow === questionId ? null : questionId);
    setNewComment('');
    setEditingComment(null);
    setRatings((prev) => ({ ...prev, [questionId]: 0 }));
  };

  const handleRating = (questionId, rating) => {
    setRatings((prev) => ({ ...prev, [questionId]: rating }));
  };

  const hasUserCommented = useCallback(
    (questionId) => {
      const questionComments = comments[questionId];
      return Array.isArray(questionComments) && questionComments.some((comment) => comment.user_id === user?.id);
    },
    [comments, user]
  );

  const submitComment = async (questionId) => {
    if (!token) {
      alert('Please log in to comment or rate.');
      return;
    }
    if (!newComment.trim() && !ratings[questionId]) return;

    try {
      if (editingComment && editingComment.questionId === questionId) {
        await updateComment(questionId, editingComment.commentId, newComment, ratings[questionId] || editingComment.rating, token);
        setEditingComment(null);
      } else if (!hasUserCommented(questionId)) {
        await addComment(questionId, { rating: ratings[questionId] || 0, text: newComment }, token);
      } else {
        alert('You can only edit or delete your existing comment.');
        return;
      }
      setNewComment('');
      setRatings((prev) => ({ ...prev, [questionId]: 0 }));
    } catch (err) {
      console.error('Submit comment error:', err);
      alert(`Failed to ${editingComment ? 'update' : 'save'} comment: ${err.message || 'Unknown error'}`);
    }
  };

  const startEditingComment = (comment) => {
    if (!token) {
      alert('Please log in to edit your comment.');
      return;
    }
    setEditingComment({ questionId: comment.pyq, commentId: comment.id, rating: comment.rating });
    setNewComment(comment.comment || '');
    setRatings((prev) => ({ ...prev, [comment.pyq]: comment.rating }));
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) {
      alert('Please log in to delete.');
      return;
    }
    if (!commentId) {
      console.error('handleDeleteComment: commentId is undefined');
      alert('Cannot delete comment: No valid ID provided');
      return;
    }
    try {
      console.log(`handleDeleteComment: Deleting comment with ID ${commentId} for pyqId ${expandedRow}`);
      await deleteComment(expandedRow, commentId, token);
      setEditingComment(null);
      setNewComment('');
      setRatings((prev) => ({ ...prev, [expandedRow]: 0 }));
    } catch (err) {
      console.error('Delete comment error:', err);
      alert('Failed to delete comment: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDownload = (fileUrl) => {
    if (!fileUrl) {
      console.error('No file URL provided for download');
      return;
    }
    const absoluteUrl = fileUrl.startsWith('http') ? fileUrl : `${API_URL}${fileUrl}`;
    const link = document.createElement('a');
    link.href = absoluteUrl;
    link.download = absoluteUrl.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderAverageStars = (averageRating) => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;

    for (let i = 1; i <= fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-yellow-500" />);
    }
    if (hasHalfStar && fullStars < 5) {
      stars.push(<Star key="half" className="w-4 h-4 text-yellow-500 half-star" />);
    }
    for (let i = stars.length + 1; i <= 5; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-gray-400" />);
    }
    return stars;
  };

  return (
    <div className="mt-20 px-14">
      <style>
        {`
          .half-star {
            position: relative;
            overflow: hidden;
            width: 50%;
          }
          .half-star::before {
            content: '★';
            position: absolute;
            color: #facc15;
          }
        `}
      </style>
      <h1 className="text-2xl text-center mb-6  md:text-3xl text-dark-blue font-bold">{courseName}</h1>
      {fetchError && <p className="text-red-500 text-center mb-4">{fetchError}</p>}
      {(pyqError || ratingError) && (
        <p className="text-red-500 text-center mb-4">{pyqError || ratingError}</p>
      )}
      {loading ? (
        <p className="text-center">Loading questions...</p>
      ) : sortedPyqs.length > 0 ? (
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
            {sortedPyqs.map((question, index) => {
              const avgRating = calculateAverageRating(comments[question.id]);
              return (
                <React.Fragment key={question.id}>
                  <TableRow>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{question.year || 'N/A'}</TableCell>
                    <TableCell>
                      <Button className="text-white bg-gradient-to-br from-purple-600 to-blue-600/70 hover:bg-gradient-to-br hover:from-purple-700 hover:to-blue-700/70 border-none" onClick={() => handleDownload(question.file_url || question.fileUrl)}>Download</Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm text-gray-700">
                          Avg: {avgRating || 'N/A'}
                        </span>
                        <div className="flex gap-1">
                          {renderAverageStars(parseFloat(avgRating) || 0)}
                        </div>
                        <Button className="text-white bg-gradient-to-br from-purple-600 to-blue-600/70 hover:bg-gradient-to-br hover:from-purple-700 hover:to-blue-700/70 border-none" onClick={() => toggleRow(question.id)}>Rate</Button>
                      </div>
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
                            ) : Array.isArray(comments[question.id]) && comments[question.id].length > 0 ? (
                              comments[question.id].map((comment) => (
                                <Comment
                                  key={comment.id}
                                  comment={comment}
                                  onEdit={startEditingComment}
                                  onDelete={() => handleDeleteComment(comment.id)}
                                />
                              ))
                            ) : (
                              <p>No comments yet.</p>
                            )}
                          </div>
                          {token ? (
                            !hasUserCommented(question.id) || editingComment?.questionId === question.id ? (
                              <div>
                                <div className="flex gap-3 mb-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`cursor-pointer ${ratings[question.id] >= star ? 'text-yellow-500' : 'text-gray-400'}`}
                                      onClick={() => handleRating(question.id, star)}
                                    />
                                  ))}
                                </div>
                                <Textarea
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  placeholder={editingComment?.questionId === question.id ? 'Edit your comment...' : 'Write a comment...'}
                                  className="mb-2"
                                />
                                <Button className="text-white bg-gradient-to-br from-purple-600 to-blue-600/70 hover:bg-gradient-to-br hover:from-purple-700 hover:to-blue-700/70 border-none" onClick={() => submitComment(question.id)}>
                                  {editingComment?.questionId === question.id ? 'Save Edit' : 'Post Comment'}
                                </Button>
                              </div>
                            ) : (
                              <p className="text-gray-500">You have already commented and rated this question. Edit or delete it above.</p>
                            )
                          ) : (
                            <p className="text-gray-500">Please log in to leave a comment or rating.</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-red-500">No questions found for this course.</p>
      )}
    </div>
  );
};

export default QuestionsList;