import fs from "fs";
import csv from "csv-parser";
import express from "express";
import cors from "cors";
import PouchDB from "pouchdb";
import {AtpAgent} from "@atproto/api";

const db = new PouchDB("tweetsDB");
const app = express();
app.use(cors());
app.use(express.json());
const port = 5500;

const agent = new AtpAgent({service: 'https://bsky.social'});

await agent.login({
  identifier: "gbot.bsky.social",
  password: "erat-pifu-jji7-27mh",
});

// Fetch tweets from Bluesky
const { data } = await agent.getTimeline(
  {
    cursor: '',
    limit: 100,
  },
);

// Process tweets into structured format
const tweets = data.feed.map((item, index) => ({
  id: `tweet_${index + 1}`,
  username: item.post.author.handle,
  text: item.post.record.text,
  retweets: Math.floor(Math.random() * 10),
  likes: Math.floor(Math.random() * 20),
  timestamp: item.post.record.createdAt,
}));

// API Endpoint
app.get("/tweets", (req, res) => {
  res.json({ tweets });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
