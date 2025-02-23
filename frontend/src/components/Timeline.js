import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import classify, { loadTrainedModel } from "../trainModel"; // ✅ Import classify & loadTrainedModel
import * as use from "@tensorflow-models/universal-sentence-encoder"; // ✅ Import USE model

const StaticSwipeCards = () => {
  const [tweets, setTweets] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5500/tweets")
      .then((res) => res.json())
      .then(async (data) => {
        console.log("Fetched data:", data);
        const tweetTexts = Array.isArray(data.tweets)
          ? data.tweets.map((t) => t.text)
          : [];

        // ✅ Load trained model
        const useModel = await use.load();
        const classificationModel = await loadTrainedModel();

        // ✅ Run classification on fetched tweets
        const predictions = await classify(
          useModel,
          classificationModel,
          tweetTexts
        );
        console.log("Predictions:", predictions);

        setTweets(data.tweets);
        setPredictions(predictions);
      })
      .catch((err) => {
        console.error("Error fetching tweets:", err);
        setTweets([]);
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-100 to-purple-200">
      <button
        className="px-6 py-3 mb-6 text-white transition-all bg-gray-600 rounded-lg shadow-lg hover:bg-gray-700"
        onClick={() => navigate("/")}
      >
        Back to Swiping
      </button>

      {/* ✅ Display Predictions */}
      <div className="w-full max-w-md space-y-4">
        {tweets.length === 0 ? (
          <p className="text-center text-gray-600">No posts available</p>
        ) : (
          tweets.map((tweet, index) => (
            <StaticCard
              key={tweet.id}
              {...tweet}
              prediction={
                predictions[index] !== undefined
                  ? predictions[index]
                  : "Loading..."
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

const StaticCard = ({ username, text, retweets, likes, prediction }) => {
  return (
    <div className="w-full p-4 transition-transform transform bg-white rounded-lg shadow-lg hover:scale-105">
      {/* User Info */}
      <div className="flex items-center mb-2 space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <p className="font-semibold text-gray-800">@{username}</p>
      </div>

      {/* Tweet Text */}
      <p className="text-gray-700 text-md">{text}</p>

      {/* Retweets & Likes */}
      <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
        <span>🔁 {retweets} Retweets</span>
        <span>❤️ {likes} Likes</span>
      </div>

      {/* ✅ Prediction Display */}
      <div className="mt-3 text-lg font-bold text-center">
        {prediction === 0
          ? "👍 Positive"
          : prediction === 1
          ? "👎 Negative"
          : "🔄 Processing..."}
      </div>
    </div>
  );
};

export default StaticSwipeCards;
