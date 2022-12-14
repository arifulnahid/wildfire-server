const express = require("express");
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const app = express();

require("dotenv").config();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.af5crdw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const db = client.db("wildFireDB");
        const serviceCollection = db.collection("service");
        const reviewCollection = db.collection("review");

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

        app.post("/review", async (req, res) => {
            const ratingData = req.body;
            const result = await reviewCollection.insertOne(ratingData).sort({ date: -1 })
            res.json(result)
        });

        app.delete("/review/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = reviewCollection.deleteOne(query);
            res.json(result);
        })

        app.get("/review/:id", async (req, res) => {
            const id = req.params.id;
            const query = { serviceId: id }
            const sort = { date: -1 }
            const cursor = reviewCollection.find(query).sort(sort);
            const review = await cursor.toArray();
            res.json(review)
        })

        app.get("/myreview/:id", async (req, res) => {
            const id = req.params.id;
            const query = { uid: id }
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.json(review)
        });


        app.patch("/review/:id", async (req, res) => {
            const id = req.params.id;
            const rating = req.body;
            const query = { _id: ObjectId(id) }
            const review = await reviewCollection.findOne(query);
            const updateDoc = {
                $set: {
                    rating: rating.rating,
                    review: rating.review,
                    date: rating.date,
                    displayName: review.displayName,
                    photoURL: review.photoURL,
                    uid: review.uid,
                    serviceId: review.serviceId
                }
            }
            const result = await reviewCollection.updateOne(query, updateDoc)

            console.log(rating);
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
