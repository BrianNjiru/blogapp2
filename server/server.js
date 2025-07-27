const express = require('express'); //Handles routes and middleware
const cors = require('cors'); //Enables Cross-Origin Resource Sharing, Important for when frontend is on a different port or domain
const mongoose = require('mongoose'); //ODM library for MongoDB it simplifies interactions with MongoDB
const bordyParser = require('body-parser'); //Middleware to parse incoming request bodies in a middleware before your handlers, available under the req.body property

//This packages are essential for building a robust server-side application with Node.js and Express; REST API, interact with MongoDB accept frontend requests from different origins and understand the data sent in requests.

const app = express(); //Create an instance of an Express application, initializes the app object which is used to configure the server and define routes
const PORT = process.env.PORT || 3000; //Set the port for the server to listen on, defaults to 3000 if not specified in environment variables

//The above 2 lines are essential for setting up the Express application and defining the port on which it will run, keeps server flexible and allows it to run on different ports based on the environment, environment agnostic

mongoose.connect('mongodb://localhost:27017/blog_app2');
//Connect to MongoDB database, 'blog_app2' is the name of the database, if it doesn't exist, MongoDB will create it automatically

const db = mongoose.connection; //Get the connection object from mongoose
db.on('error', console.error.bind(console, 'MongoDB connection error:')); //Log any connection errors to the console
db.once('open', () => {
  console.log('Connected to MongoDB'); //Log a message when the connection is successfully opened
}); //This is essential for establishing a connection to the MongoDB database, allowing the application to interact with the database for data storage and retrieval

app.use(cors()); //Use CORS middleware to enable Cross-Origin Resource Sharing, allowing requests from different origins
app.use(express.json()); //Use built-in middleware to parse JSON request bodies, making it easier to handle incoming data in JSON format
app.use(express.urlencoded({ extended: true })); //Use built-in middleware to parse URL-encoded request bodies, allowing the server to handle form submissions and other URL-encoded data

const Post = mongoose.model('Post', {
    title: String,
    content: String,
    createdAt: {
        type: Date,
        default: Date.now //Automatically set the createdAt field to the current date and time when a new post is created
    },
    updatedAt: {type: Date}
});

//Define a Mongoose model for the 'Post' collection, specifying the schema for blog posts, including title, content, createdAt, and updatedAt fields

app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find(); //Fetch all posts from the database
        res.json(posts); //Send the posts as a JSON response
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' }); //Handle errors and send a 500 status code if fetching fails
    }
});

app.post('/posts', async (req, res) => {
    try {
        const post = new Post(req.body); //Create a new Post instance with the data from the request body
        await post.save(); //Save the post to the database
        res.status(201).json(post); //Send a 201 status code and the created post as a JSON response
    } catch (error) {
        res.status(400).json({ error: 'Failed to create post' }); //Handle errors and send a 400 status code if creation fails
    }
});

app.put('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id, //Get the post ID from the request parameters
            req.body, //Get the updated data from the request body
            { new: true } //Return the updated document
        );
        if (!post) {
            return res.status(404).json({ error: 'Post not found' }); //Handle case where post is not found
        }
        res.json(post); //Send the updated post as a JSON response
    } catch (error) {
        res.status(400).json({ error: 'Failed to update post' }); //Handle errors and send a 400 status code if updating fails
    }
});
app.delete('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id); //Get the post ID from the request parameters and delete the post
        if (!post) {
            return res.status(404).json({ error: 'Post not found' }); //Handle case where post is not found
        }
        res.json({ message: 'Post deleted successfully' }); //Send a success message as a JSON response
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' }); //Handle errors and send a 500 status code if deletion fails
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); //Log a message indicating that the server is running and listening on the specified port
}); //Start the server and listen for incoming requests on the specified port
//This is essential for starting the Express server and making it ready to handle incoming requests, allowing the application to serve content and respond to API calls
//The server will run on the specified port, and you can access the API endpoints defined above