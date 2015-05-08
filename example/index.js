var wrapper = document.querySelector('.main'),
    bottomBar =document.querySelector('.bottom-bar blocks-bottom blocks-holder'),
tracker = new PointerTracker(wrapper),
    gesture = new GestureTracker(wrapper),
    allowClick = true,
    color = 'rgba(0, 250, 0, 0.6)',
    leftOptions = {
        align: 'left',
        maxWidth: '50%',
        animationTime: 1000,
        overlayBackground: color,
        onActionEnd: onActionEnd
    },
    rightOptions = {
        align: 'right',
        maxWidth: '50%',
        animationTime: 1000,
        overlayBackground: color,
        onActionEnd: onActionEnd
    },
    topOptions = {
        align: 'top',
        maxWidth: '37%',
        animationTime: 1000,
        overlayBackground: color,
        onActionEnd: onActionEnd
    },
    bottomOptions = {
        align: 'bottom',
        maxWidth: '37%',
        animationTime: 1000,
        overlayBackground: color,
        onActionEnd: onActionEnd
    },
    drawer = new Drawer(wrapper, rightOptions);
    drawer.setState(false);
function onActionEnd(drawerState) {
    console.log(drawerState ? 'close' : 'open');
}

document.querySelector('button').addEventListener('click', function (event) {
        drawer.setState(!drawer.isClosed());
    },
    false);

function closeDrawer() {
    drawer.setState(true);
};

function onLeftItemClick() {
    if (allowClick) {
        changeState(leftOptions);
    }
}
;
function onRightItemClick() {
    if (allowClick) {
        changeState(rightOptions);
    }
};
function onTopItemClick() {
    if (allowClick) {
        changeState(topOptions);
    }
};
function onBottomItemClick() {
    if (allowClick) {
        changeState(bottomOptions);
    }
};

function changeState(options) {
    allowClick = false;
    if (!drawer.isClosed()) {
        drawer.setState(true, function () {
            drawer.destroy();
            drawer = null;
            drawer = new Drawer(wrapper, options);
            //drawer.setState(false, function () {
            //    allowClick = true;
            //});
            setTimeout( function() {
                    drawer.setState(false, function () {
                        allowClick = true;
                    })
                }, 1
            )
        });
    } else {
        drawer.destroy();
        drawer = null;
        drawer = new Drawer(wrapper, options);
        drawer.setState(false, function (){
            allowClick = true;
        });
    }
};

//function initAndOpen(options){
//    drawer = new Drawer(wrapper, options);
//    drawer.setState(false, function (){
//        allowClick = true;
//    });
//}
