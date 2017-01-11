/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  View,
  ART,
  TouchableOpacity
} from 'react-native';
const {
  Surface,
  Group,
  Shape,
  LinearGradient
} = ART;
import { Spring } from './timing-functions';

const SELCTED_MARKER_ANIMATION_DURATION = 1000;
const SELCTED_MARKER_ANIMATION_DELAY_1 = SELCTED_MARKER_ANIMATION_DURATION * .2;
const SELCTED_MARKER_ANIMATION_DELAY_2 = SELCTED_MARKER_ANIMATION_DURATION * .3;
const MARKER_RADIUS = 15;
const MARKER_RADIUS_2 = MARKER_RADIUS * .75;
const MARKER_RADIUS_3 = MARKER_RADIUS * .5;
const MARKER_RADIUS_SQUARED = Math.pow(MARKER_RADIUS, 2);


function makeCircle(cx, cy, r) {
  return `M${cx-r},${cy}a${r},${r} 0 1,0 ${r*2},0a${r},${r} 0 1,0 -${r*2},0`;
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      trX: 0,
      markerR1: 0,
      clickMarkers: [],
      markerRadi: []
    };
  }

  componentWillMount() {
    this.spring = new Spring({friction: 150, frequency: 500});
    this.spring2 = new Spring({friction: 150, frequency: 500});
  }

  componentDidMount() {
    this.startAimateSelectedMarker();
  }

  startAni() {
    this.selected ? this.startAimateUnselectedMarker() : this.startAimateSelectedMarker();
    this.selected = !this.selected;
  }

  startAimateUnselectedMarker() {
    this.unselectedMarkerAnimationEndTime = Date.now() + SELCTED_MARKER_ANIMATION_DURATION;
    this.animateUnselectedMarker();
  }

  animateUnselectedMarker() {
    requestAnimationFrame((timestamp) => {
      let progressLongest = ((this.unselectedMarkerAnimationEndTime - timestamp) / SELCTED_MARKER_ANIMATION_DURATION);
      let progress2 = ((this.unselectedMarkerAnimationEndTime - timestamp) / (SELCTED_MARKER_ANIMATION_DURATION - SELCTED_MARKER_ANIMATION_DELAY_1));
      let progress3 = ((this.unselectedMarkerAnimationEndTime - timestamp) / (SELCTED_MARKER_ANIMATION_DURATION - SELCTED_MARKER_ANIMATION_DELAY_2));
      console.log('progressLongest', progressLongest);
      // console.log(this.spring.interpolate(progress));
      if (progressLongest  > 0) {
        this.setState(Object.assign(this.state, {
          //markerR1: bounce(progress)
          markerR1: this.spring.interpolate(progressLongest),
          markerR2: this.spring2.interpolate(progress2),
          markerR3: this.spring2.interpolate(progress3)
        }));
        this.animateUnselectedMarker();
      } else {
        this.setState(Object.assign(this.state, {
          markerR1: 1,
          markerR2: 0,
          markerR3: 0
        }));
      }
    })
  }

  makeMarker(cx, cy, idx, r1, r2, r3) {
  return (
      <Group key={idx}>
        <Shape
          d={makeCircle(cx, cy, r1 * MARKER_RADIUS)}
          fill="green"/>
      <Shape
          d={makeCircle(cx, cy, r2 * MARKER_RADIUS_2)}
          fill="blue"/>
        <Shape
          d={makeCircle(cx, cy, r3 * MARKER_RADIUS_3)}
          fill="red"/>
          </Group>
  );
}

  makePathAndMarkers(data, yTicksCount, containerWidth) {
  let maxValue = 0, i;
  let graphHeight = 150;
  let fullWidth;
  this.markerCords = [];
  let markerRadi = [];
  data.forEach(function(d) {
    if (d.value > maxValue) {
      maxValue = d.value;
    }
  });
  this.heightScaler = 100/maxValue;
  xSpacing = containerWidth / 4;
  var width = containerWidth;
  fullWidth = xSpacing*(data.length-1);
  var max = 0, pathStrArray = ['M0', graphHeight], xCord;
  // Make path and coordinates and find max:
  data.forEach((d, idx) => {
    xCord = idx*xSpacing;
    // Check if we have a new maximum:
    if (d.value > max) {
        max = d.value;
      }
      // Move line to to next x-coordinate:
    pathStrArray.push('L' + xCord);
    // And y-cordinate: (NEED TO NORMALISE TO 100)
    let yCord = graphHeight - d.value * this.heightScaler;
    pathStrArray.push(yCord);
    // Add marker:
    markerRadi.push({
        r1: 0,
        r2: 0,
        r3: 1
    });
    this.markerCords.push({x: xCord, y: yCord});
    // // Add date label:
    // var dateLabel = document.createElementNS(svgns, "text");
    // dateLabel.setAttributeNS(null, 'x', xCord);
    // dateLabel.setAttributeNS(null, 'y', -2);
    // var textNode = document.createTextNode(moment(d.date).format('DD MMM'));
});
  this.setState(Object.assign(this.state, {
    markerRadi: markerRadi
  }));
  // Move to bottom right corner:
  pathStrArray.push('L' + (fullWidth));
  pathStrArray.push(graphHeight);
  // Close path:
  pathStrArray.push('Z');
  let viewBox = (fullWidth-xSpacing*4) + ' ' + (-graphHeight) + ' ' + width + ' ' + graphHeight;
  let outPath = pathStrArray.join(' ');
  console.log('outPath', outPath, 'viewBox', viewBox);
  return {
    viewBox,
    path: outPath,
    width: xCord,
    height: graphHeight,
    maxScroll: xCord - width
  };
}

  render() {
    return (
      <View style={styles.container}>
        <View style={{
          height: 200,
          width: 200,
          maxHeight: 200,
          backgroundColor: 'orange'
          // Use View with border radius instead of circle
        }}>
        <TouchableOpacity onPress={() => this.startAni()}>
          <Surface width={200} height={200}>
           <Shape
              d={makeCircle(100, 100, this.state.markerR3 * 40)}
              fill="green"/>
          <Shape
              d={makeCircle(100, 100, this.state.markerR2 * 30)}
              fill="blue"/>
            <Shape
              d={makeCircle(100, 100, this.state.markerR1 * 20)}
              fill="red"/>
          </Surface>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

export default App;
