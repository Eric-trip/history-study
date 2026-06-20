import type { NextConfig } from "next";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = "history-study";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGitHubActions ? `/${repoName}` : "",
  assetPrefix: isGitHubActions ? `/${repoName}/` : "",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
