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
    console.log("User requesting authentication: " + req.body.name);
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

router.get("/website/Mauro", function (req, res) {
    console.log("User getting measurements");
    database.query("SELECT COUNT(timestamp) AS ticks, HOUR(timestamp) AS hour FROM measurement WHERE HOUR(timestamp) = HOUR((SELECT timestamp FROM measurement JOIN person ON person.id = measurement.person_id WHERE measurement.id = (SELECT  MAX(measurement.id) FROM measurement JOIN person ON person.id = measurement.person_id WHERE person.name = 'Mauro'))) AND DAY(timestamp) = DAY((SELECT timestamp FROM measurement JOIN person ON person.id = measurement.person_id WHERE measurement.id = (SELECT  MAX(measurement.id) FROM measurement JOIN person ON person.id = measurement.person_id WHERE person.name = 'Mauro'))) GROUP BY MONTH(timestamp) , DAY(timestamp) , HOUR(timestamp) ORDER BY MONTH(timestamp) , DAY(timestamp) , HOUR(timestamp);", function (err, firstQuery) {
        database.query("SELECT measurement.id,COUNT(timestamp) as ticks, hour(timestamp) as hour, day(timestamp) as day, month(timestamp) as month, year(timestamp) as year FROM measurement JOIN person ON person.id=measurement.person_id WHERE person.name='Mauro' GROUP BY month(timestamp),day(timestamp),hour(timestamp) ORDER BY month(timestamp),day(timestamp),hour(timestamp);", function (err, secondQuery) {
            if (!err) {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.json({
                    currentData: firstQuery[0],
                    results: secondQuery
                });
            } else {
                console.error("Error getting measurements: " + err.stack)
            }
        });
    });
});

router.get("/website/deltaMauro", function (req, res) {
    console.log("User getting measurements");
    database.query("SELECT time_to_sec(timestamp) as timestamp FROM measurement JOIN person ON person.id=measurement.person_id WHERE person.name='Mauro' ORDER BY measurement.id DESC LIMIT 2", function (err, rows) {
        if (!err) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.json({current_tick: rows[0].timestamp, previous_tick: rows[1].timestamp});
        } else {
            console.error("Error getting measurements: " + err.stack)
        }
    });
});

router.get("/website/Arthur", function (req, res) {
    console.log("User getting measurements");
    database.query("SELECT COUNT(timestamp) AS ticks, HOUR(timestamp) AS hour FROM measurement WHERE HOUR(timestamp) = HOUR((SELECT timestamp FROM measurement JOIN person ON person.id = measurement.person_id WHERE measurement.id = (SELECT  MAX(measurement.id) FROM measurement JOIN person ON person.id = measurement.person_id WHERE person.name = 'Arthur'))) AND DAY(timestamp) = DAY((SELECT timestamp FROM measurement JOIN person ON person.id = measurement.person_id WHERE measurement.id = (SELECT  MAX(measurement.id) FROM measurement JOIN person ON person.id = measurement.person_id WHERE person.name = 'Arthur'))) GROUP BY MONTH(timestamp) , DAY(timestamp) , HOUR(timestamp) ORDER BY MONTH(timestamp) , DAY(timestamp) , HOUR(timestamp);", function (err, firstQuery) {
        database.query("SELECT measurement.id,COUNT(timestamp) as ticks, hour(timestamp) as hour, day(timestamp) as day, month(timestamp) as month, year(timestamp) as year FROM measurement JOIN person ON person.id=measurement.person_id WHERE person.name='Arthur' GROUP BY month(timestamp),day(timestamp),hour(timestamp) ORDER BY month(timestamp),day(timestamp),hour(timestamp);", function (err, secondQuery) {
            if (!err) {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.json({
                    currentData: firstQuery[0],
                    results: secondQuery
                });
            } else {
                console.error("Error getting measurements: " + err.stack)
            }
        });
    });
});

router.get("/website/deltaArthur", function (req, res) {
    console.log("User getting measurements");
    database.query("SELECT time_to_sec(timestamp) as timestamp FROM measurement JOIN person ON person.id=measurement.person_id WHERE person.name='Arthur' ORDER BY measurement.id DESC LIMIT 2", function (err, rows) {
        if (!err) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.json({current_tick: rows[0].timestamp, previous_tick: rows[1].timestamp});
        } else {
            console.error("Error getting measurements: " + err.stack)
        }
    });
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
    console.log("User getting measurements");
    database.query("SELECT * FROM measurement;", function (err, rows) {
        if (!err) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.json(rows);
        } else {
            console.error("Error getting measurements: " + err.stack)
        }
    });
});

router.post("/measurements", function (req, res) {
    console.log("User ping received: " + req.body.name);
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