 ffmpeg -y -i demo-video_1.mp4 \
-vf fps=5,scale=320:-1:flags=lanczos,palettegen palette.png

ffmpeg -i demo-video_1.mp4 -i palette.png -filter_complex \
"fps=5,scale=320:-1:flags=lanczos[x];[x][1:v]paletteuse" output-5fps.gif
