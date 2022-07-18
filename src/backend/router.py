#!/usr/bin/env python3

import json
import logging


class Router:
    def __init__(self, job_q, signalling_q):
        self.job_q = job_q
        self.signalling_q = signalling_q
        
    def route(self, payload):
        ''' handle signaling from frontend server return tuple (response, err) '''

        # validate and parse message
        try:
            payload = json.loads(payload)
        except:
            return (None, 'invalid JSON received')
        if 'data' not in payload:
            return (None, 'invalid message received')
        data = payload['data']
        if any([field not in data for field in ('id', 'event')]):
            return (None, 'invalid message received')
        event, _id = data['event'], data['id']

        # prepare response
        if event == 'open':
            self.job_q.put((_id, event))
            connection_id, port, worker_num = self.signalling_q.get()
            assert connection_id == _id
            payload['data']['port'] = port
            payload['data']['worker_num'] = worker_num
            return (json.dumps(payload), None)
        if event == 'close':
            self.job_q.put((_id, event))
            payload['data']['status'] = 'ok'
            payload['data']['message'] = f'worker assigned assigned to {_id}'
            # return (json.dumps(payload), None)
            return (None, 'event not yet implemented')
        else:
            return (None, 'event not recognized')
