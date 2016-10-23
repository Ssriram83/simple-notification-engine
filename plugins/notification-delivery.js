'use strict';

const Joi = require('joi');

let internals = {};

internals.getNotificationsDeliveredforEvent = function(request, reply){
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

    //Find Notification
    
    db.collection('notification_delivery_status').find({  "notifiation_id" : new ObjectID(request.params.notification_id) }).toArray(function(err, result) {
        if (err) return reply(Boom.internal('Internal MongoDB error', err));
        reply(result);
    }); 
}


internals.getNotificationsDeliveredforUser = function(request, reply){
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

    //Find Notification
    
    db.collection('notification_delivery_status').find({  "user_id" : new ObjectID(request.params.user_id) }).toArray(function(err, result) {
        if (err) return reply(Boom.internal('Internal MongoDB error', err));
        reply(result);
    }); 
}

var routes = [{
    method: 'GET',
    path: '/status/notification/{notification_id}',
   handler: internals.getNotificationsDeliveredforEvent,
    config: {
        tags:['api'],
           validate:{
            params:{
                notification_id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
            }
        }
    }
}, {
    method: 'GET',
    path: '/status/user/{user_id}',
    handler: internals.getNotificationsDeliveredforUser,
    config: {
        tags:['api'],
        validate:{
            params:{
                user_id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
            }
        }
    }
}

];

var notification_delivery_status = {  
  register: function (server, options, next) {
    server.route(routes)
    next()
  }
}

notification_delivery_status.register.attributes = {  
  name: 'notification-delivery-status-routes',
  version: '1.0.0'
}

module.exports = notification_delivery_status  