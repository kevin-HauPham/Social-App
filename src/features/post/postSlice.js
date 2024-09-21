import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../app/apiService";
import { POSTS_PER_PAGE } from "../../app/config";
import { cloudinaryUpload } from "../../utils/cloudinary";
import { getCurrentUserProfile } from "../user/userSlice";

const initialState = {
  isLoading: false,
  error: null,
  postsById: {},
  currentPagePosts: [],
};

const slice = createSlice({
  name: "post",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    resetPosts(state, action) {
      state.postsById = {};
      state.currentPagePosts = [];
    },

    getPostsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { posts, count } = action.payload;
      posts.forEach((post) => {
        state.postsById[post._id] = post;
        if (!state.currentPagePosts.includes(post._id))
          state.currentPagePosts.push(post._id);
      });
      state.totalPosts = count;
    },

    createPostSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      const newPost = action.payload;
      if (state.currentPagePosts.length % POSTS_PER_PAGE === 0)
        state.currentPagePosts.pop();
      state.postsById[newPost._id] = newPost;
      state.currentPagePosts.unshift(newPost._id);
    },

    deletePostSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      const { post_id } = action.payload; // Assuming action.payload contains post_id to delete
      delete state.postsById[post_id]; // Remove post from postsById

      // Optionally, remove the post ID from currentPagePosts if needed
      const index = state.currentPagePosts.indexOf(post_id);
      if (index > -1) {
        state.currentPagePosts.splice(index, 1); // Remove post_id from currentPagePosts
      }

      // Optional: If you want to pop the last post when reaching the limit
      if (state.currentPagePosts.length % POSTS_PER_PAGE === 0) {
        state.currentPagePosts.pop();
      }
    },

    sendPostReactionSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { postId, reactions } = action.payload;
      state.postsById[postId].reactions = reactions;
    },
  },
});

export default slice.reducer;

export const getPosts =
  ({ userId, page = 1, limit = POSTS_PER_PAGE }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = { page, limit };
      const response = await apiService.get(`/posts/user/${userId}`, {
        params,
      });
      if (page === 1) dispatch(slice.actions.resetPosts());
      dispatch(slice.actions.getPostsSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const createPost =
  ({ content, image }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // upload image to cloudinary
      const imageUrl = await cloudinaryUpload(image);
      const response = await apiService.post("/posts", {
        content,
        image: imageUrl,
      });
      dispatch(slice.actions.createPostSuccess(response.data));
      toast.success("Post successfully");
      dispatch(getCurrentUserProfile());
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const deletePost = (post_id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.delete(`/posts/${post_id}`);
    dispatch(slice.actions.deletePostSuccess({ ...response.data, post_id }));
    toast.success("post deleted");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// export const deletePost =
//   ({ postId }) =>
//   async (dispatch) => {
//     dispatch(slice.actions.startLoading());
//     try {
//       const response = await apiService.delete(`/posts/${postId}`);
//       dispatch(slice.actions.deletePostSuccess(response.data));
//       toast.success("Post successfully");
//     } catch (error) {
//       dispatch(slice.actions.hasError(error.message));
//       toast.error(error.message);
//     }
//   };

export const sendPostReaction =
  ({ postId, emoji }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post(`/reactions`, {
        targetType: "Post",
        targetId: postId,
        emoji,
      });
      dispatch(
        slice.actions.sendPostReactionSuccess({
          postId,
          reactions: response.data,
        })
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
