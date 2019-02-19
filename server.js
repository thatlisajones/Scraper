// var express = require("express");

// var PORT = process.env.PORT || 8000;
// var app = express();

// // Serve static content for the app from the "public" directory in the application directory.
// app.use(express.static("public"));

// // Parse application body
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// var exphbs = require("express-handlebars");

// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

// var routes = require("./controllers/articlesController.js");

// app.use(routes);

// app.listen(PORT, function() {
//   console.log("Listening on port:%s", PORT);
// });

// Dependencies
var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var logger = require("morgan");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var app = express();
var db = require("./models");
var PORT = process.env.PORT || 8000;

app.use(express.static("public"));
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/eatdanews"
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
}) 
 
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


app.get("/", function(req, res) {
  console.log("hit / index");
  db.Article.find({}, function(err, data) {
    res.render("index", { articles: data });
  })
});

// scrape route
app.get("/scrape", function(req, res) {
  console.log("hit /scrape");    

  axios.get("https://www.realclearpolitics.com/")
  .then(function(response) {
    var $ = cheerio.load(response.data);
    var result = {};

    $("div.post").each(function(i, element) { 

      result.title = $(this).children('a').text();
      result.link = $(this).children('a').attr('href');

    db.Article.create(result, function(err, dbArticle) {
      if (err) {
        console.log("err and result: ", err);
      } 
      console.log(dbArticle);
    })
    });
    res.redirect("/");
  });
});

// Find all articles from database show json array
app.get("/articles", function(req, res) {
  console.log("hit /articles");
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//get saved articles
app.get("/saved", function(req, res) {
  db.Article.find({"keep": true})
  .populate("note")
  .then(function(data) {
      var savedArticles = {
          articles: data
      }
      console.log("saved data: ", data);
      res.render("saved", {articles: data});
  })
  .catch(function(err) {
    res.json(err);
  });
});

// Route for saving a specific Article by id
app.post("/articles/save/:id", function(req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, {$set: { "keep": true }})
    .then(function(err, data) {
      if (err) {
        console.log(err);
      } else {
        res.send(data);
      }
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Remove an article from saved
app.post("/articles/remove/:id", function(req, res) {
    console.log("id params:", req.params.id);
    db.Article.findOneAndUpdate({ _id: req.params.id }, {$set: { keep: false }}, { new: true }, function(err, doc) {
      console.log("err: ", err);
      console.log("doc: ", doc);
      if (err) {
        console.log(err);
      } else {
        res.json(doc);
      }
    })
});

//Get an article by ID, populate with note
app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Save note 
app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port 8000");
});

// A GET route for scraping the echoJS website
// app.get("/scrape", function(req, res) {
//   // First, we grab the body of the html with axios
//   axios.get("http://www.echojs.com/").then(function(response) {
//     // Then, we load that into cheerio and save it to $ for a shorthand selector
//     var $ = cheerio.load(response.data);

//     // Now, we grab every h2 within an article tag, and do the following:
//     $("article h2").each(function(i, element) {
//       // Save an empty result object
//       var result = {};

//       // Add the text and href of every link, and save them as properties of the result object
//       result.title = $(this)
//         .children("a")
//         .text();
//       result.link = $(this)
//         .children("a")
//         .attr("href");

//       // Create a new Article using the `result` object built from scraping
//       db.Article.create(result)
//         .then(function(dbArticle) {
//           // View the added result in the console
//           console.log(dbArticle);
//         })
//         .catch(function(err) {
//           // If an error occurred, log it
//           console.log(err);
//         });
//     });

//     // Send a message to the client
//     res.send("Scrape Complete");
//   });
// });