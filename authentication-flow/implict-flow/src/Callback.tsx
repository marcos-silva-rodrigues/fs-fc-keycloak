import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import { AuthContext } from "./AuthProvider";

export function Callback() {
    const {
        auth,
        login
    }  = useContext(AuthContext);
    const { hash } = useLocation();
    const navigate = useNavigate();
    console.log(hash);

    useEffect(() => {

        if (auth) {
            navigate("/login");
            return;
        }
        const params = new URLSearchParams(hash.replace("#", ""));

        const accessToken = params.get("access_token") as string;
        const idToken = params.get("id_token") as string;
        const state = params.get("state") as string;

        if (!accessToken || !idToken || !state) {
            navigate("/login");
            return;
        }

        login(accessToken, idToken, state)

    }, [hash, login, auth, navigate]);

    return (
        <div>
            Loading ...
        </div>
    )
}