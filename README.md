#ARTy Charty
## A React Native charting library using React Native ARTy
![Demo video](https://github.com/redpandatronicsuk/arty-charty-demo/raw/master/stuff/output-5fps.gif)

Demo app showcasing charts from ARTy Charty React Native plugin.
See the code in the `src` folder for how the charts where produced and 
how to use the callback functions to have the charts interact with the app.

# Usage
To compile the app ensure that you have React Native and npm installed.
Then in the base directory:
```
npm i
react-native run-ios #to launch the app on the iOS simulator
react-native run-android #to launch the app an android simulator or connected device
```

If the app doen't run in iOS, you need to link the ART library to your project in XCode.
ART comes bundled with React Native, but is not linked by default.
First open the project in XCode (`ios/ARTyCharty.xcodeproj`) and then:

1. Add the file from `node_modules/react-native/Libraries/ART/ART.xcodeproj` to the project by dragging into XCode
2. To link it, go to the *Build Phases* tab and look for the *Link Binary With Libraries* list.
Click on the **+** button below the list.
3. In the window that pops up select `libART.a` and click the *Add* button.

![XCode instructions 1](https://github.com/redpandatronicsuk/arty-charty-demo/raw/master/stuff/xcode-instructions-1.png)
![XCode instructions 2](https://github.com/redpandatronicsuk/arty-charty-demo/raw/master/stuff/xcode-instructions-1.png)
