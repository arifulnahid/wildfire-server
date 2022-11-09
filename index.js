const express = require("express");
const cors = require('cors');
const { MongoClient, ObjectId } = require("mongodb");
const app = express();

require("dotenv").config();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
    try {
        const db = client.db("wildFireDB");
        const serviceCollection = db.collection("service");

        app.get("/service", async (req, res) => {
            const query = {}
            const limit = parseInt(req.query.limit)

            const cursor = serviceCollection.find(query, { limit: limit });
            const service = await cursor.toArray();
            res.json(service)

        });

        app.get("/service/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.json(service);
        })

        app.post("/service-add", async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            console.log(result);
            res.send(result);
        });

        app.patch("/service/:id", async (req, res) => {
            const id = req.params.id;
            const rating = req.body;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            const updateDoc = {
                $set: {
                    rating: [...service.rating, rating]
                }
            }
            const result = await serviceCollection.updateOne(query, updateDoc)
            // console.log(ratingData);
            res.json(result);
        })
    } finally {

    }
}

run().catch(e => console.log(e));

app.get("/", (req, res) => {
    res.send("WildFire Server is Running");
});

app.listen(port, () => {
    console.log("Server Running On", port);
})
