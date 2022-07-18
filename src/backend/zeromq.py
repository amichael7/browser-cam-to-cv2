#!/usr/bin/env python3

import json
import logging
import multiprocessing as mp
import os

import zmq

from .router import Router


class SignallingServer:
    def __init__(self, port: str, job_q, signalling_q):
        assert type(port) is str, 'port is not string'
        try:
            x = int(port)
            assert x > -1 and x < 65535
        except:
            raise ValueError('Received invalid port argument')
        
        self.pid = os.getpid()
        self.port = port
        self.context = zmq.Context()
        self.sock = self.context.socket(zmq.REP)
        self.router = Router(job_q, signalling_q)

    def serve(self):
        self.sock.bind(f"tcp://*:{self.port}")
        logging.info(f'ZeroMQ server connected on local port: {self.port}')
        try:
            while 1:
                # block while waiting for messages from client
                msg = self.sock.recv()

                # parse and respond to message
                response, err = self.router.route(msg)
                if err:
                    logging.debug(msg)
                    self.err(err)
                else:
                    self.send(response)

        except KeyboardInterrupt:
            logging.info(('KeyboardInterrupt received, '
                f'shutting down signalling worker (pid: {self.pid})'))
        finally:
            # clean up
            self.sock.close()
            self.context.term()

    def send(self, msg: str):
        self.sock.send(str.encode(msg))

    def err(self, msg):
        err_msg = json.dumps({
                'data': {
                    'error': msg,
                }
            })
        self.send(err_msg)
