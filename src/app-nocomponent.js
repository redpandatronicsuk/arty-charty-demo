import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
  ART,
  TouchableOpacity,
  StatusBar
} from 'react-native';
const {Surface, Group, Shape, LinearGradient} = ART;
import {Spring} from './timing-functions';

const SELCTED_MARKER_ANIMATION_DURATION = 1000;
const SELCTED_MARKER_ANIMATION_DELAY_1 = SELCTED_MARKER_ANIMATION_DURATION * .2;
const SELCTED_MARKER_ANIMATION_DELAY_2 = SELCTED_MARKER_ANIMATION_DURATION * .3;
const UNSELCTED_MARKER_ANIMATION_DURATION = 500;
const UNSELCTED_MARKER_ANIMATION_DELAY_1 = UNSELCTED_MARKER_ANIMATION_DURATION * .2;
const UNSELCTED_MARKER_ANIMATION_DELAY_2 = UNSELCTED_MARKER_ANIMATION_DURATION * .3;
const MARKER_RADIUS = 15;
const MARKER_RADIUS_2 = MARKER_RADIUS * .75;
const MARKER_RADIUS_3 = MARKER_RADIUS * .5;
const MARKER_RADIUS_SQUARED = Math.pow(MARKER_RADIUS, 2);

const SHOW_CLICKS = false;

const GRAPH_GROW_ANIMATION_DURATION = 5000;

const POINTS_ON_SCREEN = 8;

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const images = {
  spring: require('./spring.jpg'),
  summer: require('./summer.jpg'),
  autumn: require('./autumn.jpg'),
  winter: require('./winter.jpg')
};

