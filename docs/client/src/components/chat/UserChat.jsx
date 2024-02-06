/* eslint-disable react/prop-types */
import { useFetchRecipientUser } from "../../hooks/useFetchRecipients";
import { Stack } from "react-bootstrap";
import Avatar from "../../assets/Avatar.svg"
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { unreadNotificationsFunc  } from "../../utils/unreadNotifications";
import { useFetchLatestMessage } from "../../hooks/useFetchLatestMessage";
import moment from "moment";

const UserChat = ({ chat, user }) => {
    const { recipientUser } = useFetchRecipientUser(chat, user);
    const { onlineUsers, notifications,markChatAsRead } = useContext(ChatContext)

    const { latestMessage } = useFetchLatestMessage(chat)
    const unreadNotifications = unreadNotificationsFunc(notifications)
    const thisUserNotifications = unreadNotifications?.filter(
        n => n.senderId == recipientUser?._id   
    )
        console.log("unreadnotifications", unreadNotifications)
        console.log("thisusernotifications", thisUserNotifications)
    const isOnline =  onlineUsers?.some((user) => user?.userId === recipientUser?._id)
    
    const truncateText = (text) =>{
        let shortText = text.substring(0, 20);

        if(text?.length > 20){
           shortText = shortText + "..." ;
        }
        return shortText
    } 

    return  (
        <Stack direction="horizontal" gap={3} className="user-card align-items-center p-2 justify-content-between" role ="button" onClick={()=>{
            if(thisUserNotifications?.length !== 0) {
                markChatAsRead(thisUserNotifications,notifications)
            }
        }}>
            <div className="d-flex">
                <div className="me-2">
                 <img src={Avatar} height="35px"></img>
                </div>
                <div className="text-content">
                    <div className="name">{recipientUser?.name}</div>
                    <div className="text">{latestMessage?.text && (
                        <span>{truncateText(latestMessage?.text)}</span>)
                        }</div>
                </div>
            </div>
            <div className="d-flex flex-column align-items-end">
            <div className="date">{moment(latestMessage?.createdAt).calendar()}</div>
            <div className={thisUserNotifications?.length > 0 ? "this-user-notifications" : '' }>
            {thisUserNotifications.length > 0 ? thisUserNotifications?.length : "" }
            </div>
            <span className={isOnline ? "user-online" : ""}></span>
            </div>
        </Stack> 
    )
}
 
export default UserChat;