# Drawer
Organize widgets as drawer view and content view inside wrapper view.
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

Next step make instance of Drawer with wrapper element
```javascript
var wrapper = document.querySelector('.wrapper_layer'),
drawer = new Drawer(wrapper);
```
Now your widget will have next view when drawer is close

![GitHub Logo](/img/drawer2.png)

and such view when drawer is open

![GitHub Logo](/img/drawer3.png)
###Options parameters
|Parametr| Default value             |Description|
|--------|:-------------------------:|-----------|
|align|left| set align for drawer: left/right/top/bottom| 
|overlay|true                      | Add overlay layer over content layout|
|overlayOpacity| true|Makes overlay layer opaque if set as true or transparent if set false|
|overlayBackground| rgba(0, 0, 0, 0.4)| Color which will be filled overlay layer|
|swipe| true| Enable/Disable swiping content layout|
|preventMove| true| Enable/Disable native scroll in drover layout for Android OS|
|resizeEvent| true| Allows automatically resizes drawer and content layouts|
|maxWidth| 70%|Percent value of drawer layout width|
|startTrackingZone| 20%| Percent value of area width which allows swipe content layout|
|animationTime| 350|Duration of animation close/open drawer bar in ms| 
|onActionEnd| empty function| Callback functions will be called when drawer change state from close to open or conversely|
