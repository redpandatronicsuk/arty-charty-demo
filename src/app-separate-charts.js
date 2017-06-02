import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import {ArtyCharty} from './components';
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
  spring: require('../assets/img/spring.jpg'),
  summer: require('../assets/img/summer.jpg'),
  autumn: require('../assets/img/autumn.jpg'),
  winter: require('../assets/img/winter.jpg')
};

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      image0op: new Animated.Value(1),
      image1op: new Animated.Value(0),
      // image0br: new Animated.Value(0),
      // image1br: new Animated.Value(0),
      topText: 'Select month',
      topTextOpacity: new Animated.Value(1),
      bottomText: '',
      bottomTextTrX: new Animated.Value(0),
      bottomTextOpacity: new Animated.Value(1),
      chartType: 'area',
      pointsOnScreen: 8
    };
    this.activeImage = 0;
  }

  componentWillMount() {
    console.log('app starting...');
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
  }

  onMarkerClick(idx) {
    if (idx !== this.state.activeMarker) {
      this.setState(Object.assign(this.state, {activeMarker: idx}));
      // Fix next to animations need to run in sequence with funtion call inbetween,
      // might be cleaner to use Animted.sequence, but don't know how to do calbacks
      // between animations!
      const ANIMATION_TIME = 25;
      let currentMonth = new Date(this.data[this.state.activeMarker].date).getMonth();
      Animated
        .parallel([Animated.timing(this.state.topTextOpacity, {
          toValue: 0,
          duration: ANIMATION_TIME
        })])
        .start((() => {
          this.setState(Object.assign(this.state, {topText: monthNames[currentMonth]}));
        }));
      setTimeout(() => {
        Animated
          .parallel([Animated.timing(this.state.topTextOpacity, {
            toValue: 1,
            duration: ANIMATION_TIME
          })])
          .start();
      }, ANIMATION_TIME);

      const ANIMATION_TIME_BOTTOM = 250;
      let w = Dimensions
        .get('window')
        .width * .6;
      Animated.parallel([
        Animated.timing(this.state.bottomTextTrX, {
          toValue: w,
          duration: ANIMATION_TIME_BOTTOM
        }),
        Animated.timing(this.state.bottomTextOpacity, {
          toValue: 0,
          duration: ANIMATION_TIME_BOTTOM
        })
      ]).start(() => {
        this.setState(Object.assign(this.state, {
          bottomText: this.data[this.state.activeMarker].txt
        }))
      });
      setTimeout(() => {
        this
          .state
          .bottomTextTrX
          .setValue(-w);
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
    }
  }

  render() {
    let currentMonth = this.state.activeMarker !== undefined
      ? new Date(this.data[this.state.activeMarker].date).getMonth()
      : null;
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
        Animated.sequence([
          Animated.parallel([
            Animated.timing(this.state.image1op, {toValue: 1}),
            Animated.timing(this.state.image0op, {toValue: 0})
          ]),
          // Blur radius animation doesn't seem to work
          // Animated.timing(this.state.image0br, {
          //   toValue: 0,
          //   duration: 0
          // }),
          // Animated.delay(1000),   Animated.timing(   this.state.image1br,   {toValue:
          // 10, duration: 5000} )
        ]).start();
        this.activeImage = 1;
      } else {
        this.imageSrc0 = imageSrc;
        Animated.sequence([
          Animated.parallel([
            Animated.timing(this.state.image0op, {toValue: 1}),
            Animated.timing(this.state.image1op, {toValue: 0})
          ]),
          // Blur radius animation doesn't seem to work
          // Animated.timing(this.state.image1br, {
          //   toValue: 0,
          //   duration: 0
          // }),
          // Animated.delay(1000),   Animated.timing(   this.state.image0br,   {toValue:
          // 10, duration: 5000} )
        ]).start();
        this.activeImage = 0;
      }
    }
    this.lastImagerSrc = imageSrc;
    return (
      <View style={styles.container}>
        <StatusBar hidden={true}/>
        <Animated.Image
          blurRadius={this.state.image0br}
          source={images[this.imageSrc0]}
          style={[
          styles.backgroundImage, {
            opacity: this.state.image0op
          }
        ]}/>
        <Animated.Image
          blurRadius={this.state.image1br}
          source={images[this.imageSrc1]}
          style={[
          styles.backgroundImage, {
            opacity: this.state.image1op
          }
        ]}/>
        <View style={styles.chartTypeButtonContainer}>
          <TouchableOpacity style={[styles.chartTypeButton, {backgroundColor: 'rgba(255,0,0,.3)'}]}
           onPress={()=>{
            this.setState(Object.assign(this.state, {chartType: 'area'}));
          }}>
            <Text style={styles.chartTypeText}>Area</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chartTypeButton, {backgroundColor: 'rgba(0,255,0,.3)'}]}
           onPress={()=>{
            this.setState(Object.assign(this.state, {chartType: 'line'}));
          }}>
            <Text style={styles.chartTypeText}>Line</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chartTypeButton, {backgroundColor: 'rgba(0,0,255,.3)'}]}
           onPress={()=>{
            this.setState(Object.assign(this.state, {chartType: 'bars'}));
          }}>
            <Text style={styles.chartTypeText}>Bars</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chartTypeButton, {backgroundColor: 'rgba(255,255,0,.3)'}]}
           onPress={()=>{
            this.setState(Object.assign(this.state, {chartType: 'line-bars'}));
          }}>
            <Text style={styles.chartTypeText}>Line+Bars</Text>
          </TouchableOpacity>
        </View>
        <View style={{
          flexDirection: 'row',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: Dimensions.get('window').width,
          height: 50,
          justifyContent: 'space-around',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,.2)'
        }}>
          <TouchableOpacity onPress={()=>{
            this.setState(Object.assign(this.state, {
              pointsOnScreen: this.state.pointsOnScreen-1
            }));
          }}>
          <Text style={[styles.crementButton]}>-</Text>
          </TouchableOpacity>
          <View style={{
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Text style={{fontSize: 16, fontWeight: '700', color: 'white'}}>Points on screen:</Text>
            <Text style={{fontSize: 20, fontWeight: '900', color: 'white'}}>{this.state.pointsOnScreen}</Text>
          </View>
          <TouchableOpacity onPress={()=>{
            this.setState(Object.assign(this.state, {
              pointsOnScreen: this.state.pointsOnScreen+1
            }));
          }}>
          <Text style={[styles.crementButton]}>+</Text>
          </TouchableOpacity>
        </View>
        <Animated.Text
          style={[
          styles.topText, {
            opacity: this.state.topTextOpacity
          }
        ]}>{this.state.topText}</Animated.Text>
        <ArtyCharty
          data={this.data}
          chartType={this.state.chartType}
          pointsOnScreen={this.state.pointsOnScreen}
          onMarkerClick={this
          .onMarkerClick
          .bind(this)}/>
        <View style={styles.bottomTextContainer}>
          <Text style={styles.bottomText}>{this.state.activeMarker !== undefined
              ? 'Average temperature: '
              : ''}</Text>
          <Animated.Text
            style={[
            styles.bottomText, {
              opacity: this.state.bottomTextOpacity,
              transform: [
                {
                  translateX: this.state.bottomTextTrX
                }
              ]
            }
          ]}>
            {this.state.bottomText}
          </Animated.Text>
        </View>
      </View>
    );
  }
}

const txtShadow = {
  color: 'white',
  textShadowColor: 'black',
  textShadowRadius: 5,
  padding: 15,
  textShadowOffset: {
    width: 1,
    height: 1
  },
  backgroundColor: 'transparent'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  backgroundImage: {
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions
      .get('window')
      .width,
    height: Dimensions
      .get('window')
      .height
  },
  topText: {
    fontSize: 64,
    fontWeight: '200',
    ...txtShadow
  },
  bottomText: {
    fontWeight: '100',
    fontSize: 48,
    textAlign: 'center',
    ...txtShadow,
    textShadowRadius: 3,
    padding: 3
  },
  bottomTextContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,.2)',
    borderRadius: 25
  },
  chartTypeButtonContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: 30
  },
  chartTypeButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chartTypeText: {
    color: 'white',
    ...txtShadow,
    padding: 3,
    fontWeight: 'bold'
  },
  crementButton: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white'
  }
});

export default App;
