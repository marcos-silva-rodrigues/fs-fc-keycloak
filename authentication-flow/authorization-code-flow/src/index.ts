import express from 'express';
import crypto from "crypto"
import session from "express-session";
import jwt from "jsonwebtoken";

const app = express();
const memoryStore = new session.MemoryStore();

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

    const nonce = crypto.randomBytes(16).toString("base64");
    const state = crypto.randomBytes(16).toString("base64");
    
    // @ts-expect-error - type mismatch
    req.session.nonce = nonce;
    // @ts-expect-error - type mismatch
    req.session.state = state;
    req.session.save();

    const loginParams = new URLSearchParams({
        client_id: "fullcycle-client",
        redirect_uri: "http://localhost:3000/callback",
        response_type: "code",
        scope: "openid",
        nonce,
        state
    });
    const url = "http://localhost:8080/realms/fullcycle-realm/protocol/openid-connect/auth?"+loginParams.toString();
    console.log(url);
    res.redirect(url);
});

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