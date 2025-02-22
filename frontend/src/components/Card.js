import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import PouchDB from "pouchdb";
import { FaRetweet, FaHeart, FaArrowLeft, FaArrowRight } from "react-icons/fa6";

//  Initialize local database
const db = new PouchDB("swiped_tweets");

const SwipeCards = () => {
  const [tweets, setTweets] = useState([]);
  const [gone, setGone] = useState(new Set());
  const [post, setPost] = useState([]); // Stores swiped tweets
  const [good, setGood] = useState([]); // Stores scores (0 for left, 1 for right)

  // ✅ Load previous swiped data from the local database
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

    // ✅ Retrieve swiped data from IndexedDB
    db.allDocs({ include_docs: true }).then((result) => {
      const storedPosts = result.rows.map((row) => row.doc);
      setPost(storedPosts.map((doc) => doc.tweet));
      setGood(storedPosts.map((doc) => doc.score));
      console.log("Restored from DB:", storedPosts);
    });
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="relative flex justify-center items-center w-full max-w-md h-[500px]">
        {tweets
          .filter((tweet) => !gone.has(tweet.id))
          .reverse()
          .map((tweet) => (
            <Card
              key={tweet.id}
              {...tweet}
              setGone={setGone}
              setPost={setPost}
              setGood={setGood}
            />
          ))}
      </div>
    </div>
  );
};

const Card = ({
  id,
  username,
  text,
  retweets,
  likes,
  setGone,
  setPost,
  setGood,
}) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  const handleSwipe = (score) => {
    const tweetData = { id, username, text, retweets, likes };

    db.put({
      _id: new Date().toISOString(),
      post: tweetData["text"],
      good: score,
    }).then(() => {
      console.log("Saved to DB:", { post: tweetData["text"], good: score });
    });

    // ✅ Update local state
    setGood((prev) => [...prev, score]);
    setPost((prev) => [...prev, [tweetData]]);
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

      {/* Tweet Actions */}
      <div className="flex items-center justify-between w-full px-4 mt-4 text-gray-600">
        <div className="flex items-center space-x-2">
          <FaRetweet className="text-green-500" />
          <span>{retweets}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FaHeart className="text-red-500" />
          <span>{likes}</span>
        </div>
      </div>

      {/* Swipe Icons */}
      <div className="absolute flex space-x-6 text-gray-500 transform -translate-x-1/2 bottom-4 left-1/2">
        <FaArrowLeft className="w-8 h-8 cursor-pointer hover:text-red-500" />
        <FaArrowRight className="w-8 h-8 cursor-pointer hover:text-blue-500" />
      </div>
    </motion.div>
  );
};

export default SwipeCards;
