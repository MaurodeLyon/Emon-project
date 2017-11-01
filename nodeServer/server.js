var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var mongoose = require('mongoose');

var port = 8080;
var key = "secret key";

var Person = require('./model/person');
var Measurement = require('./model/measurement');
var options = {
    useMongoClient: true,
    autoIndex: false,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 500,
    poolSize: 10,
    bufferMaxEntries: 0
};
mongoose.connect('mongodb://192.168.1.63:27017/Fluxus', options);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var router = express.Router();

router.get("/website/ticks", function (req, res) {
    console.log("User getting measurements");
    Measurement.aggregate([
        {
            $group: {
                _id: {
                    year: {$year: "$timestamp"},
                    month: {$month: "$timestamp"},
                    day: {$dayOfMonth: "$timestamp"},
                    hour: {$hour: "$timestamp"}
                },
                ticks: {$sum: 1}
            }
        },
        {
            $project: {
                _id: 0,
                ticks: 1,
                hour: "$_id.hour",
                day: "$_id.day",
                month: "$_id.month",
                year: "$_id.year"

            }
        },
        {
            $sort: {
                "year": 1,
                "month": 1,
                "day": 1,
                "hour": 1
            }
        }
    ], function (err, result) {
        if (!err) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.json(result);
        } else {
            console.error("Error website ticks: " + err.stack);
        }
    });
});

router.get("/website/delta", function (req, res) {
    console.log("User getting delta");
    Measurement.aggregate([
        {
            $sort: {timestamp: -1}
        },
        {
            $project: {
                _id: 0,
                hour: {"$hour": "$timestamp"},
                minute: {"$minute": "$timestamp"},
                second: {"$second": "$timestamp"}
            }
        },
        {
            $limit: 2
        }
    ], function (err, result) {
        var currentTick = result[0].hour * 60 * 60 + result[0].minute * 60 + result[0].second;
        var previousTick = result[1].hour * 60 * 60 + result[1].minute * 60 + result[1].second;
        if (!err) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.json({current_tick: currentTick, previous_tick: previousTick});
        } else {
            console.error("Error website delta: " + err.stack);
        }
    });
});

router.post("/authenticate", function (req, res) {
    console.log("User requesting authentication: " + req.body.name);
    Person.find({name: req.body.name, password: req.body.password}, function (err, persons) {
        if (persons.length === 1) {
            var token = jwt.sign(req.body, key, {
                expiresIn: "24h"
            });
            res.json({success: true, token: token});
            console.log("Authentication successful.")
        } else {
            res.json({success: false, message: "Authentication failed."});
            console.log("Authentication failed.")
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
    Measurement.find(function (err, measurements) {
        if (err) {
            console.error("Error getting measurements: " + err.stack)
        } else {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.json(measurements);
        }
    });
});

router.post("/measurements", function (req, res) {
    console.log("User ping received: " + req.body.name);
    var measurement = new Measurement();
    measurement.timestamp = new Date();
    measurement.save(function (err) {
        if (err) {
            console.error("Error inserting measurement: " + err.stack)
        }
        res.json({success: true, message: "successfully inserted data"});
    });
});

app.use("/api", router);

app.listen(port);
console.log("Node server is running on: " + port);