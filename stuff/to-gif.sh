#/bin/bash

FPS="${2:-5}"
SCALE="${3:-320}"

ffmpeg -y -i $1 \
-vf fps=$FPS,scale=$SCALE:-1:flags=lanczos,palettegen palette.png

ffmpeg -i $1 -i palette.png -filter_complex \
"fps=$FPS,scale=$SCALE:-1:flags=lanczos[x];[x][1:v]paletteuse" $1-$FPS-$SCALE.gif
