import React, { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { useDispatch } from "react-redux";
import { editPost } from "./postSlice";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";

function EditPostForm({ post, onClose }) {
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState(null); // To store the new image
  const dispatch = useDispatch();
  const { user } = useAuth();
  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Handle form submission to edit the post
  const handleSubmit = (e) => {
    if (user._id === post.author._id) {
      e.preventDefault();
      const data = {
        content,
        image,
      };

      // Dispatch the action to update the post
      dispatch(editPost(post._id, content, image));
    }
    onClose(); // Close the modal after submission
  };

  return (
    <Box sx={{ padding: 2 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Edit Content"
          multiline
          rows={4}
          fullWidth
          margin="normal"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <Button variant="contained" component="label">
          Upload New Image
          <input type="file" hidden onChange={handleImageChange} />
        </Button>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose} color="secondary" sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Edit
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default EditPostForm;
