"use client"; // Marking this file as a client component

import React, { useState, useEffect, useRef } from "react";
import { FaPlay, FaPause, FaRedo, FaCog } from "react-icons/fa";

const PomodoroTimer: React.FC = () => {
  const [customDuration, setCustomDuration] = useState<number>(25); // Durasi yang bisa diatur user
  const [customBreakDuration, setCustomBreakDuration] = useState<number>(5); // Durasi break yang sesuai
  const [minutes, setMinutes] = useState<number>(25); // Set sesuai durasi custom
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Use useRef to store audio instances
  const pomodoroAlarmRef = useRef<HTMLAudioElement | null>(null);
  const breakAlarmRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      pomodoroAlarmRef.current = new Audio("/wiwokdetok.mp3"); // Alarm untuk pomodoro selesai
      breakAlarmRef.current = new Audio("/hidupjokowi.mp3"); // Alarm untuk break selesai
    }
  }, []);

  const toggleTimer = (): void => setIsActive(!isActive);

  const resetTimer = (): void => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(isBreak ? customBreakDuration : customDuration); // Reset sesuai mode dan durasi custom
    setSeconds(0);
  };

  // Durasi berdasarkan setting user
  const pomodoroDuration = customDuration * 60; // Durasi custom dalam detik
  const breakDuration = customBreakDuration * 60; // Break duration dalam detik

  // Calculate total time in seconds for progress
  const totalTimeInSeconds = minutes * 60 + seconds;

  // Calculate progress in percentage - berdasarkan durasi yang sesuai
  const progress = isBreak
    ? (totalTimeInSeconds / breakDuration) * 100
    : (totalTimeInSeconds / pomodoroDuration) * 100;

  // Handle duration change
  const handleDurationChange = (
    newDuration: number,
    newBreakDuration: number
  ) => {
    setCustomDuration(newDuration);
    setCustomBreakDuration(newBreakDuration);
    if (!isActive && !isBreak) {
      setMinutes(newDuration);
    }
  };

  // Update the document title dynamically based on the timer
  useEffect(() => {
    const title = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")} | Fomodoro`;
    document.title = title;

    // Memastikan favicon tetap ada
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.type = "image/png";
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = "/Jokowi.png";
  }, [minutes, seconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Play different sound based on current mode
            if (isBreak) {
              // Break selesai, putar alarm break selesai
              if (breakAlarmRef.current) {
                breakAlarmRef.current.play().catch(console.error);
              }
              // Break selesai, kembali ke Pomodoro
              setIsBreak(false);
              setMinutes(customDuration);
            } else {
              // Pomodoro selesai, putar alarm pomodoro selesai
              if (pomodoroAlarmRef.current) {
                pomodoroAlarmRef.current.play().catch(console.error);
              }
              // Pomodoro selesai, mulai Break
              setIsBreak(true);
              setMinutes(customBreakDuration);
            }
            setIsActive(false); // Stop the timer
            setSeconds(0);
          } else {
            setMinutes(minutes - 1); // Decrease the minutes
            setSeconds(59); // Reset seconds to 59
          }
        } else {
          setSeconds(seconds - 1); // Decrease the seconds
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    isActive,
    minutes,
    seconds,
    customDuration,
    customBreakDuration,
    isBreak,
  ]);

  const strokeDasharray = () => {
    const radius = 100; // Sesuai dengan radius arc di SVG
    const circumference = 2 * Math.PI * radius;
    return circumference / 2; // Half of the full circle
  };

  // Preset configurations
  const presetConfigs = [
    { pomodoro: 25, break: 5 },
    { pomodoro: 50, break: 10 },
    { pomodoro: 75, break: 15 },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="bg-gray-800 text-center flex flex-col items-center justify-center bg-gray-100 rounded-lg shadow-md w-full max-w-md md:max-w-lg lg:max-w-xl py-8 md:py-20 mx-auto relative">
        {/* Settings button positioned at top right corner */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-3 right-3 md:top-4 md:right-4 text-white hover:text-orange-400 transition-colors"
        >
          <FaCog
            className="text-gray-200 hover:cursor-pointer hover:text-gray-300 hover:rotate-30 transition-transform duration-300 ease-in-out"
            size={window.innerWidth < 768 ? 28 : 35}
          />
        </button>

        {/* Centered title */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-500">
            {isBreak ? "Break Time" : "Fomodoro"}
          </h1>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-700 p-3 md:p-4 rounded-lg mb-4 w-11/12 md:w-5/6 mx-auto">
            <h3 className="text-white text-base md:text-lg mb-3">
              Choose your Fomodoro style
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 justify-center mb-3">
              {presetConfigs.map((config) => (
                <button
                  key={`${config.pomodoro}-${config.break}`}
                  onClick={() =>
                    handleDurationChange(config.pomodoro, config.break)
                  }
                  className={`px-3 py-2 rounded hover:cursor-pointer text-sm md:text-base ${
                    customDuration === config.pomodoro &&
                    customBreakDuration === config.break
                      ? "bg-orange-600 text-white"
                      : "bg-gray-600 text-white hover:bg-gray-500"
                  }`}
                >
                  {config.pomodoro}:{config.break}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative flex justify-center items-center">
          <svg
            width="100%"
            height="auto"
            viewBox="0 0 300 200"
            className="w-80 h-48 md:w-96 md:h-60 lg:w-[500px] lg:h-[300px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background arc */}
            <path
              d="M 50 150 A 100 100 0 0 1 250 150"
              fill="none"
              stroke="#101828"
              strokeWidth="20"
              className="md:stroke-[25]"
            />

            {/* Progress arc (Pomodoro or Break) */}
            <path
              d="M 50 150 A 100 100 0 0 1 250 150"
              fill="none"
              stroke={isBreak ? "#4CAF50" : "#FF6900"}
              strokeWidth="20"
              className="md:stroke-[25]"
              strokeDasharray={strokeDasharray()}
              strokeDashoffset={(1 - progress / 100) * strokeDasharray()} // Progress dari full ke 0
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>

          {/* Time in the center of the progress bar */}
          <div
            className="absolute text-3xl md:text-4xl lg:text-5xl font-bold text-white"
            style={{
              top: "58%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            <span>{String(minutes).padStart(2, "0")}:</span>
            <span>{String(seconds).padStart(2, "0")}</span>

            <p className="text-sm md:text-lg lg:text-xl mt-2">
              {isBreak ? "Take a Break" : "Just Focus"}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-3 md:gap-4 mt-4 md:mt-6 w-full px-4">
          <button
            onClick={toggleTimer}
            className="flex-1 max-w-32 md:max-w-none md:flex-none px-6 md:px-8 py-2 md:py-3 bg-orange-600 text-white rounded-md hover:bg-orange-500 hover:scale-105 transition-transform duration-200 hover:cursor-pointer text-sm md:text-base"
          >
            {isActive ? <FaPause /> : <FaPlay />}
          </button>
          <button
            onClick={resetTimer}
            className="flex-1 max-w-32 md:max-w-none md:flex-none px-6 md:px-8 py-2 md:py-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 hover:scale-105 transition-transform duration-200 hover:cursor-pointer text-sm md:text-base"
          >
            <FaRedo />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
