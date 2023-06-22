const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nhg2oh1.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
        // await client.connect();

    const allToyUsers = client.db('toyZone').collection('users');
    
    // const indexKeys = { id:1,name: 1 }
    // const indexOptions = { name: 'toyName' };
    // const result = await allToyUsers.createIndex(indexKeys, indexOptions);

    app.get('/allUsers', async (req, res) => {
      const cursor = allToyUsers.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/allUsers/:text', async (req,res) => {
      const searchText = req.params.text;
      const result = await allToyUsers.find({
        $or: [
          { name: { $regex: searchText, $options: "i" } },
          { id: { $regex: searchText, $options: "i" } }
        ]
      }).toArray();
      res.send(result);
    })
      
      //create

    app.post('/allUsers', async (req, res) => {
        const users = req.body;
        const result = await allToyUsers.insertOne(users);
        res.send(result);
    })
    
    

    app.get('/allToys/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await allToyUsers.findOne(query);
      res.send(result);
    })

    app.get('/specific', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      const sort = { price: 1 };
      if (req.query?.email) {
        query = {email: req.query?.email}
      }
      const result = await allToyUsers.find(query).sort(sort).toArray();
      res.send(result);
    })

    app.put('/allUsers/:id', async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      console.log(user);

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedUser = {
        $set: {
          quantity: user.quantity,
          price: user.price,
          details: user.details
        }
      }
      const result = await allToyUsers.updateOne(filter, updatedUser, options);
      res.send(result);
    })

    app.delete('/allUsers/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToyUsers.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Server is running");
})

app.listen(port, () => {
    console.log(port);
})