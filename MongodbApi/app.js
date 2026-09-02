//express server with MongoDB connection and CRUD operations for a journal API
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;

app.use(express.json());

// MongoDB connection
const mongoUrl = 'mongodb://admin:admin123@localhost:27017/?authSource=admin';
const client = new MongoClient(mongoUrl);
let collection;

async function startServer() {
    await client.connect();
    //create a database called 'journals' and a collection called 'entries'
    const db = client.db('journals');
    collection = db.collection('entries');
    app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
}

//Post journal entry
app.post('/api/journal', async (req, res) => {
    const entry = { ...req.body, createdAt: new Date() };
    const result = await collection.insertOne(entry);
    res.status(201).json(result);
});

app.get('/api/journal', async (req, res) => {
    const entries = await collection.find().toArray();
    res.json(entries);
});

//: if it exists, return it, else return 404
app.get('/api/journal/:id', async (req, res) => {
    try {
        const entry = await collection.findOne({ _id: new ObjectId(req.params.id) });
        if (!entry) return res.status(404).json({ error: 'Not found' });
        res.json(entry);
    } catch {
        res.status(400).json({ error: 'Invalid ID' });
    }
});

app.put('/api/journal/:id', async (req, res) => {
    try {
        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        res.json(result);
    } catch {
        res.status(400).json({ error: 'Invalid ID' });
    }
});

app.delete('/api/journal/:id', async (req, res) => {
    try {
        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.json(result);
    } catch {
        res.status(400).json({ error: 'Invalid ID' });
    }
});

startServer();
