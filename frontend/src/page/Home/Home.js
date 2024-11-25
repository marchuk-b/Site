import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthProvider';
import axios from 'axios';
import Post from '../../components/Post'; // Import the Post component
import './Home.css'; // Import the CSS file

export const Home = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [newComment, setNewComment] = useState({});
  const { currentUser } = useAuth();

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsResponse = await axios.get('http://localhost:5000/api/posts/');
        const commentsResponse = await axios.get('http://localhost:5000/api/comments');
        
        setPosts(postsResponse.data);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Delete Post
  const handleDelete = async (postId) => {
    try {
        const token = localStorage.getItem('authToken'); // Fetch the token from storage
        if (!token) throw new Error('No token found');

        await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
            headers: {
                Authorization: `Bearer ${token}`, // Include the 'Bearer ' prefix
            },
        });

        setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
        console.error('Error deleting post:', error.response?.data || error.message);
    }
};


  // Add Comment
  const handleAddComment = async (postId) => {
    if (!currentUser || !newComment[postId]) return;

    const comment = {
      content: newComment[postId],
      postId,
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await axios.post('http://localhost:5000/api/comments', comment);
      setComments([...comments, response.data]);
      setNewComment((prev) => ({ ...prev, [postId]: '' }));  // Reset the input for this specific post
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Get Username
  const getUsername = (userId) => {
    return users.find((user) => user.id === userId)?.username || 'Unknown User';
  };

  return (
    <div className="container">
      <div className="space-y-8">
      {posts.map((post) => (
        <Post
            key={post._id}
            post={{
                ...post,
                authorId: post.user?._id, // Pass the user's ID as authorId
                user: post.user?.username, // Pass the user's username
            }}
            comments={comments}
            currentUser={currentUser}
            handleDelete={handleDelete}
            handleAddComment={handleAddComment}
            newComment={newComment}
            setNewComment={setNewComment}
            getUsername={getUsername}
        />
    ))}


        {posts.length === 0 && (
          <div className="no-posts">
            <p>No posts yet. Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
