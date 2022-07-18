#!/usr/bin/env python3

import multiprocessing as mp
import os

signalling_port = os.getenv('SIGNALLING_PORT', '3001')
pubsub_port = os.getenv('PUBSUB_PORT', '3002')
n_workers = os.getenv('N_WORKERS', mp.cpu_count() * 2 - 1)
