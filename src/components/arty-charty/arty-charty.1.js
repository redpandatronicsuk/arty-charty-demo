import React, {Component} from 'react';
import {
  Alert,
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
import {Spring} from '../../timing-functions';

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

const GRAPH_HEIGHT = 250;

/**
 * NOTES:
 *        1- Add grpghtype to data and then in the makeChart function,
 *           make specific chart for dataSet and add to array of charts
 *           to be rendered... 
 */

function makeCircle(cx, cy, r) {
  return `M${cx - r},${cy}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 -${r * 2},0`;
}

class ArtyCharty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trX: 0,
      markerRadi: [],
      t: 0,
      gradientStops: []
    };
    this.maxScroll = 0;
  }

  componentWillMount() {
    //this.initChart();
    // Compute constants for all graphs, such as maxValues:
    this.tmpspring = new Spring({friction: 150, frequency: 500});
    this.computeChartConstants();
    this.initChartGrowAnimations();
    this.initPanHandler();
  }

  componentDidMount() {
    this.startAnimateGraph();
  }

  computeChartConstants() {
    this.props.data.forEach(d => {
      d.maxValue = this.getMaxValue(d.data);
    });
  }

  initChartGrowAnimations() {
    let ts = [];
    this.props.data.forEach(d => {
      // Depending on type and props, select approtaley here...
      //d.timingFunctions = [this.tmpspring.interpolate.bind(this.tmpspring)]
      d.timingFunctions = [(t) => {
        return this.tmpspring.interpolate(t);
      }]
      });
  }

  initPanHandler() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        sX = this.state.trX;
        moved = false;
      },
      onPanResponderMove: (evt, gestureState) => {
        this.setState(Object.assign(this.state, {
          trX: Math.min(20, Math.max(sX + gestureState.dx, -this.maxScroll - 20))
        }));
        moved = true;
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        let tmpX = gestureState.x0;
        let tmpY = gestureState.y0;
        if (!moved) {
          this
            .refs
            .chart
            .measure((fx, fy, width, height, px, py) => {
              if (this.showLineMarkers) {
                // NOTE: this.state.chartData.height/2 to compensate for negative margin top
                let closestMarker = this.findClosestMarker(this.markerCords, tmpX - px, tmpY - py + this.state.chartData.height / 2);
                if (closestMarker !== undefined) {
                  this.onMarkerClick(closestMarker);
                  this.makeGradStops(maxValue);
                  // NEED TO MOVER ALL THIS STUFF PUT OF HERE!!!!
                }
              } else {
                let clickedBar = this.findClickedBar(this.barCords, tmpX - px, tmpY - py + this.state.chartData.height / 2);
                if (clickedBar !== undefined) {
                  this.onMarkerClick(clickedBar);
                  this.makeGradStops(maxValue);
                }
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

  componentWillReceiveProps(nextProps) {
    console.log('next props', nextProps, nextProps === this.props, nextProps.data === this.props.data);
    // if (this.props.data !== nextProps.data ||
    //  this.props.chartType !== nextProps.chartType ||
    //  this.props.pointsOnScreen !== nextProps.pointsOnScreen) {
    //   this.props = nextProps;
    //   //this.initChart();
    // }
    if (this.props.data !== nextProps.data ||
     this.props.pointsOnScreen !== nextProps.pointsOnScreen) {
      this.props = nextProps;
      //this.initChart();
      //this.computeChartConstants();
    }
  }

  makeChart(chart) {
    // Here rather than switch, make it part of the data object.
    // E.G. it should contain graph type data, etc...
    // make lines to show multiple lines...
    // this.makeGraphFunctions = [];
    let makeGraphFunction;
    switch(chart.type) {
      case 'area':
        // this.showLine = chart.showLine || true;
        // this.showLineMarkers = chart.showLineMarkers || true;
        // this.makeGraphFunctions.push(this.makePathAndMarkersArea.bind(this));
        makeGraphFunction = this.makePathAndMarkersArea.bind(this);
        break;
      case 'line':
        // this.showLineMarkers = chart.showLineMarkers || true;
        // this.makeGraphFunctions.push(this.makePathAndMarkersArea.bind(this));
        makeGraphFunction = this.makePathAndMarkersArea.bind(this);
        break;
      case 'bars':
        // this.makeGraphFunctions.push(this.makePathAndMarkersBar.bind(this));
        makeGraphFunction = this.makePathAndMarkersBar.bind(this);
        break;
    }
    let maxValue = this.getMaxValue();
    this.makeGradStops(maxValue);
    let out = makeGraphFunction(Dimensions.get('window').width, 1, maxValue);
    // this.makeGraphFunctions.forEach((fn) => {
    //     this.state = Object.assign(this.state, {
    //     chartData: fn(Dimensions.get('window').width, 0)
    //   });
    // });

    // this.growChart(Date.now() + GRAPH_GROW_ANIMATION_DURATION, GRAPH_GROW_ANIMATION_DURATION);

    this.spring = new Spring({friction: 150, frequency: 500});
    this.spring1 = new Spring({friction: 300, frequency: 500});
    this.spring2 = new Spring({friction: 300, frequency: 400});
    this.spring3 = new Spring({friction: 300, frequency: 600});
    let sX;
    let moved = false;
    return out;
  }

  growChart(endTime, duration) {
    requestAnimationFrame(timestamp => {
      let progress = 1 - (endTime - timestamp) / duration;
      this.makeGraphFunctions.forEach(fn => {
        this.state = Object.assign(this.state, {
        chartData: fn(Dimensions.get('window').width, [
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
    });
      if (progress < 1) {
        this.growChart(endTime, duration);
      }
    });
  }

  findClosestMarker(points, x, y) {
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

  findClickedBar(points, x, y) {
    let closestIdx;
    points.some((d, idx) => {
      console.log(idx);
      if ((d.x1 <= x && x <= d.x2) && (d.y1 <= y && y <= d.y2)) {
        closestIdx = idx;
        return true;
      }
      return false;
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
      this.props.onMarkerClick(idx);
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

  makeGradStops(maxValue) {
    let gradStops = {};
    this.props
      .data
      .forEach((d, idx) => {
        gradStops[(idx / this.props.data.length) + (.5 / this.props.data.length)] = `rgba(${ (d.value / this.maxValue) * 255}, 0, ${ ((1 - d.value) / this.maxValue) * 255}, ${this.state.activeMarker === idx
          ? 1
          : (d.value / maxValue) * .5})`;
      });
    this.setState(Object.assign(this.state, {gradientStops: gradStops}));
  }

  getMaxValue(arr) {
    let maxValue = 0
    arr
      .forEach((d) => {
        if (d.value > maxValue) {
          maxValue = d.value;
        }
      });
      return maxValue;
  }

  /**
   * Function to create the SVG paths for the bar chart.
   */
  makePathAndMarkersBar(containerWidth, ts, maxValue) {
    let graphHeightOffset = GRAPH_HEIGHT / 2;
    let padLeft = 10;
    let fullWidth;
    let heightScaler = (GRAPH_HEIGHT-MARKER_RADIUS)/maxValue;
    xSpacing = containerWidth / (this.props.pointsOnScreen || POINTS_ON_SCREEN);
    let barWidth = xSpacing - padLeft;
    var width = containerWidth;
    fullWidth = padLeft/2 + (padLeft+barWidth) * (this.props.data.length-1) + barWidth;
    var max = 0,pathStr = [], xCord;
    this.barCords = [];
    // Make bars:
    this.props.data.forEach((d, idx) => {
      let x1 = padLeft/2 + (padLeft+barWidth) * idx;
      let y1 = (GRAPH_HEIGHT+graphHeightOffset) - d.value * heightScaler * ts[idx % ts.length];
      let y2 = (GRAPH_HEIGHT+graphHeightOffset);
      pathStr.push('M');
      pathStr.push(x1);
      pathStr.push(y2);
      pathStr.push('H');
      pathStr.push(x1 + barWidth);
      pathStr.push('V');
      pathStr.push(y1);
      pathStr.push('H');
      pathStr.push(x1);
      pathStr.push('V');
      pathStr.push(y2);
      this.barCords.push({x1: x1, x2: x1+barWidth, y1: y1, y2: y2});
  });
  // Force render update:
  this.forceUpdate();
    let viewBox = (fullWidth - xSpacing*4) + ' ' + (-GRAPH_HEIGHT) + ' ' + width + MARKER_RADIUS + ' ' + GRAPH_HEIGHT;
    return {
      viewBox,
      bars: pathStr.join(' '),
      width: fullWidth,
      height: GRAPH_HEIGHT,
      maxScroll: fullWidth - containerWidth
    };
  }

  makeAreaChartPath(chart, width, t) {
    let graphHeightOffset = GRAPH_HEIGHT / 2;
    let heightScaler = (GRAPH_HEIGHT-MARKER_RADIUS)/chart.maxValue;
    let xSpacing = width / (this.props.pointsOnScreen || POINTS_ON_SCREEN);
    let fullWidth = xSpacing*(chart.data.length-1);
    let areaStrArray = ['M' + MARKER_RADIUS, GRAPH_HEIGHT+graphHeightOffset];
    let xCord;
    chart.data.forEach((d, idx) => {
        xCord = idx*xSpacing + MARKER_RADIUS;
        // Move line to to next x-coordinate:
        areaStrArray.push('L' + xCord);
        // And y-cordinate:
        let yCord = (GRAPH_HEIGHT+graphHeightOffset) - d.value * heightScaler  * chart.timingFunctions[idx % chart.timingFunctions.length](t);
        areaStrArray.push(yCord);
    });
    areaStrArray.push('L' + (fullWidth + MARKER_RADIUS));
    areaStrArray.push(GRAPH_HEIGHT+graphHeightOffset);
    areaStrArray.push('Z');
    return {
      path: areaStrArray.join(' '),
      width: xCord + MARKER_RADIUS
    };
  }

  makeLineChartPath(chart, width, t) {
    let graphHeightOffset = GRAPH_HEIGHT / 2;
    let heightScaler = (GRAPH_HEIGHT-MARKER_RADIUS)/chart.maxValue;
    let xSpacing = width / (this.props.pointsOnScreen || POINTS_ON_SCREEN);
    let fullWidth = xSpacing*(chart.data.length-1);
    let lineStrArray = []
    let xCord;
    chart.data.forEach((d, idx) => {
        xCord = idx*xSpacing + MARKER_RADIUS;
        lineStrArray.push((idx ? 'L' : 'M') + xCord);
        let yCord = (GRAPH_HEIGHT+graphHeightOffset) - d.value * heightScaler  * chart.timingFunctions[idx % chart.timingFunctions.length](t);
        lineStrArray.push(yCord);
    });
    return {path: lineStrArray.join(' ')};
  }

  /**
   * Function to create the SVG paths for the area and line chart.
   */
  makePathAndMarkersArea(data, containerWidth, ts, maxValue) {
  let graphHeightOffset = GRAPH_HEIGHT / 2;
  let fullWidth;
  this.markerCords = [];
  let markerRadi = [];
  let heightScaler = (GRAPH_HEIGHT-MARKER_RADIUS)/maxValue;
  xSpacing = containerWidth / (this.props.pointsOnScreen || POINTS_ON_SCREEN);
  var width = containerWidth;
  fullWidth = xSpacing*(data.length-1);
  var max = 0, areaStrArray = ['M' + MARKER_RADIUS, GRAPH_HEIGHT+graphHeightOffset], lineStrArray = [], xCord;
  // Make path and coordinates:
  data.forEach((d, idx) => {
    xCord = idx*xSpacing + MARKER_RADIUS;
    // Move line to to next x-coordinate:
    areaStrArray.push('L' + xCord);
    lineStrArray.push((idx ? 'L' : 'M') + xCord);
    // And y-cordinate:
    let yCord = (GRAPH_HEIGHT+graphHeightOffset) - d.value * heightScaler  * ts[idx % ts.length];
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
  // this.setState(Object.assign(this.state, {
  //   markerRadi: markerRadi
  // }));
  // Move to bottom right corner:
  areaStrArray.push('L' + (fullWidth + MARKER_RADIUS));
  areaStrArray.push(GRAPH_HEIGHT+graphHeightOffset);
  // Close path:
  areaStrArray.push('Z');
  let viewBox = (fullWidth - xSpacing*4) + ' ' + (-GRAPH_HEIGHT) + ' ' + width + MARKER_RADIUS + ' ' + GRAPH_HEIGHT;
  return {
    viewBox,
    line: lineStrArray.join(' '),
    area: areaStrArray.join(' '),
    width: xCord + MARKER_RADIUS,
    height: GRAPH_HEIGHT,
    // maxScroll should be global in this class!!
    maxScroll: xCord - width
  };
}

startAnimateGraph() {
  this.animateGraph(Date.now() + GRAPH_GROW_ANIMATION_DURATION);
}

animateGraph(endTime) {
  requestAnimationFrame(timestamp => {
    if (timestamp >= endTime) {
      return this.setState(Object.assign(this.state, {
        t: 1
      }));
    } else {
      this.setState(Object.assign(this.state, {
        t: 1 - (endTime - timestamp) / GRAPH_GROW_ANIMATION_DURATION
      }));
      this.animateGraph(endTime);
    }
  });
}

  render() {
    let width = Dimensions.get('window').width;
    // Move currentMonth computation outside of render!
    let currentMonth = this.state.activeMarker !== undefined ?
     new Date(this.props.data[this.state.activeMarker].date).getMonth() :
     null;
     let charts = this.props.data.map((chart, idx) =>  {
       let chartData;
       let charts = [];
       switch (chart.type) {
         case 'area':
            chartData = this.makeAreaChartPath(chart, width, this.state.t);
            charts.push(<Shape key={idx} d={chartData.path}
              fill={new LinearGradient(
                  this.state.gradientStops[idx] || {
                  '0': 'rgba(0,0,255,0.2)',
                  '0.25':'rgba(125,0,255,.5)',
                  '0.5':'rgba(255,0,125,.5)',
                  '1':'rgba(0,0,255,.2)'
                },
                0,
                0,
                chartData.width,
                0
            )}
            />);
            // charts.push(<Shape key={idx+1} fill="red" d={chartPath}/>);
            //break;
           // Try group with adding more than ione later...
           // CHANGE THIS TO MAKE AREA CHART PATH FUNCTION!!!!
          //  chartData = this.makeChart(chart);
          //  return <Shape
          //   style={{overflow: 'visible'}}
          //       d={chartData.area}
          //   //     fill={new LinearGradient(
          //   //       this.state.gradientStops111 || {
          //   //       '0': 'rgba(0,0,255,0.2)',
          //   //       '0.25':'rgba(125,0,255,.5)',
          //   //       '0.5':'rgba(255,0,125,.5)',
          //   //       '1':'rgba(0,0,255,.2)'
          //   //     },
          //   //     0,
          //   //     0,
          //   //     chartData.width,
          //   //     0
          //   // )}
          //   />;
          case 'line':
            let chartData = this.makeLineChartPath(chart, width, this.state.t);
            charts.push(<Shape
                  key={idx + 10000} 
                  d={chartData.path}
                  stroke="rgba(255,255,255,.5)"
                  strokeWidth={3} />);
            break;
          case 'bars':
            return <Shape
                  d={this.state.chartData.bars}
                  stroke="rgba(255,255,255,.5)"
                  strokeWidth={3}
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
            )} />
       }
       return charts;
       // Also add line markers to group if needed...
    //    {this.showLineMarkers ? this.markerCords.map((d, idx) => {
    //           return this.makeMarker(d.x, d.y, idx, this.state.markerRadi[idx].r1 , this.state.markerRadi[idx].r2, this.state.markerRadi[idx].r3);
    //  }): null}
     });
    return (
        <View {...this._panResponder.panHandlers} style={[styles.container, {
          transform: [{translateX: this.state.trX}],
          width: width
        }]}
        ref="chart" >
          <Surface width={width} height={GRAPH_HEIGHT+GRAPH_HEIGHT/2}
          style={{backgroundColor: 'rgba(0,0,0,0)', overflow: 'visible', marginTop: -GRAPH_HEIGHT/2}}>
          {charts}
        </Surface>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
          overflow: 'visible',
          marginTop: 10,
          marginBottom: 10
  }
});

export default ArtyCharty;
