/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ["helpx.adobe.com","media.istockphoto.com","encrypted-tbn0.gstatic.com","t4.ftcdn.net","thumbs.dreamstime.com","images.unsplash.com"],

  },
};

module.exports = withPWA(
  nextConfig
);
