/////////////////////////// APP CONFIG /////////////////////////// 

// Set up the express framework and make
// it accessible via the "app" variable.
var express = require("express");
var app = express();

// This Node.js body parsing middleware is
// used to utilize the URL-encoded parser
// and req.body.
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Set up mongoDB to be used via Mongoose
// in JavaScript.
var mongoose = require("mongoose");

// Connect Mongoose.
mongoose.connect("mongodb://localhost/b_blog");

// Set up the view engine so we don't have
// to constantly type ".ejs" extensions.
app.set("view engine", "ejs");
app.use(express.static("public"));

var methodO = require("method-override");
app.use(methodO("_method"));

// Prevent users from injecting scripts into
// blog body.
var expressSan = require("express-sanitizer");
app.use(expressSan());


///////////////////////////  MONGOOSE/MODEL CONFIG ///////////////////////////
// Set up Schema. A restaurant consists of
// a name, image, and description.
var blogSchema = new mongoose.Schema({
    title: String,
    image: String, // {type: String, default: "image URL"}
    body: String,
    created: {type: Date, default: Date.now} // Created is a date which has the default value of current date.
});


// Compile a model using the above schema and
// store it in a variable.
var Blog = mongoose.model("Blog", blogSchema);


// DEBUGGING
// Blog.create({
//     title: "Test Blog", 
//     image: "https://images.unsplash.com/photo-1440427810006-0e4109fd4abe?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&s=ccfd4fdee2bb31642a386e455f41b2fb",
//     body: "This is a picture of a delectable sandwich."
// });


/////////////////////////// RESTFUL ROUTES /////////////////////////// 

// Set up the homepage. The root path "/"
// will be rendered as the index.ejs template
// located in the views directory.
app.get("/", function(req, res){
    res.redirect("/blogs");
});

// INDEX ROUTE - directs to /blogs
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, allBlogs){
        if (err) {
            console.log(err);
        } else {
            // We don't want to just render index.
            // We want to render index with data.
            res.render("index", {blogs: allBlogs});     
        }
    });
});


// NEW route
app.get("/blogs/new", function(req, res) {
    res.render("new");
});


// CREATE route
app.post("/blogs", function(req, res){
    // Create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog) {
        if (err) {
            //console.log(err);
            res.render("new");
        } else {
            // redirect to index
            res.redirect("/blogs");
        }
    });
});


// SHOW route
app.get("/blogs/:id", function(req, res) {
    // Find blog with the ID
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            console.log(err);
        } else {
            // Render SHOW template with that restaurant.
            res.render("show", {blog: foundBlog});
        }
    }); 
});


// EDIT route
// This grabs up the blog's data to be editted.
// Reveal the elements via the edit.ejs page.
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });    
});


// UPDATE route - Now that we've editted the blog,
// we need to tell the system to override old data
// with new data.
app.put("/blogs/:id", function(req, res){
    // .findByIdAndUpdate(id, new data to override, callback){});
    Blog.findByIdAndUpdate(req.params.id,req.body.blog, function(err, findUpdateBlog){
        if (err) {
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});


// DESTROY / DELETE route
app.delete("/blogs/:id", function(req, res){
    // Destroy the blog
    // err only argument because we don't want to
    // do anything to the data aside from remove it.
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("BloopBlog Server Online");
});
