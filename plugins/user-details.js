'use strict';

const Joi = require('joi');

let internals = {};

internals.createNewUser = function(request, reply){
    var db = request.server.plugins['hapi-mongodb'].db;
    //Insert Object 
    var userDetails = {
                 first_name: request.payload.first_name,
                 last_name: request.payload.last_name,
                 email_id: request.payload.email_id,
                 delivery_preferences: request.payload.delivery_preferences,
                 intersted_topics:request.payload.intersted_topics
        }

    db.collection('user_details').insertOne(userDetails, function(err, result) {
        if (err) return reply(Boom.internal('Internal MongoDB error', err));
        reply(result);
    }); 
}

internals.getAllUsers = function(request, reply){
    var db = request.server.plugins['hapi-mongodb'].db;
    //Find All Objects 
    db.collection('user_details').find({}).toArray(function(err, result) {
        if (err) return reply(Boom.internal('Internal MongoDB error', err));
        reply(result);
    }); 
}

internals.getUser = function(request, reply){
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

    //Find All 
    
    db.collection('user_details').findOne({  "_id" : new ObjectID(request.params.id) }, function(err, result) {
        if (err) return reply(Boom.internal('Internal MongoDB error', err));
        reply(result);
    }); 
}


var routes = [{
    method: 'GET',
    path: '/user_details',
    config: {
        tags:['api'],
        handler: internals.getAllUsers
    }
}, {
    method: 'GET',
    path: '/user_details/{id}',
    handler: internals.getUser,
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
    path: '/user_details',
    config: {
        tags:['api'],
        validate: {
            payload: { 
                 first_name: Joi.string().required().min(5).max(32),
                 last_name: Joi.string().required().min(5).max(32),
                 email_id: Joi.string().required().email(),
                 delivery_preferences: Joi.array().items(Joi.any().allow('email','website')),
                 intersted_topics:Joi.array().items(Joi.any().allow('informational','maintainenece', 'new-feautures'))

            }
        },
        handler: internals.createNewUser
    }
}

];

var user_details = {  
  register: function (server, options, next) {
    server.route(routes)
    next()
  }
}

user_details.register.attributes = {  
  name: 'user-details-routes',
  version: '1.0.0'
}

module.exports = user_details  