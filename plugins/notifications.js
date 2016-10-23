'use strict';

const Joi = require('joi');

let internals = {};

internals.createNotification = function(request, reply){
    var db = request.server.plugins['hapi-mongodb'].db;
    //Insert Object 
    var notification = {
        "topic":request.payload.topic, 
        "desc":request.payload.description, 
        "message":request.payload.message,
        "schedule":request.payload.schedule
    }

    db.collection('notifications').insertOne(notification, function(err, result) {
        if (err) return reply(Boom.internal('Internal MongoDB error', err));
        reply(result);
    }); 
}

internals.getAllNotifications = function(request, reply){
    var db = request.server.plugins['hapi-mongodb'].db;
    //Find All Objects 
    db.collection('notifications').find({}).toArray(function(err, result) {
        if (err) return reply(Boom.internal('Internal MongoDB error', err));
        reply(result);
    }); 
}

internals.getNotification = function(request, reply){
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

    //Find All 
    
    db.collection('notifications').findOne({  "_id" : new ObjectID(request.params.id) }, function(err, result) {
        if (err) return reply(Boom.internal('Internal MongoDB error', err));
        reply(result);
    }); 
}


var routes = [{
    method: 'GET',
    path: '/notifications',
    config: {
        tags:['api'],
        handler: internals.getAllNotifications
    }
}, {
    method: 'GET',
    path: '/notifications/{id}',
    handler: internals.getNotification,
    config: {
        tags:['api'],
        validate:{
            params:{
                id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
            }
        }
    }
},{
    method: 'POST',
    path: '/notifications',
    config: {
        tags:['api'],
        validate: {
            payload: { 
                 topic: Joi.string().required().min(5),
                 description: Joi.string().required().min(5),
                 schedule: Joi.string().required().min(5),
                 message: Joi.string().required().min(5)

            }
        },
        handler: internals.createNotification
    }
}

];

var notifications = {  
  register: function (server, options, next) {
    server.route(routes)
    next()
  }
}

notifications.register.attributes = {  
  name: 'notifications-routes',
  version: '1.0.0'
}

module.exports = notifications  