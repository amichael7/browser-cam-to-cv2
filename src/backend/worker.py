#!/usr/bin/env python3


import logging
import os
import socket
from time import sleep

import cv2


class VideoProcessor:
    def __init__(self, signalling_q, connection_id, worker_num):
        self.signalling_q = signalling_q
        self.connection_id = connection_id
        self.worker_num = worker_num


    def get_open_udp_port(self):
        ''' let OS assign an open port '''
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.bind(("",0))
        port = s.getsockname()[1]
        s.close()
        return port

    def get_video_capture(self):
        port = self.get_open_udp_port()
        self.assign(port)
        # for info on params, see https://stackoverflow.com/q/16944024 
        cap = cv2.VideoCapture((f'udp://127.0.0.1:{port}'
            '?overrun_nonfatal=1&fifo_size=50000000'), cv2.CAP_FFMPEG)

        # Exit if capture doesn't load
        if cap.isOpened():
            logging.info(f'VideoCapture opened on port {port}')
            return cap
        else:
            raise ConnectionError('unable to bind udp server to open port')

    def assign(self, port):
        self.port = port
        self.signalling_q.put((self.connection_id, port, self.worker_num))

    def close(self):
        pass

def display(cap, max_empty_frames=3):
    count_empty_frames = 0
    while 1:
        ret, frame = cap.read()

        if not ret:
            print('frame empty')
            count_empty_frames += 1
            if count_empty_frames > max_empty_frames:
                return 1

        if frame is None:  # skip empty frame 
            count_empty_frames += 1
            continue
        h, w = frame.shape[:2]
        if not h > 0 or not w > 0:  # skip frame 
            count_empty_frames += 1
            continue       
        cv2.imshow('image', frame)

        if count_empty_frames > 3:
            break
        if cv2.waitKey(1)&0XFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

def run(job_q, signalling_q, worker_num):
    pid = os.getpid()
    logging.info(f'started video processing worker {worker_num} [pid: {pid}]')
    
    try:
        for connection_id, event in iter(job_q.get, None):
            if event == 'open':
                vp = VideoProcessor(signalling_q, connection_id, worker_num)
                logging.info((connection_id, event, worker_num))
                cap = vp.get_video_capture()
                display(cap)
            elif event == 'close':
                vp.close()
    except KeyboardInterrupt:
        logging.info(('KeyboardInterrupt received, '
            f'shutting down video processing worker {worker_num} [pid: {pid}]'))
        exit(0)
