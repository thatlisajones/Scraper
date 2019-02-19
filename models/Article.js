var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({ 
    title: {
        type: String,
        unique: {
            index: {
                unique: true
            }
        }
    },
    date: {
        type: String,
    },
    img: {
        type: String, 
    },
    link: {
        type: String,
    },
    keep: {
        type: Boolean,
        default: false,
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
})

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
