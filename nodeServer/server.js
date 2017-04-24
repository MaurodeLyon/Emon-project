var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var mySql = require("mysql");
var port = 8080;
var key = "secret key";

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var database = mySql.createConnection({
    host: "192.168.1.63",
    user: "root",
    password: "!123abc",
    database: "Emon",
    timezone: "SYSTEM"
});

database.connect(function (err) {
    if (err) {
        console.error("error connecting to the database: " + err.stack);
        return;
    }
    console.log("connected to database. ID: " + database.threadId);
});

var router = express.Router();

router.post("/authenticate", function (req, res) {
    console.log("User requesting authentication: ");
    console.log(req.body);
    database.query("SELECT * FROM person WHERE name = '" + req.body.name + "' AND password = '" + req.body.password + "';", function (err, rows) {
        console.log(rows.length);
        if (rows.length === 1) {
            var token = jwt.sign(req.body, key, {
                expiresIn: "24h"
            });
            res.json({success: true, token: token});
            console.log("Authentication successful.")
        } else {
            res.json({success: false, message: "Authentication failed."});
            console.log("Authentication failed.")
        }
    })
});

router.use(function (request, response, next) {
    var token = request.body.token || request.headers['x-access-token'];
    if (token) {
        jwt.verify(token, key, function (err, decoded) {
            if (err) return response.send({success: false, message: 'Failed to authenticate token.'});
            else {
                request.decoded = decoded;
                next();
            }
        });
    } else {
        return response.status(403).send({success: false, message: 'No token provided.'});
    }
});

router.get("/measurements", function (req, res) {
    database.query("SELECT * FROM measurement;", function (err, rows) {
        if (!err) {
            res.json(rows);
        } else {
            console.error("Error getting measurements: " + err.stack)
        }
    });
});

router.post("/measurements", function (req, res) {
    console.log(req.body);
    database.query("INSERT INTO measurement(`person_id`)(SELECT id FROM person WHERE name = '" + req.body.name + "');", function (err) {
        if (err) {
            console.error("Error inserting measurement: " + err.stack)
        }
        res.json({success: true, message: "successfully inserted data"});
    });
});

app.use("/api", router);

app.listen(port);
console.log("Node server is running on: " + port);