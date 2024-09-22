import { LoadingButton } from "@mui/lab";
import React, { useEffect, useState } from "react";
import { Box, Dialog, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import PostCard from "./PostCard";
import { getPosts } from "./postSlice";
import useAuth from "../../hooks/useAuth";
import { deletePost } from "./postSlice";
import EditPostForm from "./EditPostForm";

function PostList({ userId }) {
  const [page, setPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const { user } = useAuth();
  const { currentPagePosts, postsById, isLoading, totalPosts } = useSelector(
    (state) => state.post
  );
  const posts = currentPagePosts.map((postId) => postsById[postId]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (userId) dispatch(getPosts({ userId, page }));
  }, [dispatch, userId, page]);

  const handleDelete = (post_id, post_athor_id) => {
    if (window.confirm("Delete the item?")) {
      if (user._id === post_athor_id) {
        dispatch(deletePost(post_id));
      }
    }
  };

  // Open the edit modal for the clicked post
  const handleEdit = (post) => {
    setPostToEdit(post); // Set the post that is being edited
    setIsEditModalOpen(true);
  };

  // Close the edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setPostToEdit(null); // Reset after closing the modal
  };
  return (
    <>
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          handleDelete={() => {
            handleDelete(post._id, post.author._id);
          }}
          handleEdit={() => handleEdit(post)}
        />
      ))}
      <Dialog open={isEditModalOpen} onClose={handleCloseEditModal}>
        {postToEdit && (
          <EditPostForm
            post={postToEdit} // Pass the current post data to the form
            onClose={handleCloseEditModal} // Pass the close function to the form
          />
        )}
      </Dialog>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        {totalPosts ? (
          <LoadingButton
            variant="outlined"
            size="small"
            loading={isLoading}
            onClick={() => setPage((page) => page + 1)}
            disabled={Boolean(totalPosts) && posts.length >= totalPosts}
          >
            Load more
          </LoadingButton>
        ) : (
          <Typography variant="h6">No Post Yet</Typography>
        )}
      </Box>
    </>
  );
}

export default PostList;