function makeCircle(cx, cy, r) {
  return `M${cx - r},${cy}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 -${r * 2},0`;
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      trX: 0,
      markerR1: 0,
      clickMarkers: [],
      markerRadi: [],
      image0op: new Animated.Value(1),
      image1op: new Animated.Value(0),
      topText: 'Select month',
      topTextOpacity: new Animated.Value(1),
      bottomText: '',
      bottomTextTrX: new Animated.Value(0),
      bottomTextOpacity: new Animated.Value(1)
    };
    this.activeImage = 0;
  }

  growChart(endTime, duration) {
    requestAnimationFrame(timestamp => {
      let progress = 1 - (endTime - timestamp) / duration;
      this.state = Object.assign(this.state, {
        chartData: this.makePathAndMarkers(this.data, 4, Dimensions.get('window').width, [
          this
            .spring1
            .interpolate(progress),
          this
            .spring2
            .interpolate(progress),
          this
            .spring3
            .interpolate(progress)
        ])
      });
      if (progress < 1) {
        this.growChart(endTime, duration);
      }
    });
  }

  componentWillMount() {
    // Create test data and plot: let millisInDay = 86400000; let now = Date.now();
    // points = [   {date: new Date(now), value: 30},   {date: new
    // Date(now+millisInDay*1.6), value: 50},   {date: new Date(now+millisInDay*3),
    // value: 60},   {date: new Date(now+millisInDay*5.2), value: 25},   {date: new
    // Date(now+millisInDay*6), value: 30},   {date: new Date(now+millisInDay*8.9),
    // value: 70},   {date: new Date(now+millisInDay*12), value: 70},   {date: new
    // Date(now+millisInDay*13), value: 80} ];
    let points = [
      {
        date: new Date('2000-01-01'),
        value: 5,
        txt: '05°'
      }, {
        date: new Date('2000-02-01'),
        value: 7,
        txt: '07°'
      }, {
        date: new Date('2000-03-01'),
        value: 9,
        txt: '09°'
      }, {
        date: new Date('2000-04-01'),
        value: 11,
        txt: '11°'
      }, {
        date: new Date('2000-05-01'),
        value: 14,
        txt: '14°'
      }, {
        date: new Date('2000-06-01'),
        value: 16,
        txt: '16°'
      }, {
        date: new Date('2000-07-01'),
        value: 19,
        txt: '19°'
      }, {
        date: new Date('2000-08-01'),
        value: 19,
        txt: '19°'
      }, {
        date: new Date('2000-09-01'),
        value: 17,
        txt: '17°'
      }, {
        date: new Date('2000-10-01'),
        value: 13,
        txt: '13°'
      }, {
        date: new Date('2000-11-01'),
        value: 10,
        txt: '10°'
      }, {
        date: new Date('2000-12-01'),
        value: 7,
        txt: '07°'
      }
    ];
    this.data = points;
    this.getMaxValue();
    this.makeGradSTops();
    this.state = Object.assign(this.state, {
      chartData: this.makePathAndMarkers(points, 4, Dimensions.get('window').width, 0)
    });
    this.growChart(Date.now() + GRAPH_GROW_ANIMATION_DURATION, GRAPH_GROW_ANIMATION_DURATION);
    // this.state.chartData = this.makePathAndMarkers(points, 4,
    // Dimensions.get('window').width, .1);
    this.selected = true;

    this.spring = new Spring({friction: 150, frequency: 500});
    this.spring1 = new Spring({friction: 300, frequency: 500});
    this.spring2 = new Spring({friction: 300, frequency: 400});
    this.spring3 = new Spring({friction: 300, frequency: 600});
    let sX;
    let moved = false;
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The guesture has started. Show visual feedback so the user knows what is
        // happening!
        sX = this.state.trX;
        moved = false;
        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        this.setState(Object.assign(this.state, {
          trX: Math.min(20, Math.max(sX + gestureState.dx, -this.state.chartData.maxScroll - 20))
        }));
        moved = true;
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the responder. This
        // typically means a gesture has succeeded
        let tmpX = gestureState.x0;
        let tmpY = gestureState.y0;
        if (!moved) {
          this
            .refs
            .chart
            .measure((fx, fy, width, height, px, py) => {
              // this.setState(Object.assign(this.state, { clickMarkers:
              // [...this.state.clickMarkers ,{x: tmpX-px, y: tmpY-py}] }));

              // NOTE: this.state.chartData.height/2 to compensate for negative margin top
              let closestMarker = this.findClosestPoint(this.markerCords, tmpX - px, tmpY - py + this.state.chartData.height / 2);
              if (closestMarker !== undefined) {
                this.onMarkerClick(closestMarker);
                this.makeGradSTops();
              }
            });
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {},
      onShouldBlockNativeResponder: (evt, gestureState) => {
        return true;
      }
    });
  }

  componentDidMount() {}

  findClosestPoint(points, x, y) {
    let closestIdx;
    let closestDist = Number.MAX_VALUE;
    points.forEach((d, idx) => {
      let distSqrd = Math.pow(d.x - x, 2) + Math.pow(d.y - y, 2);
      if (distSqrd < closestDist && distSqrd < MARKER_RADIUS_SQUARED) {
        closestIdx = idx;
        closestDist = distSqrd;
      }
    });
    return closestIdx;
  }

  onMarkerClick(idx) {
    if (idx !== this.state.activeMarker) {
      if (this.state.activeMarker !== undefined) {
        this.startAimateUnselectedMarkerNum(this.state.activeMarker);
      }
      this.startAimateSelectedMarkerNum(idx);
      this.setState(Object.assign(this.state, {activeMarker: idx}));
      // Fix next to animations need to run in sequence with funtion call inbetween,
      // might be cleaner to use Animted.sequence, but don't know how to do calbacks
      // between animations!
      const ANIMATION_TIME = 25;
      let currentMonth = new Date(this.data[this.state.activeMarker].date).getMonth();
      Animated.parallel([
        Animated.timing(this.state.topTextOpacity, {
          toValue: 0,
          duration: ANIMATION_TIME
        })
      ]).start((()=> {
              this.setState(Object.assign(this.state, {topText: monthNames[currentMonth]}));
      }));
      setTimeout(()=> {
        Animated.parallel([
        Animated.timing(this.state.topTextOpacity, {
        toValue: 1,
        duration: ANIMATION_TIME
        })
        ]).start();
      }, ANIMATION_TIME);

        const ANIMATION_TIME_BOTTOM = 250;
        let w = Dimensions.get('window').width*.6;
        Animated.parallel([
          Animated.timing(this.state.bottomTextTrX, {
            toValue: w,
              duration: ANIMATION_TIME_BOTTOM
          }),
          Animated.timing(this.state.bottomTextOpacity, {
            toValue: 0,
              duration: ANIMATION_TIME_BOTTOM
          })
        ]).start(()=> {
          this.setState(Object.assign(this.state, {
            bottomText: this.data[this.state.activeMarker].txt
          }))
        });
        setTimeout(()=> {
          this.state.bottomTextTrX.setValue(-w);
          Animated.parallel([
            Animated.timing(this.state.bottomTextTrX, {
              toValue: 0,
                duration: ANIMATION_TIME_BOTTOM
            }),
            Animated.timing(this.state.bottomTextOpacity, {
            toValue: 1,
              duration: ANIMATION_TIME_BOTTOM
          })
          ]).start();
        }, ANIMATION_TIME_BOTTOM);
      // Animated.sequence([
      //       Animated.timing(this.state.topTextOpacity, {toValue: 0}).start((()=> {
      //         this.setState(Object.assign(this.state, {topText: 'jajaj'}));
      //       })),
      //       Animated.timing(this.state.topTextOpacity, {toValue: 1})
      // ]);
    }
  }

  startAimateSelectedMarkerNum(idx) {
    this.selectedMarkerAnimationEndTime = Date.now() + SELCTED_MARKER_ANIMATION_DURATION;
    this.animateSelectedMarkerNum(idx);
  }

  animateSelectedMarkerNum(idx) {
    requestAnimationFrame((timestamp) => {
      let progressLongest = 1 - ((this.selectedMarkerAnimationEndTime - timestamp) / SELCTED_MARKER_ANIMATION_DURATION);
      let progress2 = 1 - ((this.selectedMarkerAnimationEndTime - timestamp) / (SELCTED_MARKER_ANIMATION_DURATION - SELCTED_MARKER_ANIMATION_DELAY_1));
      let progress3 = 1 - ((this.selectedMarkerAnimationEndTime - timestamp) / (SELCTED_MARKER_ANIMATION_DURATION - SELCTED_MARKER_ANIMATION_DELAY_2));
      if (progressLongest < 1) {
        let markerRadi = this
          .state
          .markerRadi
          .slice();
        markerRadi[idx].r1 = this
          .spring
          .interpolate(progressLongest);
        markerRadi[idx].r2 = this
          .spring
          .interpolate(progress2);
        markerRadi[idx].r3 = this
          .spring
          .interpolate(progress3);
        this.setState(Object.assign(this.state, {markerRadi: markerRadi}));
        if (this.state.activeMarker === idx) {
          this.animateSelectedMarkerNum(idx);
        }
      } else {
        let markerRadi = this
          .state
          .markerRadi
          .slice();
        markerRadi[idx].r1 = 1;
        markerRadi[idx].r2 = 1;
        markerRadi[idx].r3 = 1;
        this.setState(Object.assign(this.state, {markerRadi: markerRadi}));
      }
    })
  }
  startAimateUnselectedMarkerNum(idx) {
    this.unselectedMarkerAnimationEndTime = Date.now() + UNSELCTED_MARKER_ANIMATION_DURATION;
    this.animateUnselectedMarkerNum(idx);
  }

  animateUnselectedMarkerNum(idx) {
    requestAnimationFrame((timestamp) => {
      let progressLongest = ((this.unselectedMarkerAnimationEndTime - timestamp) / UNSELCTED_MARKER_ANIMATION_DURATION);
      let progress2 = ((this.unselectedMarkerAnimationEndTime - timestamp) / (UNSELCTED_MARKER_ANIMATION_DURATION - UNSELCTED_MARKER_ANIMATION_DELAY_1));
      let progress3 = ((this.unselectedMarkerAnimationEndTime - timestamp) / (UNSELCTED_MARKER_ANIMATION_DURATION - UNSELCTED_MARKER_ANIMATION_DELAY_2));
      if (progressLongest > 0) {
        let markerRadi = this
          .state
          .markerRadi
          .slice();
        markerRadi[idx].r1 = this
          .spring
          .interpolate(progressLongest);
        markerRadi[idx].r2 = this
          .spring
          .interpolate(progress2);
        markerRadi[idx].r3 = this
          .spring
          .interpolate(progress3);
        this.setState(Object.assign(this.state, {markerRadi: markerRadi}));
        this.animateUnselectedMarkerNum(idx);
      } else {
        let markerRadi = this
          .state
          .markerRadi
          .slice();
        markerRadi[idx].r1 = 0;
        markerRadi[idx].r2 = 0;
        markerRadi[idx].r3 = 1;
        this.setState(Object.assign(this.state, {markerRadi: markerRadi}));
      }
    })
  }

  makeMarker(cx, cy, idx, r1, r2, r3) {
    return (
      <Group key={idx}>
        <Shape d={makeCircle(cx, cy, r1 * MARKER_RADIUS)} fill="rgba(0,255,0,.75)"/>
        <Shape d={makeCircle(cx, cy, r2 * MARKER_RADIUS_2)} fill="rgba(0,0,255,.75)"/>
        <Shape d={makeCircle(cx, cy, r3 * MARKER_RADIUS_3)} fill="rgba(255,0,0,.75)"/>
      </Group>
    );
  }

  makeGradSTops() {
    let gradStops = {};
    this
      .data
      .forEach((d, idx) => {
        gradStops[(idx / this.data.length) + (.5 / this.data.length)] = `rgba(${ (d.value / this.maxValue) * 255}, 0, ${ ((1 - d.value) / this.maxValue) * 255}, ${this.state.activeMarker === idx
          ? 1
          : (d.value / this.maxValue) * .5})`;
      });
    this.setState(Object.assign(this.state, {gradientStops: gradStops}));
  }

  getMaxValue() {
    this.maxValue = 0;
    this
      .data
      .forEach((d) => {
        if (d.value > this.maxValue) {
          this.maxValue = d.value;
        }
      });
  }

  makePathAndMarkers(data, yTicksCount, containerWidth, ts) {
  let graphHeight = 250;
  let graphHeightOffset = graphHeight / 2;
  let fullWidth;
  this.markerCords = [];
  let markerRadi = [];
  let gradStops = {};
  let heightScaler = (graphHeight-MARKER_RADIUS)/this.maxValue;
  xSpacing = containerWidth / POINTS_ON_SCREEN;
  var width = containerWidth;
  fullWidth = xSpacing*(data.length-1);
  var max = 0, areaStrArray = ['M' + MARKER_RADIUS, graphHeight+graphHeightOffset], lineStrArray = [], xCord;
  // Make path and coordinates and find max:
  data.forEach((d, idx) => {
    xCord = idx*xSpacing + MARKER_RADIUS;
    // Check if we have a new maximum:
    if (d.value > max) {
        max = d.value;
      }
      // Move line to to next x-coordinate:
    areaStrArray.push('L' + xCord);
    lineStrArray.push((idx ? 'L' : 'M') + xCord);
    // And y-cordinate: (NEED TO NORMALISE TO 100)
    let yCord = (graphHeight+graphHeightOffset) - d.value * heightScaler  * ts[idx % ts.length];
    areaStrArray.push(yCord);
    lineStrArray.push(yCord);
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
  areaStrArray.push('L' + (fullWidth + MARKER_RADIUS));
  areaStrArray.push(graphHeight+graphHeightOffset);
  // Close path:
  areaStrArray.push('Z');
  let viewBox = (fullWidth - xSpacing*4) + ' ' + (-graphHeight) + ' ' + width + MARKER_RADIUS + ' ' + graphHeight;
  return {
    viewBox,
    line: lineStrArray.join(' '),
    area: areaStrArray.join(' '),
    width: xCord + MARKER_RADIUS,
    height: graphHeight,
    maxScroll: xCord - width
  };
}

  render() {
    let currentMonth = this.state.activeMarker !== undefined ?
     new Date(this.data[this.state.activeMarker].date).getMonth() :
     null;
     let imageSrc;
     if (currentMonth >= 2 && currentMonth <= 4) {
       imageSrc = 'spring';
     } else if (currentMonth >= 5 && currentMonth <= 7) {
       imageSrc = 'summer';
     } else if (currentMonth >= 8 && currentMonth <= 10) {
       imageSrc = 'autumn';
     } else if (currentMonth >= 11 || currentMonth <= 1) {
       imageSrc = 'winter';
     }
     if (this.lastImagerSrc !== imageSrc) {
       if (this.activeImage === 0) {
         this.imageSrc1 = imageSrc;
         Animated.parallel([
                Animated.timing(
                this.state.image1op,
                {toValue: 1}
              ),
                Animated.timing(
                this.state.image0op,
                {toValue: 0}
              )
              ]).start();
         this.activeImage = 1;
       } else {
         this.imageSrc0 = imageSrc;
         Animated.parallel([
                Animated.timing(
                this.state.image0op,
                {toValue: 1}
              ),
                Animated.timing(
                this.state.image1op,
                {toValue: 0}
              )
              ]).start();
         this.activeImage = 0;
       }
     }
     this.lastImagerSrc = imageSrc;
    return (
      <View style={styles.container}>
      <StatusBar hidden={true} />
      <Animated.Image source={images[this.imageSrc0]} style={[styles.backgroundImage, {opacity: this.state.image0op}]} />
    <Animated.Image source={images[this.imageSrc1]} style={[styles.backgroundImage, {opacity: this.state.image1op/*, top: Dimensions.get('window').height/2*/}]} />
       <Animated.Text style={[styles.topText, {opacity: this.state.topTextOpacity}]}>{this.state.topText}</Animated.Text>
        <View {...this._panResponder.panHandlers} style={{
          transform: [{translateX: this.state.trX}],
          overflow: 'visible',
          marginTop: 10,
          marginBottom: 10
        }}
        ref="chart" >
          <Surface width={this.state.chartData.width} height={this.state.chartData.height+this.state.chartData.height/2}
          style={{backgroundColor: 'rgba(0,0,0,0)', overflow: 'visible', marginTop: -this.state.chartData.height/2}}>
            <Shape
            style={{overflow: 'visible'}}
                d={this.state.chartData.area}
                fill={new LinearGradient(
                  this.state.gradientStops || {
                  '0': 'rgba(0,0,255,0.2)',
                  '0.25':'rgba(125,0,255,.5)',
                  '0.5':'rgba(255,0,125,.5)',
                  '1':'rgba(0,0,255,.2)'
                },
                0,
                0,
                this.state.chartData.width,
                0
            )}/>
            <Shape
                d={this.state.chartData.line}
                stroke="rgba(255,255,255,.5)"
                strokeWidth={3} />
            {this.markerCords.map((d, idx) => {
              return this.makeMarker(d.x, d.y, idx, this.state.markerRadi[idx].r1 , this.state.markerRadi[idx].r2, this.state.markerRadi[idx].r3);
            })}
            {SHOW_CLICKS ? this.state.clickMarkers.map((d, idx) => {
              return (
                <Shape key={idx} d={makeCircle(d.x, d.y, 5)} 
                fill="yellow"/>
              );
            }) : null}
        </Surface>
        </View> 
        {this.state.activeMarker !== undefined ?
          <View style={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={styles.bottomText}>Average temperature: 
            </Text>
            <Animated.Text style={[styles.bottomText, {opacity: this.state.bottomTextOpacity, transform: [{translateX: this.state.bottomTextTrX}]}]}>
            {this.state.bottomText}
            </Animated.Text>
          </View>
        :
      <Text style={styles.bottomText}></Text>}
      </View>
    );
  }
}

const txtShadow = {
    textShadowColor: 'black',
    textShadowRadius: 5,
    padding: 5,
    textShadowOffset: {
        width: 1,
        height: 1
    }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backgroundImage: {
    resizeMode: 'cover', // or 'stretch',
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  topText: {
    backgroundColor: 'transparent',
    fontSize: 64,
    color: 'white',
    ...txtShadow
  },
  bottomText: {
    backgroundColor: 'transparent',
    fontSize: 48,
    color: 'white',
    textAlign: 'center',
    ...txtShadow
  }
});

export default App;
