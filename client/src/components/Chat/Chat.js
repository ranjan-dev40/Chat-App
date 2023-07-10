import React, { useState,useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import io from 'socket.io-client';
import './Chat.css';

import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages'
import TextContainer from '../TextContainer/TextContainer'

let socket;


const Chat = () => {

  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [users, setUsers] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const location = useLocation();
  // const ENDPOINT = process.env.REACT_APP_ASSET_URL;
  const ENDPOINT = 'https://chat-app-toft.onrender.com';
  // const ENDPOINT = 'https://localhost5000;





  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setRoom(room);
    setName(name)

    socket.emit('join', { name, room }, (error) => {
      if(error) {
        alert(error);
      }
    });
  }, [ENDPOINT, location.search]);



  useEffect(() => {
    socket.on('message', message => {
      setMessages(messages => [ ...messages, message ]);
    });
    
    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });
}, []);

//  function for sending message
  
 
const sendMessage = (event) => {
  event.preventDefault();

  if(message) {
    socket.emit('sendMessage', message, () => setMessage(''));
  }
}


   console.log(message,messages);







  

   return (
    <div className="outerContainer">
      <div className="container">
          <InfoBar room={room} />
          <Messages messages={messages} name={name} />
          <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
      <TextContainer users={users}/>
    </div>
  );
}

export default Chat;
