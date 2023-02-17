const { MongoClient, ObjectId } = require("mongodb");
// establish a connection with mongodb
const uri =
    "mongodb+srv://ad1581:Adelmar123@cluster0.nlwvzii.mongodb.net/?retryWrites=true&w=majority"; //uri for mongodb
var client = new MongoClient(uri);

async function connect() {
    // try to establish a connection with the mongodb
    try {
        await client.connect().then(() => console.log("connected to mongodb"));
    } catch (e) {
        console.log("error while connecting to mongodb", e);
    }
}

connect();

// defining all the functions responsible for contacting mongodb and doing database transactions
async function createOrder(order) {
    return await client.db("app").collection("orders").insertOne(order);
}
async function getLessons() { // retrieves data from mongodb via node.js which the client that finds all the collections 
    return client
        .db("app")
        .collection("lessons")
        .find().toArray(); // the array method is used to convert the lesson information
}

async function updateLesson(id, space) { // The mongodb allows the two function of the unique id of the lessons and the spaces to be updated.
    // this function weather the database lessons has been updated
    return await client
        .db("app")
        .collection("lessons")
        .updateOne({ _id: new ObjectId(id) }, { $inc: { "space": -space } });
}

async function searchLesson(searchL) { // search lesson function allows the mongodb used to search for the lessons matching in the database from the collections
    return client
        .db("app")
        .collection("lessons")
        .find({
            topic: { $regex: searchL, $options: "is" },
        })
        .toArray();
}

// setting up express server
const express = require("express");
var cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors()); // enabling CORS to avoid CORS error between frontend and backend

// defining middlewares
const logger = function(req, res, next) {
    console.log(`Request for ${req.originalUrl}`);
    next();
};
// registering middlewares
app.use(logger);
app.use("/public", express.static(__dirname + "/public")); // inbuild "static" middleware to serve course images

// Defining api routes // ASYNC allows the perform updates which can delay time to the thread exuction 
app.get("/api/lesson", async(req, res) => { // the req respresents the http request for the express.js
    const result = await getLessons();
    res.send(result); // sends the http 
});

app.post("/api/order", async(req, res) => { // Post allows the requests to api and order 
    const result = await createOrder(req.body); // when creating order the function waits for the user to pass a response to the api then allows a response when it's available.
    res.send({
        msg: `Reservation with id [${result.insertedId}] has been created successfully!`, // Once selected a lesson
    });
});

app.put("/api/lesson/:id", async(req, res) => { // This allows the id of the lessons to be updated from this section which passes the lessons through the req/body/space  which the function sends a response to the user.
    const result = await updateLesson(req.params.id, req.body.space);
    res.send({
        msg: `Spaces in the lesson [id: ${req.params.id}] updated after successful order`, // The route allows the collection to update the x amount of lesson
    });
});
app.get("/api/search/:searchL", async(req, res) => {
    const result = await searchLesson(req.params.searchL);
    res.send(result);
});
app.get("/", async(req, res) => {
    res.sendFile(__dirname + "/main.html");
});
// PORT
const PORT = process.env.PORT || 3000;

// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});