import { LoadingButton } from "@mui/lab";
import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import PostCard from "./PostCard";
import { editPost, getPosts } from "./postSlice";
import useAuth from "../../hooks/useAuth";
import { deletePost } from "./postSlice";

function PostList({ userId }) {
  const [page, setPage] = useState(1);
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
    if (user._id === post_athor_id) {
      dispatch(deletePost(post_id));
    }
  };
  const handleEdit = (post_id, post_athor_id, content, image) => {
    console.log("post_id", post_id);
    if (user._id === post_athor_id) {
      dispatch(editPost(post_id, { content: "llll", image: "" }));
    }
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
          handleEdit={() => {
            handleEdit(post._id, post.author._id, post.content, post.image);
          }}
        />
      ))}
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
