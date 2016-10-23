'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');

const config = {};
const server = new Hapi.Server(config);

const JobScheduler = require('hapi-job-queue');

const port = 8080;
const host = '0.0.0.0';
server.connection({ port: port, host: host });

var mongoUrl = 'mongodb://localhost:27017/test';


var dbOpts = {
    "url": mongoUrl,
    "settings": {
        "db": {
            "native_parser": false
        }
    }
};


// Method to send Notification..
server.method('sendNotifications', function(data, done) {
    // Fetch list of interested users for data.notification_id
    var db = request.server.plugins['hapi-mongodb'].db;
    var notification_id = data.notification_id;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

    db.collection('notifications').findOne({  "notifiation_id" : new ObjectID(request.params.notification_id) },function(err, result) {
        if (err) return reply(Boom.internal('Internal MongoDB error', err));
        var topic = result.topic;
        // Fetch list of interested users for a topic
        // TOPONDER: Is there a better way to query from multiple collections in mongo? 
        db.collection('user_details').find({"topics": {"$in":[topic]}}).toArray((err, result)=>{
           if (err) return reply(Boom.internal('Internal MongoDB error', err));
           // for each user: send email or send online notification
            result.forEach(function(user) {
                // TODO: implement send email using hapi-mail.. 
                console.log("Sending Notification For User");
                // TODO: Need to store date for each of the status.. 
                var notification_detail = {
                    "notification_id":notification_id,
                    "user_id": user.id,
                    "delivery_status":1,
                    "read:status":0,
                    "archive_status":0
                }
                // Delivery notification table
                db.collection('notification_delivery_status').insertOne(notification_detail,(err,result)=>{
                   if (err) return reply(Boom.internal('Internal MongoDB error', err));
                    done(result);
                })
            });
        })
    }); 
});


const swagger = {
        'register': HapiSwagger,
        'options': {info: {
            'title': 'API Documentation',
            'version': Pack.version,
        }}
    }

    const mongodb = {

        'register': require('hapi-mongodb'),
        'options': dbOpts
    }

    const JobSchedulerPlugin = {
        'register':JobScheduler,
        'options':{
            connectionUrl: mongoUrl,
            endpoint: '/jobs',
            jobs:[]
    }
}

server.register([Vision, Inert, swagger, mongodb,JobSchedulerPlugin,require('./plugins/notifications'),require('./plugins/user-details'), require('./plugins/notification-delivery')], function(err) {
    if (err) {
        console.log(err);
        console.error('Failed loading plugins');
        process.exit(1);
    }
    server.route({
      method: 'GET',
      path: '/app/{param*}',
      handler: {
        directory: {
          path: ['public'],
          listing: false,
          index: ['index.html']
        }
      }
    });
    
    server.start(function () {
        console.log('Server running at:', server.info.uri);
    });
});

module.exports = server;