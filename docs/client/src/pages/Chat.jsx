/* eslint-disable no-unused-vars */
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { Container, Stack } from "react-bootstrap";
import UserChat from "../components/chat/UserChat";
import {AuthContext} from "../context/AuthContext";
import PotentialChats from "../components/chat/PotentialChats";
import ChatBox from "../components/chat/ChatBox";

const Chat = () => {

    const { user } = useContext( AuthContext);
    const { userChats, isUserChatsLoading, updateCurrentChat, userChatsError } = useContext( ChatContext );

  
  return (
    <Container>
    <PotentialChats/>
     {userChats?.length < 1 ? null : (
        <Stack direction="horizontal" gap={4} className="align-items-start">
          <Stack className="message-box flex-grow-0 pe-3" gap={3}>
            {isUserChatsLoading && <p>Loading Chats...</p>}
            {userChats?.map((chat,index) => (
              <div key={index} onClick={() => updateCurrentChat(chat)}>
                <UserChat chat={chat} user={user} />
              </div>
              ))
            }
          </Stack>
          <ChatBox className="chat-box-box"/>
        </Stack>
      )}
    </Container>
  );}

 
export default Chat;