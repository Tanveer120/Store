import React from 'react';

// Full star SVG component
const FullStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="gold">
    <path d="M12 .587l3.668 7.568L24 9.423l-6 5.848L19.336 24 12 19.897 4.664 24 6 15.271 0 9.423l8.332-1.268z"/>
  </svg>
);

// Half star SVG component using a linear gradient fill
const HalfStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="halfGrad">
        <stop offset="50%" stopColor="gold" />
        <stop offset="50%" stopColor="white" stopOpacity="1" />
      </linearGradient>
    </defs>
    <path 
      d="M12 .587l3.668 7.568L24 9.423l-6 5.848L19.336 24 12 19.897 4.664 24 6 15.271 0 9.423l8.332-1.268z" 
      fill="url(#halfGrad)" 
    />
  </svg>
);

// Empty star SVG component
const EmptyStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="gold" strokeWidth="2">
    <path d="M12 .587l3.668 7.568L24 9.423l-6 5.848L19.336 24 12 19.897 4.664 24 6 15.271 0 9.423l8.332-1.268z"/>
  </svg>
);

// StarRating component that calculates full, half, and empty stars
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {Array(fullStars).fill(0).map((_, i) => (
        <FullStar key={`full-${i}`} />
      ))}
      {hasHalfStar && <HalfStar key="half" />}
      {Array(emptyStars).fill(0).map((_, i) => (
        <EmptyStar key={`empty-${i}`} />
      ))}
    </div>
  );
};

export default StarRating;
