# Open Questions for Backend & AI Integration

## 1. Image storage and report creation

`POST /api/classify` classifies an image in memory. Image storage is a separate operation: `POST /api/uploads` accepts multipart field `image` and uploads to Cloudinary. It returns `data.url` and `data.publicId`, which `POST /api/reports` requires. The frontend now uploads the selected image first and submits those returned values. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `server/.env` to enable real uploads.

## 2. Geolocation requirements

Reports require numeric latitude and longitude within valid geographic ranges. The frontend currently requests browser geolocation and uses neutral coordinates `(0, 0)` if permission is denied or unavailable. Confirm whether the product should retain this fallback or allow reports without location.

## 3. Classification route status

`POST /api/classify` is mounted in `server/src/app.js`. It accepts a multipart `image`, validates the image through the AI module, and returns its structured result. Backend route tests cover missing files, MIME and content validation, size limits, provider errors, and successful mocked classification.

## 4. Leaderboard status

`GET /api/leaderboard` is implemented in `server/src/routes/leaderboard.routes.js`. It ranks contributors from persisted reports that include a user name or ID; reports without contributor identity do not appear in rankings.

## 5. Authentication

No authentication route or user model is currently mounted. Report contributor fields are optional and are not an authentication mechanism.