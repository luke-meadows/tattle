import { useEffect, useState } from 'react';
import { db } from '../db/firebase';
import { v4 as uuidv4 } from 'uuid';
import CloseIcon from '@mui/icons-material/Close';
import firebase from 'firebase';
import '../styles/Chat.css';
import { selectUser } from '../features/userSlice';
import { useSelector } from 'react-redux';

export default function Conversation({ conversation, setActiveChat }) {
  const user = useSelector(selectUser);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    // Collect the messages from the chat Id
    db.collection('chats')
      .doc(conversation.id)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .limit(20)
      .onSnapshot((querySnapshot) => {
        var returnedMessages = [];
        querySnapshot.forEach((doc) => {
          returnedMessages.push(doc.data());
        });
        setMessages(returnedMessages);
      });
  }, []);

  function sendMessage(e) {
    e.preventDefault();
    db.collection('chats')
      .doc(conversation.id)
      .collection('messages')
      .doc()
      .set({
        message: messageText,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        owner: user.uid,
      });
    setMessageText('');
  }

  return (
    <div>
      <div className="conversation">
        <div className="conversation__top">
          <h6>{conversation.participant}</h6>
          <CloseIcon onClick={() => setActiveChat(null)} />
        </div>
        <div className="conversation__messages">
          {messages.map((message) => {
            const key = uuidv4();
            return (
              <p
                key={key}
                className={
                  message.userId === user.uid
                    ? 'message sent'
                    : 'message received'
                }
              >
                {message.message}
              </p>
            );
          })}
        </div>
        <form action="" onSubmit={sendMessage}>
          <input
            placeholder="Say something"
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
      {/* )} */}
    </div>
  );
}