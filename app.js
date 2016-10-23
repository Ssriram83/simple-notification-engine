'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
// const Routes = require('./routes');
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

server.method('emailUsers', function(data, done) {
  server.plugins.emailService.spam(data.group, done);
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

    // server.route(Routes);
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
