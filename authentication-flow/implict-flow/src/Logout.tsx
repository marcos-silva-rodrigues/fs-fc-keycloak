import { useContext, useEffect } from "react"
import { AuthContext } from "./AuthProvider"
import { useNavigate } from "react-router-dom";

export function Logout() {
    const { makeLogoutUrl } = useContext(AuthContext);
    // const navigate = useNavigate()

    useEffect(() => {
        const url = makeLogoutUrl()
        if (url) {
            window.location.href = url;
        }
        
    }, [makeLogoutUrl])
    return <div>loading...</div>
}