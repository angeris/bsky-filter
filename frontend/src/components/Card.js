import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import PouchDB from "pouchdb";
import { trainModel } from "../trainModel.js";
import { FaRetweet, FaHeart, FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

// Initialize local database
const db = new PouchDB("swiped_tweets");

const SwipeCards = () => {
  const navigate = useNavigate();
  const [tweets, setTweets] = useState([]);
  const [gone, setGone] = useState(new Set());
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5500/tweets")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched data:", data);
        setTweets(Array.isArray(data.tweets) ? data.tweets : []);
      })
      .catch((err) => {
        console.error("Error fetching tweets:", err);
        setTweets([]);
      });
  }, []);

  const handleDone = async () => {
    setIsTraining(true);
    console.log("Fetching labeled data for training...");

    const result = await db.allDocs({ include_docs: true });
    const storedData = result.rows.map((row) => row.doc);
    const texts = storedData.map((doc) => doc.post);
    const labels = storedData.map((doc) => doc.good);

    console.log("Starting training with data:", texts, labels);

    trainModel(texts, labels)
      .then(() => {
        console.log("Training Completed!");
        setIsTraining(false);
      })
      .catch((err) => {
        console.error("Training Error:", err);
        setIsTraining(false);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <button
        className="px-6 py-3 mt-6 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        onClick={() => navigate("/posts")}
      >
        See Posts
      </button>
      <div className="relative flex justify-center items-center w-full max-w-md h-[500px]">
        {tweets
          .filter((tweet) => !gone.has(tweet.id))
          .reverse()
          .map((tweet) => (
            <Card key={tweet.id} {...tweet} setGone={setGone} />
          ))}
      </div>

      <button
        className={`mt-6 px-6 py-3 rounded-lg text-white ${
          isTraining
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
        onClick={handleDone}
        disabled={isTraining}
      >
        {isTraining ? "Training in Progress..." : "Done & Train Model"}
      </button>
    </div>
  );
};

const Card = ({ id, username, text, setGone }) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  const handleSwipe = (score) => {
    db.put({
      _id: new Date().toISOString(),
      post: text,
      good: score,
    }).then(() => {
      console.log("Saved to DB:", { post: text, good: score });
    });

    setGone((prev) => new Set([...prev, id]));
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -100) {
      console.log(`Swiped Left: ${id} -> Score: 0`);
      handleSwipe(0);
    } else if (info.offset.x > 100) {
      console.log(`Swiped Right: ${id} -> Score: 1`);
      handleSwipe(1);
    }
  };

  return (
    <motion.div
      className="absolute flex flex-col justify-between items-center bg-white shadow-xl rounded-3xl p-6 w-[350px] h-[450px] cursor-grab active:cursor-grabbing"
      style={{ x, opacity, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      animate={
        x.get() < -100
          ? { x: -500, opacity: 0 }
          : x.get() > 100
          ? { x: 500, opacity: 0 }
          : {}
      }
      onDragEnd={handleDragEnd}
    >
      {/* User Info */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="font-semibold text-gray-800">@{username}</div>
      </div>

      {/* Tweet Text */}
      <p className="text-lg font-medium text-center text-gray-700">{text}</p>
    </motion.div>
  );
};
export default SwipeCards;
