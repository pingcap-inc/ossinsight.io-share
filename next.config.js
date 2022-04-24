const {withSentryConfig} = require("@sentry/nextjs");
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputStandalone: true
  }
}

/** @type {Partial<import('@sentry/nextjs').SentryWebpackPluginOptions>} */
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.

  setCommits: {
    ignoreMissing: true,
    ignoreEmpty: true
  },

  release: process.env.SENTRY_RELEASE.replaceAll('refs/tags/', ''),
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
