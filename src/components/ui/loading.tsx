import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center mt-56">
      {/* Loading Spinner */}
      <svg
        width="50"
        height="50"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby="title"
        role="img"
      >
        <title id="title">Loading...</title>
        <circle
          cx="50"
          cy="50"
          r="35"
          stroke="gray"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="55 35"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};

export default LoadingSpinner;
