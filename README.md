# Notes App

This practice app allows users to save notes, and features basic user administration. It's built with React, Express, and Mongoose, and is a part of University of Helsinki's [Full Stack Open](https://fullstackopen.com/en/).

You can experiment with a live version at: https://bitter-water-3801.fly.dev/. Use `guest` as username and `secret` as password.

![Demo](demo.gif)

## Setup

To run the app (locally), you'll need a MongoDB database. While you can host your own database, you can also create one in the cloud for free at MongoDB Atlas — sign up for an account and deploy a shared cluster. For simplicity, authenticate the database with username and password and also allow access from all IP addresses. Then, grab the connection string URI, which should look something like the following.

```
mongodb+srv://<username>:<password>@cluster0.o1opl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```

Replace `<username>` and `<password>` with the database credentials and `myFirstDatabase` with `notesApp`. Then, create a `.env` file in the server folder (replacing the URI appropriately).

```
# .env
MONGODB_URI=mongodb+srv://fullstack:secret@cluster0.o1opl.mongodb.net/notesApp?retryWrites=true&w=majority
PORT=3001
SECRET=secret
```

The last line is concerned with setting a secret key for user administration. Be sure it's a secure value (not `secret`).

Finally, run `npm install && npm start` in the server folder to start the backend, and the same command in the client folder to start the frontend.

## Additional notes

The ability to create a user is not built into the frontend, so you'll need to create a user using an API call. Use the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) and see `server/requests/create_user.rest` to do this easily.
