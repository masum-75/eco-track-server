const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express ();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://ecoTrackDBuser:xMdbVkiQQnHKC70l@cluster0.1rpvn4e.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

  const db = client.db("ecoTrackDB");
    const challengesCollection = db.collection("challenges");
    const userChallengesCollection = db.collection("userChallenges");
    const tipsCollection = db.collection("tips");
    const eventsCollection = db.collection("events");


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally{
    //   await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res)=>{
    res.send("smart ecosystem is running")
});
app.listen(port , ()=>{
    console.log(`eco track server is running now on port: ${port}`)
})