const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const multer = require("multer");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const mongoSession = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
mongoose.set("strictQuery", true);
require("dotenv").config();

const app = express();

app.use(cookieParser());
app.set("view engine", "ejs");
const mySecret = process.env['mongopass']
app.use(express.static("uploads"));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(flash());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//.........................................mongo connection.........................................

mongoose.connect(
  `mongodb+srv://saravana1:${process.env.mongopass}@cluster0.gdr7v46.mongodb.net/findit?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const store = new mongoSession({
  uri: "mongodb+srv://saravana1:qwertyuioplkjhgfdsa@cluster0.gdr7v46.mongodb.net/findit?retryWrites=true&w=majority",
  collection: "session",
  interval: "3600000",
});

app.use(
  session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: false,
    cookie: { maxAge: 3600000, isAuthenticated: "FALSE" },
    resave: false,
    store: store,
  })
);

//...........................................routes................................................

const signup = require("./routes/signup");
const login = require("./routes/login");
const rent = require("./routes/rent");
const logout = require("./routes/logout");
const addhome = require("./routes/addhome");
const verify = require("./routes/verify");
const details = require("./routes/homeDetails");
const home = require("./routes/home");
const { rand } = require("@tensorflow/tfjs");

const storage = multer.diskStorage({
  dest: function (req, file, cb) {
    cb(null, path.join("./public/uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const upload = multer({ storage: storage });

const Home = require("./models/homeModel");

//..................................................request,responses...........................................

app.use("/signup", signup);
app.use("/login", login);
app.use("/rent", rent);
app.use("/sale/addhome", addhome);
app.use("/logout", logout);
app.use("/verify", verify);
app.use("/home", home);
app.use("/homedetails", details);

//...................................................additional cases...........................................
app.get("/", (req, res) => {
  res.redirect("/home");
});

app.get("/predict", (req, res) => {
  if (req.session.isAuthenticated) {
    res.redirect("https://upu0n1.csb.app/");
  }
});

app.get("/add", (req, res) => {
  Home.find()
    .where("totalRent")
    .equals("NA")
    .then((f) => {
      let i = 0;
      f.map((k) => {
        Home.findOneAndUpdate(
          { id: k.id },
          { totalRent: String(Math.floor(Math.random() * 100) + 900) }
        ).then((n) => {
          console.log(i);
          i++;
        });
      });
    });
});

app.get("/count", async function (req, res) {
  console.log(await Home.count({ totalRent: "NA" }));
});

app.listen(3000, () => {
  console.log("server started");
});
