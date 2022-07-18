#!/usr/bin/env python3

import logging
import multiprocessing as mp

from src.backend import config, signalling, worker

logging.basicConfig(level=logging.DEBUG)

def main():
    try:
        # set up the messaging queues
        job_q = mp.Queue(config.n_workers)
        signalling_q = mp.Queue(1)
        pubsub_q = mp.Queue()

        workers = []

        # start signalling worker
        signalling_worker = mp.Process(target=signalling.run, args=(job_q, signalling_q))
        workers.append(signalling_worker)
        signalling_worker.start()
        logging.info(f'started signalling worker (pid: {signalling_worker.pid})')

        # start video processing workers
        logging.info(f'running with {config.n_workers} worker processes')
        for worker_num in range(config.n_workers):
            proc = mp.Process(target=worker.run, args=(job_q, signalling_q, worker_num))
            workers.append(proc)
            proc.start()

        # close down all processes (this shouldn't be hit often as all workers
        # should run perpetually)
        map(lambda w: w.join(), workers)
    except KeyboardInterrupt:
        exit(0)

if __name__ == '__main__':
    main()
