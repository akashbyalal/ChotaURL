const express = require("express");
const Url = require("../models/url");
const { nanoid } = require("nanoid");

const router = express.Router();

router.post("/api/short", async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: "A URL is required." });
  }

  try {
    let shortId = "";
    let existingUrl = null;

    while (!shortId || existingUrl) {
      shortId = nanoid(8);
      existingUrl = await Url.findOne({ shortUrl: shortId });
    }

    const newUrl = new Url({
      originalUrl,
      shortUrl: shortId,
    });

    await newUrl.save();

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";

    return res.status(201).json({
      message: "Short URL created successfully.",
      url: {
        shortId,
        shortUrl: `${baseUrl}/${shortId}`,
      },
    });
  } catch (error) {
    console.error("Error creating short URL:", error);
    return res.status(500).json({ error: "Could not create short URL." });
  }
});

router.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;

  try {
    const urlRecord = await Url.findOne({ shortUrl: shortId });

    if (!urlRecord) {
      return res.status(404).json({
        error: "Short URL not found.",
      });
    }

    urlRecord.clicks += 1;
    await urlRecord.save();

    return res.redirect(urlRecord.originalUrl);
  } catch (error) {
    console.error("Error fetching short URL:", error);
    return res.status(500).json({
      error: "Could not retrieve short URL.",
    });
  }
});

module.exports = router;