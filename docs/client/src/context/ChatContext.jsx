/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { createContext, useState, useEffect, useCallback } from "react";  
import { baseUrl, getRequest, postRequest  } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext()

export const ChatContextProvider = ({ children, user }) => {    
    const [userChats, setUserChats] = useState([]);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false); 
    const [userChatsError, setUserChatsError] = useState(null); 
    const [potentialChats, setPotentialChats ] = useState([]); 
    const [currentChat, setCurrentChat] = useState(null);
    const [ messages, setMessages ] = useState([])
    const [ isMessagesLoading, setIsMessagesLoading ] = useState(false)
    const [ messagesError, setMessagesError ] = useState(null)
    // eslint-disable-next-line no-unused-vars
    const [ sendTextMessageError, setSendTextMessageError ] = useState(null)
    const [ newMessage, setNewMessage ] = useState("") 
    const [ socket, setSocket ] = useState(null)
    const [ onlineUsers, setOnlineUsers ] = useState([])
    const [ notifications, setNotifications ] = useState([])
    const [ allUsers, setAllUsers ] = useState([])


    console.log("Notifications", notifications)

    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket)

        return() => {
            newSocket.disconnect()
        }
    },[user])

// online users
    useEffect(() => {
        if(socket === null) return;
        socket.emit("addNewUser", user?._id);
        socket.on("getOnlineUsers", (res)=>{
            setOnlineUsers(res)
        });


    }, [socket]);
   
// send message
    useEffect(() => {
        if(socket === null) return;

        const recipientId = currentChat?.members?.find(id => id !== user?._id)

        socket.emit("sendMessage", {...newMessage, recipientId});
   
    }, [newMessage]);

// recieve messages and notification

    useEffect(() => {
        if(socket === null) return;

        socket.on("getMessage", (res) => {
            if(currentChat?._id !== res.chatId) return;
            
             setMessages((prev) => [...prev, res]);
        })

        socket.on("getNotification", (res) => {
            const isChatOpen = currentChat?.members.some((id) => id === res.senderId)
        
            if(isChatOpen){
                setNotifications((prev) => [{...res, isRead: true}, ...prev])
            }else {
                setNotifications(prev => [res, ...prev])
            }
        })

        return () => {
            socket.off("getMessage")
            socket.off("getNotification")
        }
    }, [socket, currentChat]);

    useEffect(() => {
        const getUsers = async () => {
            const response = await getRequest(`${baseUrl}/users`);
        
            if(response.error){
                return console.log( "Error fetching Users", response)
            }
           
            
           const pChats = response.filter((u) => {
                let isChatCreated = false

                if(user?._id === u._id) return false

                if(userChats){
                    isChatCreated = userChats?.some((chat) =>{
                        return chat.members[0] === u._id || chat.members[1] === u._id
                    })
                }
                return !isChatCreated
            })
            setPotentialChats(pChats)
            setAllUsers(response)
        }
        getUsers();
    },[userChats])

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat)
    }, [])

    const createChat = useCallback(async(firstId, secondId) => {
        const response = await postRequest(
            `${baseUrl}/chats`,JSON.stringify({
                firstId,
                secondId
            }))
            if(response.error){
                return console.log( "Error creating Chat", response)
            }
            setUserChats((prev) => [...prev, response])
    },[])


        useEffect(() => {
        const getUserChats = async () => {
            if(user?._id){
                setIsUserChatsLoading(true);
                setUserChatsError(null);
               
                const response = await getRequest(`${baseUrl}/chats/${user?._id}`);
         
              
                setIsUserChatsLoading(false);

                if(response.error){
                    return setUserChatsError(response); 
                }
                  setUserChats(response);
               
            }
        }
      
        getUserChats();
        },[user, notifications]);
        
        useEffect(() => {
            const getMessages = async () => {
                if(user?._id){
                    setIsMessagesLoading(true);
                    setMessagesError(null);
                   
                    const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);
             
                  
                    setIsMessagesLoading(false);
    
                    if(response.error){
                        return setMessagesError(response); 
                    }
                    setMessages(response);
                   
                }
            }
          
            getMessages();
            },[currentChat]);

            const sendTextMessage = useCallback(
                async(textMessage, sender, currentChatId, setTextMessage) => {

                if(!textMessage) return console.log("you must type something...")

                const response = await postRequest(
                    `${baseUrl}/messages`,
                     JSON.stringify({
                    chatId: currentChatId,
                    senderId: sender._id,
                    text : textMessage
                }))
                if(response.error){
                    return setSendTextMessageError(response); 
                }
                setNewMessage(response)
                setMessages((prev) => [...prev, response])
                setTextMessage(" ")
           
            },[] )

            const markAllNotificationsAsRead = useCallback((notifications) => {
                const mNotifications = notifications.map(n => {
                    return {...n, isRead:true}
                })
                setNotifications(mNotifications)
            }, [])

            const markNotificationsAsRead = useCallback(
                (n, userChats, user, notifications) => {

                const desiredChats = userChats.find( chat => {
                    const chatMembers = [user._id, n.senderId];
                    const isDesiredChat = chat?.members?.every((members) => {
                        return chatMembers.includes(members)
                    })
                    return isDesiredChat
                })
                const nNotification = notifications.map(el => {
                    if(n.senderId === el.senderId){
                        return {...n, isRead: true}
                    }else{
                        return el
                    }
                })

                updateCurrentChat(desiredChats)
                setNotifications(nNotification)
            }, []
            )

            const markChatAsRead = useCallback(
                (thisUserNotifications, notifications) => {
                    const mNotifications = notifications.map( el => {
                        let notification

                        thisUserNotifications.forEach(n => {
                        if(n.senderId == el.senderId){
                            notification= {...n, isRead: true}
                        }else{
                            notification = el
                        }
                        })
                        return notification
                    })

                    setNotifications(mNotifications)
                },[]) 

    return (
    <ChatContext.Provider 
      value={{
        userChats,
        isUserChatsLoading,
        userChatsError,
        potentialChats,
        createChat,
        currentChat,
        updateCurrentChat,
        messages,
        messagesError,
        isMessagesLoading,
        sendTextMessage,
        onlineUsers,
        notifications,
        allUsers,
        markAllNotificationsAsRead,
        markNotificationsAsRead,
        markChatAsRead
        }}>
         {children}
         </ChatContext.Provider>
    )
};