import {EventType} from 'events';

module.exports = class EventReferTrying extends EventType {
  constructor({status_line, request}) {
    super();
    this.status_line = status_line;
    this.request = request;
  }
};

module.exports = class EventReferProgress extends EventType {
  constructor({status_line, request}) {
    super();
    this.status_line = status_line;
    this.request = request;
  }
};

module.exports = class EventReferAccepted extends EventType {
  constructor({status_line, request}) {
    super();
    this.status_line = status_line;
    this.request = request;
  }
};

module.exports = class EventReferFailed extends EventType {
  constructor({request, status_line}) {
    super();
    this.request = request;
    this.status_line = status_line;
  }
};

module.exports = class EventReferRequestSucceeded extends EventType {
  constructor({response}) {
    super();
    this.response = response;
  }
};

module.exports = class EventReferRequestFailed extends EventType {
  constructor({response, cause}) {
    super();
    this.response = response;
    this.cause = cause;
  }
};
