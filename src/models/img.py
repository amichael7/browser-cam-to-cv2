import zerorpc
import cv2
import numpy as np
import io
from PIL import Image
from display import Display

W = 1920//2
H = 1080//2
disp = Display(W, H)


class Img(object):
	def process_img(self, data):
		# PIL docs: https://pillow.readthedocs.io/en/5.3.x/handbook/tutorial.html#reading-from-a-string
		img = Image.open(io.BytesIO(data));
		img_arr = np.asarray(img)

		img_arr = img_arr[...,::-1]		#convert RGB to BGR (OpenCV's color scheme)
		img_arr = cv2.resize(img_arr, (W,H))
		disp.draw(img_arr)
		return "Data: %s" % (len(data)*8);


def test_display():
	'''
	This method is here to test whether the display functionality is working.
	If you wish to use it, the video I used to test it is given by the following
	video.	

	Video URL: https://videos.pexels.com/videos/fast-driving-car-on-straight-road-852020
	'''
	cap = cv2.VideoCapture('driving.mp4')
	while cap.isOpened():
		ret, frame = cap.read()
		if ret == True:
			process_frame(frame)
		else:
			break;

def main():
	s = zerorpc.Server(Img())
	s.bind("tcp://0.0.0.0:4242")
	s.run()


if __name__ == '__main__':
	main()