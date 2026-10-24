import test from "node:test";
import assert from "node:assert/strict";
import { getReportImageUrl } from "../src/services/reportImages.js";

test("returns valid Cloudinary HTTPS image URLs", () => {
  const imageUrl = "https://res.cloudinary.com/wastequest/image/upload/report.png";
  assert.equal(getReportImageUrl(imageUrl), imageUrl);
});

test("rejects missing, malformed, and non-HTTPS image URLs", () => {
  for (const imageUrl of [undefined, null, "", "not a URL", "http://images.example/report.png", "javascript:alert(1)", "data:image/png;base64,AA=="]) {
    assert.equal(getReportImageUrl(imageUrl), null);
  }
});

test("rejects HTTPS URLs hosted outside Cloudinary", () => {
  assert.equal(getReportImageUrl("https://images.example/report.png"), null);
});

test("rejects URLs containing embedded credentials", () => {
  assert.equal(getReportImageUrl("https://user:password@res.cloudinary.com/report.png"), null);
});

test("trims surrounding whitespace from a valid URL", () => {
  assert.equal(
    getReportImageUrl("  https://res.cloudinary.com/wastequest/report.png  "),
    "https://res.cloudinary.com/wastequest/report.png"
  );
});
