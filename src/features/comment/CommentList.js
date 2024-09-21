import React, { useEffect } from "react";

import { Pagination, Stack, Typography } from "@mui/material";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { deleteComment, getComments } from "./commentSlice";
import CommentCard from "./CommentCard";
import LoadingScreen from "../../components/LoadingScreen";
import { COMMENTS_PER_POST } from "../../app/config";
import useAuth from "../../hooks/useAuth";

function CommentList({ postId }) {
  const {
    commentsByPost,
    commentsById,
    totalComments,
    isLoading,
    currentPage,
  } = useSelector(
    (state) => ({
      commentsByPost: state.comment.commentsByPost[postId],
      totalComments: state.comment.totalCommentsByPost[postId],
      currentPage: state.comment.currentPageByPost[postId] || 1,
      commentsById: state.comment.commentsById,
      isLoading: state.comment.isLoading,
    }),
    shallowEqual
  );
  const totalPages = Math.ceil(totalComments / COMMENTS_PER_POST);
  const dispatch = useDispatch();

  useEffect(() => {
    if (postId) dispatch(getComments({ postId }));
  }, [postId, dispatch]);

  const { user } = useAuth();
  const handleDeleteComment = (commentId, commentAuthorID, postId) => {
    if (window.confirm("Delete commnent?")) {
      if (user._id === commentAuthorID) {
        dispatch(deleteComment({ commentId, postId }));
      }
    }
  };

  let renderComments;

  if (commentsByPost) {
    if (commentsByPost) {
      const comments = commentsByPost.map(
        (commentId) => commentsById[commentId]
      );
      console.log("comments", comments);
      renderComments = (
        <Stack spacing={1.5}>
          {comments.map((comment) => {
            console.log("vvvv", comment);
            return (
              <CommentCard
                key={comment._id}
                comment={comment}
                handleDeleteComment={() => {
                  handleDeleteComment(
                    comment._id,
                    comment.author._id,
                    comment.post
                  );
                }}
              />
            );
          })}
        </Stack>
      );
    } else {
      <button>lll</button>;
    }
  } else if (isLoading) {
    renderComments = <LoadingScreen />;
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="subtitle" sx={{ color: "text.secondary" }}>
          {totalComments > 1
            ? `${totalComments} comments`
            : totalComments === 1
            ? `${totalComments} comment`
            : "No comment"}
        </Typography>
        {totalComments > COMMENTS_PER_POST && (
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => dispatch(getComments({ postId, page }))}
          />
        )}
      </Stack>
      {renderComments}
    </Stack>
  );
}

export default CommentList;
