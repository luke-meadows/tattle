import '../styles/Post.css';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/IosShare';
import SendIcon from '@mui/icons-material/Send';
import { Avatar } from '@mui/material';
import { useEffect, useState } from 'react';
import { getUser } from '../lib/getUser';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import handlePostLike from '../lib/handlePostLike';
import hasUserLikedPost from '../lib/hasUserLikedPost';
import useAddComment from '../hooks/useAddComment';
import FollowerCount from '../components/FollowerCount';
import { PostComments } from './PostComments';
import getPostComments from '../lib/getPostComments';
import UserProfileLink from './UserProfileLink';
export default function Post({
  text,
  image,
  likes,
  comments,
  userId,
  time,
  postId,
}) {
  // Set state for user information to be put onto post
  const [postOwner, setPostOwner] = useState('');
  const [userLikedPost, setUserLikedPost] = useState();
  const loggedInUser = useSelector(selectUser);
  const [showAddComment, setShowAddComment] = useState(false);
  const [postComments, setPostComments] = useState([]);
  const { handleChange, input, handleCommentSubmit } = useAddComment('');
  useEffect(async () => {
    // Fetch the user data (name and profile image) from the user collection using userID
    const user = await getUser(userId);
    const hasLiked = await hasUserLikedPost(postId, loggedInUser.userId);

    setUserLikedPost(hasLiked);
    setPostOwner(user);
  }, [likes]);

  // Fetch post comments
  useEffect(async () => {
    await getPostComments(postId).then((data) => {
      // Get post comments and unique post owners, then an owner for each post
      const owners = {};
      data.slice(1).forEach((owner) => {
        owners[owner.userId] = {
          profilePic: owner.profilePic,
          displayName: owner.username,
        };
      });
      const commentsWithOwners = data[0].map((comment) => {
        return { ...comment, owner: owners[comment.owner] };
      });
      setPostComments(commentsWithOwners);
    });
  }, [postId]);

  if (!postOwner) return <h1 />;
  return (
    <>
      <div className="post">
        <div className="post__header">
          {postOwner.profilePic ? (
            <img className="post__profile__pic" src={postOwner.profilePic} />
          ) : (
            <Avatar />
          )}
          <div className="post__account__info">
            <UserProfileLink user={postOwner} />
            <p>
              <FollowerCount userId={postOwner.userId} />
            </p>
            <p>{time}</p>
          </div>
        </div>
        {image && <img className="post__image" src={image} />}

        <p className="post__body">{text}</p>
        <div className="post__interaction">
          <div className="post__likes">
            <ThumbUpIcon />
            <p>{likes}</p>
          </div>
          <div className="post__comments__counter">
            <p onClick={() => setShowAddComment(!showAddComment)}>
              {comments} comment{comments === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <div className="post__icons">
          <div
            className="icon__container"
            onClick={() => handlePostLike(postId, loggedInUser.userId)}
          >
            <ThumbUpIcon
              style={userLikedPost ? { color: '#0a66c2' } : { color: 'gray' }}
            />
            <p>Like</p>
          </div>
          <div
            className="icon__container"
            onClick={() => setShowAddComment(!showAddComment)}
          >
            <CommentIcon />
            <p>Comment</p>
          </div>
          <div className="icon__container">
            <ShareIcon />
            <p>Share</p>
          </div>
          <div className="icon__container">
            <SendIcon />
            <p>Send</p>
          </div>
        </div>
        {showAddComment && (
          <div className="post__comments">
            <form
              action=""
              onSubmit={(e) =>
                handleCommentSubmit(
                  e,
                  postId,
                  loggedInUser.userId,
                  postComments,
                  setPostComments
                )
              }
            >
              <textarea
                placeholder="Comment..."
                value={input}
                onChange={handleChange}
              />
              <button type="submit">Comment</button>
            </form>

            <PostComments comments={postComments} />
          </div>
        )}
      </div>
    </>
  );
}
