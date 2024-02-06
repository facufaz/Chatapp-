/* eslint-disable no-undef */
import { useEffect, useState, useContext } from "react";
import { getRequest, baseUrl } from "../utils/services";
import { ChatContext } from "../context/ChatContext";

export const useFetchLatestMessage = ( chat ) => {
    const { newMessage, notifications} = useContext(ChatContext)
    const [ latestMessage, setLatestMessage ] = useState(null);

    useEffect(()=>{
       
        const getMessage = async () => {
                const response = await getRequest(`${baseUrl}/messages/${chat._id}`) 
                
                if(response.error){
                    return console.log("Error fetching messages...", error)
                }
                const lastMessage = response[response?.length - 1]
          
                setLatestMessage(lastMessage)
                
            }

        getMessage();
 
    },[newMessage, notifications])

    return { latestMessage }
}