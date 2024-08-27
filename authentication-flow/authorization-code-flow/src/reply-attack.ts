const url = "http://localhost:3000/callback?session_state=dfbade0c-a46b-47b7-81ff-e547644e5083&iss=http%3A%2F%2Flocalhost%3A8080%2Frealms%2Ffullcycle-realm&code=82286522-b5a3-4621-82fe-290f7ec4f705.dfbade0c-a46b-47b7-81ff-e547644e5083.0c383d34-84ad-4c3a-9c93-2ee48814c429";

const request1 = fetch(url);
const request2 = fetch(url);

Promise.all([request1, request2])
    .then(async responses => 
        Promise.all(responses.map(res => res.json())))
    .then(jsons => console.log(jsons));