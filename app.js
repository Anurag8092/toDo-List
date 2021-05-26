const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

//folder called public and inside this public folder you can

//have your CSS folder and you can have your Javascript folder,

//you can have your images folder and we can tell Express to serve up this public folder as a static resource as we can't use css file directly as we

//normally do

app.use(express.static("public"));

const itemSchema = {
  name: "String"
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todoList"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<---- Hit this to delete an item."
});


const defaultItems = [item1, item2, item3];

const listSchema  = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create a new List
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
      }
      else{
        //Show the existing List
         res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }

    }


    });

  });


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err)
        console.log(err)
        else
        console.log("Successfull");
      });
      res.redirect("/");
    }
    else{
      res.render("list", { //for .ejs file to work we use .render(). inside render list is written which w ill direct to list.ejs file and add day to kindofDay
        listTitle: "Today",
        newListItems: foundItems
      });
    }
    });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

if(listName === "Today"){
  item.save();
res.redirect("/");
}
else{
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}


});

app.post("/delete", function(req, res){
  const checkedItemId = (req.body.checkbox);
  console.log(req.body.checkbox);
  const listName = (req.body.listName);

if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err)
    console.log("Successfully deleted hecked item");
    res.redirect("/");
  });
}
else{
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err)
    res.redirect("/" + listName)
  });
}



});

// app.get("/about", function(req, res) {
//   res.render("about");
// });



app.listen(process.env.PORT || 4000, function() {
  console.log("Server is up and running");
})
