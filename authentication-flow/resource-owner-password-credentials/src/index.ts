import express, { application } from 'express';
import crypto from "crypto"
import session from "express-session";
import jwt from "jsonwebtoken";

const app = express();
const memoryStore = new session.MemoryStore();
app.use(express.urlencoded({
    extended: true
}));

app.use(
  session({
    secret: "my-secret",
    resave: false,
    saveUninitialized: false,
    store: memoryStore,
    //expires
  })
);

app.get("/login", (req, res) => {
    return res.sendFile(__dirname + "/login.html");
});

app.post("/login", async (req, res) => {
    const {
        username,
        password
    } = req.body;
    
    const body = new URLSearchParams({
        client_id: "fullcycle-client",
        grant_type: "password",
        username: username,
        password: password,
        scope: "openid"
    })

    const response = await fetch("http://keycloak:8080/realms/fullcycle-realm/protocol/openid-connect/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString()
    });

    const result = await response.json();

    // @ts-expect-error
    req.session.user = result;
    req.session.save();

    res.json(result);
});

app.get("/logout", async (req, res) => {
    // const logout = new URLSearchParams({
    //     //@ts-expect-error
    //     id_token_hint: req.session.user.id_token,
    //     post_logout_redirect_uri: "http://localhost:3000/login",
    // });

    // req.session.destroy(err => console.error(err));

    // return res.redirect(
    //     "http://keycloak:8080/realms/fullcycle-realm/protocol/openid-connect/logout"
    //         .concat(logout.toString())
    // )

    const revokeData = new URLSearchParams({
        client_id: "fullcycle-client",
        //@ts-expect-error
        token: req.session.user.refreshToken
    });

    const revokeUrl = "http://keycloak:8080/realms/fullcycle-realm/protocol/openid-connect/revoke";
    const response = await fetch(revokeUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: revokeData.toString()
    });

    return res.redirect("/login")
})

app.get("/callback", async (req, res) => {
    console.log(req.query);
    const bodyParams = new URLSearchParams({
        client_id: "fullcycle-client",
        grant_type: "authorization_code",
        code: req.query.code as string,
        redirect_uri: "http://localhost:3000/callback"
    });
    const url = "http://keycloak:8080/realms/fullcycle-realm/protocol/openid-connect/token";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: bodyParams.toString()
    })

    const result = await response.json();
    const accessToken = jwt.decode(result.access_token) ;
    const refreshToken = jwt.decode(result.refresh_token);
    const idToken = jwt.decode(result.id_token) as any;
    console.log({
        accessToken,
        refreshToken,
        idToken
    });

    //@ts-expect-error
    if (idToken.nonce !== req.session.nonce) {
        return res.status(401).json({
            message : "Unathenticated"
        })
    }

    //// @ts-expect-error
    // if (idToken.state !== req.session.state) {
    //     return res.status(401).json({
    //         message : "Unathenticated"
    //     })
    // }

    res.json(result);
});

app.listen(3000, () => {
    console.log("Listening on port 3000")
});