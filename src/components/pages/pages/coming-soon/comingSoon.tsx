"use client";

import Link from "next/link";
import ImageWithBasePath from "@/core/imageWithBasePath";
import { useEffect, useState } from "react";

const ComingSoonComponent = () => {
  // Set a target date for the countdown (e.g., 30 days from now)
  const [targetDate] = useState(new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000));

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date();
      let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return timeLeft;
    };

    // Set initial time left
    setTimeLeft(calculateTimeLeft());

    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  const formatTime = (time: number) => {
    // Add leading zero for single-digit numbers
    return time < 10 ? `0${time}` : time;
  };

  return (
    <>
      {/* This container centers your content vertically and horizontally 
        INSIDE the parent layout's content area.
        
        I've added 'width: 100%' to ensure it spans the full content area,
        which allows 'align-items-center' to center the content correctly.
      */}
      <div
        className="d-flex flex-column align-items-center justify-content-center text-center p-4"
        style={{ minHeight: '70vh', width: '100%' }} // Added width: 100%
      >
        <div className="card bg-transparent border-0">
          <div className="comming-soon-pg d-flex flex-column align-items-center justify-content-center" style={{ marginLeft: '6rem' }}>

            {/* Logo */}
            <div className="mb-3 p-3">
              <ImageWithBasePath
                src="assets/img/EMR_Logo.jpg"
                alt="logo"
                className="img-fluid"
                width={200} // Added width for better layout control
                height={100} // Added height for better layout control
              />
            </div>

            {/* Smaller "Coming Soon" Image */}
            <div className="pb-3 mb-3" style={{ maxWidth: '400px', width: '100%' }}>
              <ImageWithBasePath
                src="assets/img/bg/coming-soon.svg"
                alt="Page Under Construction"
                className="img-fluid"
                width={400} // Set explicit size
                height={300} // Set explicit size
              />
            </div>


          </div>
        </div>
      </div>
    </>
  );
};

export default ComingSoonComponent;

