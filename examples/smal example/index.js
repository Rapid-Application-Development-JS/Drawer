var wrapper = document.querySelector('.main'),
  tracker = new PointerTracker(wrapper),
  gesture = new GestureTracker(wrapper),
  allowClick = true,
  leftOptions = {
    align: 'left',
    maxSize: '300px',
    animationTime: 1000,
    overlayBackground: 'rgba(0, 250, 0, 0.6)'
  },
  drawer = new Drawer(wrapper, leftOptions);
drawer.setState(false);

document.querySelector('button').addEventListener('click', function (event) {
    drawer.setState(!drawer.isClosed());
  },
  false);

function closeDrawer() {
  drawer.setState(true);
};
