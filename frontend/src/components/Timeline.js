import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import PouchDB from "pouchdb";
import { FaRetweet, FaHeart} from "react-icons/fa6";

//  Initialize local database
const db = new PouchDB("swiped_tweets");

const StaticSwipeCards = () => {
  const [tweets, setTweets] = useState([]);

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
    // db.allDocs({ include_docs: true }).then((result) => {
    //   const storedPosts = result.rows.map((row) => row.doc);
    //   setPost(storedPosts.map((doc) => doc.tweet));
    //   setGood(storedPosts.map((doc) => doc.score));
    //   console.log("Restored from DB:", storedPosts);
    // });
  }, []);

  return (
    <div className="flex justify-center w-full bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="justify-center w-full items-center max-w-md">
        {tweets
          .reverse()
          .map((tweet) => (
            <StaticCard
              key={tweet.id}
              {...tweet}
            />
          ))}
      </div>
    </div>
  );
};

const StaticCard = ({
  id,
  username,
  text,
  retweets,
  likes,
}) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  return (
    <motion.div
      className="flex my-10 flex-col justify-between items-center bg-white rounded-3xl p-6 w-[350px] h-[450px]"
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
    </motion.div>
  );
};

export default StaticSwipeCards;
