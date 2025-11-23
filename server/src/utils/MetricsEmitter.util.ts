import { EventEmitter } from 'events';
import client, { Counter, Histogram } from 'prom-client';

class MetricsEmitter extends EventEmitter {
  private functionCallsCounter: Counter<string>;
  private functionSuccessCounter: Counter<string>;
  private functionFailureCounter: Counter<string>;
  private functionExecutionTimer: Histogram<string>;

  constructor() {
    super();

    this.functionCallsCounter = new client.Counter({
      name: 'clair_function_calls_total',
      help: 'Total number of function calls',
      labelNames: ['section_name','function_name'],
    });

    this.functionSuccessCounter = new client.Counter({
      name: 'clair_function_success_total',
      help: 'Total number of successful function executions',
      labelNames: ['section_name','function_name'],
    });

    this.functionFailureCounter = new client.Counter({
      name: 'clair_function_failure_total',
      help: 'Total number of failed function executions',
      labelNames: ['section_name','function_name'],
    });

    this.functionExecutionTimer = new client.Histogram({
      name: 'clair_function_execution_duration_seconds',
      help: 'Duration of function execution in seconds',
      labelNames: ['section_name', 'function_name', 'status'],
    });

    this.on('functionCalled', (sectionName, functionName) => {
      this.functionCallsCounter.labels(sectionName, functionName).inc();
    });

    this.on('functionCompleted', (sectionName, functionName,status, duration) => {
      this.functionExecutionTimer.labels(sectionName, functionName,status).observe(duration);
    });

    this.on('functionSucceeded', (sectionName, functionName) => {
      this.functionSuccessCounter.labels(sectionName, functionName).inc();
    });

    this.on('functionFailed', (sectionName, functionName) => {
      this.functionFailureCounter.labels(sectionName, functionName).inc();
    });
  }
}

export default MetricsEmitter;