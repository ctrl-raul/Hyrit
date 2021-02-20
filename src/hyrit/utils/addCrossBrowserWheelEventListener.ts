/* Notes
 * 1. At this point in time all browsers support the 'wheel' event, but only 80% of their versions.
 * 2. IE 9 and 10 does not have the 'onwheel' property in elements though supports it via addEventListener
 * 3. Most modern browsers support more than one of the events tested
 */

type Delta = -1 | 1;

type Parameters = [
  element: HTMLElement,
  listener: (event: WheelEvent, delta: Delta) => void,
  options?: boolean | AddEventListenerOptions
];

const support = {
  wheel: false,
  mousewheel: false,
  DOMMouseScroll: false
};

function getDelta (e: Event): Delta {
  // @ts-ignore These three properties never exist in the same event
  return (((e.deltaY || -e.wheelDelta || e.detail) >> 10) || 1) as Delta
}

let addCrossBrowserWheelEventListener = (...args: Parameters) => {

  const [element, listener, options] = args;

  const handleSupport: EventListener = e => {

    // This prevents from calling twice if the
    // browser supports more than one of the events
    if (Object.values(support).some(Boolean)) {
      return; // Has already been handled by another listener
    }

    support[e.type] = true;

    // Remove tests
    element.removeEventListener('wheel', handleSupport);
    element.removeEventListener('mousewheel', handleSupport);
    element.removeEventListener('DOMMouseScroll', handleSupport);


    addCrossBrowserWheelEventListener = (...args: Parameters) => {

      const [_element, _listener, _options] = args;

      _element.addEventListener(e.type, e_ =>{
        _listener(e_ as WheelEvent, getDelta(e_));
      }, _options);

    };

    // Add actual event listener
    addCrossBrowserWheelEventListener(...args);

    // Trigger the first time
    listener(e as WheelEvent, getDelta(e));
  };

  // Add tests
  element.addEventListener('wheel', handleSupport, options);
  element.addEventListener('mousewheel', handleSupport, options);
  element.addEventListener('DOMMouseScroll', handleSupport, options);
};


export default (...args: Parameters) => addCrossBrowserWheelEventListener(...args);
