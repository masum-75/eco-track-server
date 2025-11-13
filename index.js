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


    app.post("/challenges", async(req,res) =>{
        const newChallenge = req.body;
        const result = await challengesCollection.insertOne(newChallenge);
        res.send(result)
    });

   

    app.get("/challenges", async (req, res) => {
      const { category, search } = req.query;
      const filter = {};

      if (category) filter.category = category;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
    }

      const result = await challengesCollection.find(filter).sort({ createdAt: -1 }).toArray();
      res.send(result);
    });

    app.get("/challenges/:id", async (req, res) => {
      const id = req.params.id;
      const result = await challengesCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    app.put("/challenges/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      updatedData.updatedAt = new Date();

      const filter = { _id: new ObjectId(id) };
      const update = { $set: updatedData };

      const result = await challengesCollection.updateOne(filter, update);
      res.send(result);
    });
    app.delete("/challenges/:id", async (req, res) => {
      const id = req.params.id;
      const result = await challengesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post("/challenges/join/:id", async (req, res) => {
      const challengeId = req.params.id;
      const { userId, userEmail } = req.body;

      
      await challengesCollection.updateOne(
        { _id: new ObjectId(challengeId) },
        { $inc: { participants: 1 } }
      );

      const newJoin = {
        userId,
        userEmail,
        challengeId,
        status: "Not Started",
        progress: 0,
        joinDate: new Date(),
      };
      const result = await userChallengesCollection.insertOne(newJoin);
      res.send(result);
    });

    app.get("/my-challenges", async (req, res) => {
      const { email } = req.query;
      const result = await userChallengesCollection.find({ userEmail: email }).toArray();
      res.send(result);
    });

    
    app.put("/my-challenges/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const update = { $set: data };
      const result = await userChallengesCollection.updateOne(filter, update);
      res.send(result);
    });

     app.post("/tips", async (req, res) => {
      const newTip = req.body;
      newTip.createdAt = new Date();
      const result = await tipsCollection.insertOne(newTip);
      res.send(result);
    });

    app.get("/tips", async (req, res) => {
      const result = await tipsCollection.find().sort({ createdAt: -1 }).limit(5).toArray();
      res.send(result);
    });

    app.put("/tips/:id/upvote", async (req, res) => {
      const id = req.params.id;
      const result = await tipsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { upvotes: 1 } }
      );
      res.send(result);
    });

    app.post("/events", async (req, res) => {
      const newEvent = req.body;
      const result = await eventsCollection.insertOne(newEvent);
      res.send(result);
    });

    
    app.get("/events", async (req, res) => {
      const result = await eventsCollection.find().sort({ date: 1 }).limit(4).toArray();
      res.send(result);
    });

     app.get("/events/:id", async (req, res) => {
      const id = req.params.id;
      const result = await eventsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

   app.patch("/events/:id", async (req, res) => {
      const id = req.params.id;
      const update = req.body;
      const filter = { _id: new ObjectId(id) };
      const result = await eventsCollection.updateOne(filter, { $set: update });
      res.send(result);
    });

    
    app.delete("/events/:id", async (req, res) => {
      const id = req.params.id;
      const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/home", async (req, res) => {
      const challenges = await challengesCollection.find().sort({ createdAt: -1 }).limit(6).toArray();
      const tips = await tipsCollection.find().sort({ createdAt: -1 }).limit(5).toArray();
      const events = await eventsCollection.find().sort({ date: 1 }).limit(3).toArray();

      const stats = {
        totalChallenges: await challengesCollection.countDocuments(),
        totalEvents: await eventsCollection.countDocuments(),
        totalTips: await tipsCollection.countDocuments(),
      };

      res.send({ challenges, tips, events, stats });
    });
    
   

 
   


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