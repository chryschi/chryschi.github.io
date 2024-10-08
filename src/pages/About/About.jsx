import "./About.css";
import portrait from "../../assets/projects_screenshots/portrait.jpg";
import { useEffect, useState, useRef } from "react";
import { throttle } from "lodash";
import { aboutInfo } from "./aboutInfo";
import useViewport from "../../components/useViewport";
import FadeInSection from "./FadeInSection";

const About = () => {
  const [translateY, setTranslateY] = useState(0);
  const [tooltipTranslate, setTooltipTranslate] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeElementIdx, setActiveElementIdx] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(10);
  const [startTouchPosition, setStartTouchPosition] = useState();
  const textRef = useRef(null);

  const ELEMENT_HEIGHT = 320;
  const { width, height } = useViewport();
  const breakpoint = 1190;

  useEffect(() => {
    const disablePullToRefresh = (e) => {
      if (activeElementIdx !== 0) {
        e.preventDefault();
      }
    };

    const getScrollPosition = () => {
      const position = textRef.current.getBoundingClientRect().bottom - height;
      setScrollPosition(position);
    };

    if (
      (scrollPosition === 0 && width < breakpoint) ||
      scrollPosition === -100
    ) {
      document.body.style.overflowY = "hidden";

      if (activeElementIdx === 0) {
        document.body.style.overflowY = "scroll";
      }
    }

    document.body.addEventListener("scroll", getScrollPosition);
    document.body.addEventListener("touchmove", disablePullToRefresh, {
      passive: false,
    });
    setTranslateY(activeElementIdx * -ELEMENT_HEIGHT);

    return () => {
      document.body.removeEventListener("scroll", getScrollPosition);
      document.body.removeEventListener("touchmove", disablePullToRefresh);

      document.body.style.overflowY = "scroll";
    };
  }, [activeElementIdx, height, scrollPosition, width]);

  const handleScroll = throttle((e) => {
    if (scrollPosition <= 1 || document.body.scrollHeight <= height) {
      // logic for scrolling down
      if (activeElementIdx < 3) {
        if (e.deltaY > 0) {
          setIsTransitioning(true);
          setActiveElementIdx((prev) => prev + 1);
          setTooltipTranslate((prev) => prev + 100);
        }
      }

      //logic for scrolling up
      if (activeElementIdx > 0) {
        if (e.deltaY < 0) {
          setIsTransitioning(true);
          setActiveElementIdx((prev) => prev - 1);
          setTooltipTranslate((prev) => prev - 100);
        }
      }
    }
  }, 100);

  const handleTouchStart = (e) => {
    const firstTouchEvent = e.touches[0];
    const location = firstTouchEvent.screenY;

    setStartTouchPosition(location);
  };

  const handleTouchEnd = (e) => {
    const firstTouchEvent = e.changedTouches[0];
    const locationEnd = firstTouchEvent.screenY;

    if (scrollPosition <= 1 || document.body.scrollHeight <= height) {
      //logic for scrolling up
      if (activeElementIdx > 0) {
        if (startTouchPosition < locationEnd) {
          setIsTransitioning(true);
          setActiveElementIdx((prev) => prev - 1);
          setTooltipTranslate((prev) => prev - 100);
        }
      }

      //logic for scrolling down
      if (activeElementIdx < 3) {
        if (startTouchPosition > locationEnd) {
          setIsTransitioning(true);
          setActiveElementIdx((prev) => prev + 1);
          setTooltipTranslate((prev) => prev + 100);
        }
      }
    }
  };

  return (
    <>
      <div
        onTransitionEnd={() => setIsTransitioning(false)}
        onWheel={isTransitioning ? null : (e) => handleScroll(e)}
        onTouchStart={isTransitioning ? null : (e) => handleTouchStart(e)}
        onTouchEnd={isTransitioning ? null : (e) => handleTouchEnd(e)}
        className={
          "about-container " + (width < breakpoint ? "small-screen" : "")
        }
      >
        <div className="about-scrollbar">
          <div
            className="tooltip"
            style={{ transform: `translate3d(0,${tooltipTranslate}%,0)` }}
          ></div>
        </div>

        <div ref={textRef} className="about-carousel-container">
          <div
            className="item-wrapper"
            style={{ transform: `translate3d(0,${translateY}px,0)` }}
          >
            {aboutInfo.map((info, idx) => (
              <FadeInSection
                key={idx}
                isVisible={idx === activeElementIdx ? true : false}
              >
                {info.text}
              </FadeInSection>
            ))}
          </div>
        </div>
        <img src={portrait} className={"profile-photo " + "profile-square"} />
      </div>
    </>
  );
};

export default About;
