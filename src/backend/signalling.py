#!/usr/bin/env python3

from src.backend import config
from src.backend.zeromq import SignallingServer


def run(in_mq, out_mq):
	zeromq = SignallingServer(config.signalling_port, in_mq, out_mq)
	zeromq.serve()
