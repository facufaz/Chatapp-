import { createContext, useCallback, useEffect, useState } from "react";
import { postRequest, baseUrl  } from "../utils/services";

export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
    const [user, setUser] = useState();
    const [registerError, setRegisterError] = useState(null);
    const [registerIsLoading, setRegisterIsLoading] = useState(false);
    const [registerInfo, setRegisterInfo] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [loginError, setLoginError] = useState(null);
    const [loginIsLoading, setLoginIsLoading] = useState(false);
    const [loginInfo, setLoginInfo] = useState({
        email: "",
        password: ""
    });

    useEffect(() => {
        const user = localStorage.getItem("User");
        if(user) {
            setUser(JSON.parse(user));
            }
        },[])

    const updateRegisterInfo = useCallback((info) => {
        setRegisterInfo(info);
    },[])
    
    const updateLoginInfo = useCallback((info) => {
        setLoginInfo(info);
    },[])
    
    const registerUser = useCallback(async (e) => {
        e.preventDefault();
        setRegisterIsLoading(true);
        
        const response =  await postRequest(`${baseUrl}/users/register`,JSON.stringify(registerInfo)
        );
        setRegisterIsLoading(false);

        if(response.error) {
            return setRegisterError(response);
        }
        localStorage.setItem("User", JSON.stringify(response));
        setUser(response);
        
        },[registerInfo]);

        const loginUser = useCallback(async(e) => {
            e.preventDefault();

            setLoginIsLoading(true)

            setLoginError(null)

            const response = await postRequest(`${baseUrl}/users/login`,JSON.stringify(loginInfo));
            
            setLoginIsLoading(false)

            if(response.error) {
                return setLoginError(response);
            } 

            localStorage.setItem("User", JSON.stringify(response));
            setUser(response);

        

        },[loginInfo])

        const logoutUser = useCallback(() => {
            localStorage.removeItem("User");
            setUser(null);
        },[]);
        
    return (
        <AuthContext.Provider value={{
            user,
            registerInfo,
            updateRegisterInfo,
            registerUser,
            registerError,
            registerIsLoading,
            logoutUser,
            loginUser,
            loginError,
            loginInfo,
            updateLoginInfo,
            loginIsLoading
            }}>
            {children}
        </AuthContext.Provider>
        );
};