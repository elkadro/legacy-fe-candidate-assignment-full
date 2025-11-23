import MetricsEmitter from './MetricsEmitter.util';
import client from 'prom-client';

// Initialize metrics only once
console.log('Initializing metrics...');

//For Custom metrics tracked by events
const metricsEmitter = new MetricsEmitter();

//For http requests metrics
const httpRequestDurationMilliseconds = new client.Histogram({
  name: "clair_http_request_duration_milliseconds",
  help: "Duration of HTTP requests in milliseconds.",
  labelNames: ["method", "route", "code"],
  buckets: [1, 2, 3, 4, 5, 10, 25, 50, 100, 250, 500, 1000], // Customize these as needed
});

export { metricsEmitter, httpRequestDurationMilliseconds };