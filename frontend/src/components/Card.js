import React, { useState } from 'react';
import {motion, useMotionValue, useTransform} from 'framer-motion';
import { FaRetweet } from "react-icons/fa6";

// Sample tweet data



  // const [currentIndex, setCurrentIndex] = useState(0);
  // const [gone, setGone] = useState(new Set());

const SwipeCards = () => {
  const cardData = [
    { id: 1, username: "user1", text: "This is tweet number 1!", retweets:6, likes:5, timestamps: "date" },
    { id: 2, username: "user2", text: "This is tweet number 1!", retweets:6, likes:5, timestamps: "date" },
    { id: 3, username: "user3", text: "This is tweet number 1!", retweets:6, likes:5, timestamps: "date" },
    // Add more tweets as needed
  ];
  return(
    <div className='grid min-h-screen place-items-center bg-neutral-100'>
      {cardData.toReversed().map((card) => {
        return <Card key = {card.id} {...card}/>;
      })}
    </div>
  )
}
  
const Card = ({id, username, text, retweets, likes}) => {

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);
  const rotate = useTransform(x, [-150, 150], [-18, 18]);
  

  const handleDragEnd = (event, info) => {
    if (info.offset.x < 0){
      console.log(0)
    }
    else if (info.offset.x > 0){
      console.log(1)
    }
  }

  return (
        <motion.div 
        className = "object-cover rounded-lg w-11/12 h-96 max-w-md bg-white rounded-3xl shadow-lg p-6 flex flex-col justify-between hover:cursor-grab active:cursor-grabbing"
        style={{x, opacity, rotate, gridRow: 1, gridColumn: 1}}
        drag="x" dragConstraints={{left: 0, right: 0}}
        onDragEnd={handleDragEnd}>
          <div className='font-semibold'>{username}</div>
          <p class="text-gray-800">{text}</p>
          <div className='w-full p-4 flex justify-between items-center'>
            <div><FaRetweet/>: {retweets}</div>
            <p>Likes: {likes}</p>
            </div>
            <div class="flex space-x-3 text-gray-500 text-sm">
            <button class="flex items-center space-x-1 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>3</span>
            </button>
            <button class="flex items-center space-x-1 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 4V2L2 7l5 5V8h12V4H7z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>5</span>
            </button>
            <button class="flex items-center space-x-1 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16v16H4V4z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>7</span>
            </button>
          </div>
        </motion.div>
    // </div>
  )
};

export default SwipeCards;


 

