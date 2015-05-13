var wrapper = document.querySelector('.main'),
    buttonsControl ={
        leftButton :document.getElementById('align-left'),
        rightButton :document.getElementById('align-right'),
        topButton :document.getElementById('align-top'),
        bottomButton :document.getElementById('align-bottom'),
        disabled : function(status){
            this.leftButton.disabled = status;
            this.rightButton.disabled = status;
            this.topButton.disabled = status;
            this.bottomButton.disabled = status;
        }
    },
    tracker = new PointerTracker(wrapper),
    gesture = new GestureTracker(wrapper),
    allowClick = true,
    color = 'rgba(0, 250, 0, 0.6)',
    leftOptions = {
        align: 'left',
        maxSize: '50%',
        animationTime: 1000,
        overlayBackground: color,
        onActionEnd: onActionEnd,
        onActionStart: onActionStart
    },
    rightOptions = {
        align: 'right',
        maxSize: '50%',
        animationTime: 1000,
        overlayBackground: color,
        onActionEnd: onActionEnd,
        onActionStart: onActionStart
    },
    topOptions = {
        align: 'top',
        maxSize: '37%',
        animationTime: 1000,
        overlayBackground: color,
        onActionEnd: onActionEnd,
        onActionStart: onActionStart
    },
    bottomOptions = {
        align: 'bottom',
        maxSize: '37%',
        animationTime: 1000,
        overlayBackground: color,
        onActionEnd: onActionEnd,
        onActionStart: onActionStart
    },
    drawer = new Drawer(wrapper, leftOptions);
drawer.setState(false);

function onActionEnd(drawerState) {
    buttonsControl.disabled(false);
    console.log(drawerState ? 'close' : 'open');
}

function onActionStart(drawerState) {
    buttonsControl.disabled(true);
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
        drawer.setonActionEndCallback(function () {
            drawer.destroy();
            drawer = null;
            drawer = new Drawer(wrapper, options);
            drawer.setonActionEndCallback(function () {
                allowClick = true;
                buttonsControl.disabled(false);
            });
            drawer.setState(false);
        });
        drawer.setState(true);
    } else {
        drawer.destroy();
        drawer = null;
        drawer = new Drawer(wrapper, options);
        drawer.setonActionEndCallback(function () {
            allowClick = true;
            buttonsControl.disabled(false);
        });
        drawer.setState(false);
    }
};
