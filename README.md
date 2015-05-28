# Drawer
Organize widgets as drawer and content layers inside wrapper layer.

[Example](http://rapid-application-development-js.github.io/Drawer/example/)

###Dependency
- [Pointer](https://github.com/Rapid-Application-Development-JS/Pointer)
- [Gesture](https://github.com/Rapid-Application-Development-JS/Gesture)

Drawer can work with different devices and support different user input method such as mouse or touch. Therefore your wrapper layer should support point and tap events, it is needed for compatibility with different devices.
Drawer uses next events:
- tap
- pointerup
- pointermove
- pointerdown
- pointercancel
- fling

so before instance drawer you should add support pointer and tap events for wrapper layer. We recommend use our modules [Pointer](https://github.com/Rapid-Application-Development-JS/Pointer) and [Gesture](https://github.com/Rapid-Application-Development-JS/Gesture).
###Initialization
At first You should make wrapper layer with two layers first layer will be used as drawer, second one as content.
```HTML
<div class = "wrapper_layer">
    <div class="drawer_layer">

    </div>
    <div class="content_layer">
        
    </div>
</div>
```
![GitHub Logo](/img/drawer1.png)

Next step - make instance of Drawer with wrapper element.
```javascript
var wrapper = document.querySelector('.wrapper_layer'),
    tracker = new PointerTracker(wrapper),
    gesture = new GestureTracker(wrapper);
drawer = new Drawer(wrapper);
```
Now your widget will have next view when drawer is close

![GitHub Logo](/img/drawer2.png)

and such view when drawer is open

![GitHub Logo](/img/drawer3.png)
####Options parameters
You can customize behavior of drawer for this you should initialize drawer with options object
```javascript
    drawer = new Drawer(wrapper, {
        align: 'right',
        maxSize: '30%',
        startTrackingZone: '50',
        animationTime: 1000,
        onActionEnd: function (drawerState) {
            console.log(drawerState ? 'close' : 'open');
        }
    });
```
Here is list of options object fields. if you don't set one or more fields they will be set with default value. If you init drawer without options object, 
```javascript
drawer = new Drawer(wrapper);
```
drawer will be init with default parameters from this list.

|Parametr| Default value             |Description|
|--------|:-------------------------:|-----------|
|align|left| set align for drawer: left/right/top/bottom| 
|overlay|true                      | Add overlay layer over content layout|
|overlayOpacity| true|Makes overlay layer opaque if set as true or transparent if set false|
|overlayBackground| rgba(0, 0, 0, 0.4)| Color which will be filled overlay layer|
|swipe| true| Enable/Disable swiping content layout|
|preventMove| true| Enable/Disable native scroll in drover layout for Android OS|
|resizeEvent| true| Allows automatically resizes drawer and content layouts|
|maxSize| 70%|Percent or pixel value of drawer layout width|
|startTrackingZone| 20%| Percent value of area width which allows swipe content layout|
|animationTime| 350|Duration of animation close/open drawer bar in ms| 
|onActionEnd| empty function| Callback functions will be called after drawer changes state from close to open or conversely|
|onActionStart|empty function| Callback functions will be called before drawer changes state from closed to open or conversely|
###Methods
####setState(close)
Close Drower if argument `close` is `true` and open Drawer if `close` is `false`. If you will try set current drawer state nothing happens.
 ```javascript
drawer.setState(false); //opens drawer if it was closed
```
####setEnableSwipe(isEnable)
 Enable/Disable reaction for swipe gesture. You can change state of swipe any time, this key has the same behavior as `swipe` field of options object.
 ```javascript
drawer.setEnableSwipe(false);
```
####isEnableSwipe()
Return boolean value is swipe mode enabled or disabled. 
 ```javascript
 var isEnable = drawer.isEnableSwipe();
 ```
####isClosed()
 Return boolean value about drawer state `true` - if is close, `false` - if is open. 
  ```javascript
 var isDrawerClose =drawer.isClosed();
 ```
####setOnActionStartCallback(onActionStartCallback)
Method takes as parameter callback function. It rewrites callback function that was set in options parameter `onActionStart` and has the same behavior.
  ```javascript
        drawer.setOnActionStartCallback(function (state) {
            console.log("Action start");
        });
 ```
####setOnActionEndCallback(onActionEndCallback)
Method takes as parameter callback function. It rewrites callback function that was set in options parameter `onActionEnd` and has the same behavior.
  ```javascript
        drawer.setOnActionEndCallback(function (state) {
            console.log("Action end");
        });
 ```
####refresh()
Updates size parameters of wrapper, drawer and content layers. This method will be automatically called when content layer will be resized. It need for correct work of drawer after size was changed.
  ```javascript
drawer.refresh();
 ```
