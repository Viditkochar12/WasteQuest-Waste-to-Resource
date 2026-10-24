const express = require("express");
const Report = require("../models/Report");

const router = express.Router();

/**
 * GET /api/leaderboard
 * Computes contributor rankings based on persisted report data.
 *
 * Scoring Formula:
 * - 25 EcoPoints per recyclable item sorted (recyclable: true)
 * - 5 EcoPoints per non-recyclable item diverted (recyclable: false)
 *
 * Badges:
 * - >= 500 points: "Gold Recycler"
 * - >= 250 points: "Silver Sorter"
 * - >= 100 points: "Bronze Guardian"
 * - Default: "Active Contributor"
 *
 * Supported Query Parameters:
 * - limit: Positive integer between 1 and 100 (default: 10)
 */
router.get("/", async (req, res, next) => {
  try {
    const allowedQueryParams = new Set(["limit"]);

    const invalidParam = Object.keys(req.query).some(
      (key) => !allowedQueryParams.has(key)
    );

    if (invalidParam) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_QUERY_PARAMETER",
          message: "One or more query parameters are not supported."
        }
      });
    }

    let limit = 10;
    if (req.query.limit !== undefined) {
      if (
        typeof req.query.limit !== "string" ||
        !/^[1-9]\d*$/.test(req.query.limit)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PAGINATION",
            message: "Limit must be a positive integer between 1 and 100."
          }
        });
      }

      const parsedLimit = Number(req.query.limit);
      if (!Number.isSafeInteger(parsedLimit) || parsedLimit > 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PAGINATION",
            message: "Limit must be a positive integer between 1 and 100."
          }
        });
      }

      limit = parsedLimit;
    }

    const pipeline = [
      {
        $match: {
          $or: [
            { userName: { $exists: true, $type: "string", $ne: "" } },
            { userId: { $exists: true, $type: "string", $ne: "" } }
          ]
        }
      },
      {
        $group: {
          _id: { $ifNull: ["$userId", "$userName"] },
          name: { $first: { $ifNull: ["$userName", "$userId"] } },
          itemsCount: { $sum: 1 },
          recyclableCount: {
            $sum: { $cond: [{ $eq: ["$recyclable", true] }, 1, 0] }
          },
          points: {
            $sum: {
              $cond: [{ $eq: ["$recyclable", true] }, 25, 5]
            }
          },
          lastActive: { $max: "$createdAt" }
        }
      },
      {
        $sort: {
          points: -1,
          itemsCount: -1,
          lastActive: -1
        }
      },
      {
        $limit: limit
      }
    ];

    const results = await Report.aggregate(pipeline);

    const leaderboard = results.map((entry, index) => {
      const rank = index + 1;
      let badge = "Active Contributor";
      if (entry.points >= 500) badge = "Gold Recycler";
      else if (entry.points >= 250) badge = "Silver Sorter";
      else if (entry.points >= 100) badge = "Bronze Guardian";

      return {
        rank,
        _id: String(entry._id),
        name: entry.name,
        username: entry.name,
        points: entry.points,
        ecoPoints: entry.points,
        itemsCount: entry.itemsCount,
        recyclableCount: entry.recyclableCount,
        badge
      };
    });

    return res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
