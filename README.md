<div align="center">
  <img src="public/icons/favicon.svg" alt="Book Cook Logo" width="120" />

# Book Cook

[![Live Site](https://img.shields.io/badge/Live-Site-success?style=flat-square&logo=vercel)](https://book-cook.vercel.app)
[![codecov](https://codecov.io/gh/Book-Cook/book-cook/graph/badge.svg?token=Y2NREZDTLL)](https://codecov.io/gh/Book-Cook/book-cook)
[![License](https://img.shields.io/github/license/czearing/book-cook?style=flat-square)](LICENSE)
[![RelativeCI](https://badges.relative-ci.com/badges/MXkw9Xco7tbckJiJJWBB?branch=main&style=flat-square)](https://app.relative-ci.com/projects/MXkw9Xco7tbckJiJJWBB)
[![Build Status](https://github.com/Book-Cook/book-cook/actions/workflows/build-test-lint.yml/badge.svg)](https://github.com/Book-Cook/book-cook/actions/workflows/build-test-lint.yml)

</div>

## 📖 Overview

Book Cook is an AI-powered recipe management application that empowers individuals to create their own digital cookbook. With Book Cook, you can generate custom recipes tailored to your preferences, organize your recipe collection, and plan meals collaboratively.

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Book-Cook/book-cook.git

# Navigate to the project folder
cd book-cook

# Install dependencies
yarn install

# Start the development server
yarn dev
```

## Recipe checkboxes

Type `[] `, `[ ] `, or `- [ ] ` at the start of a line to create a checkbox.
Click the checkbox or focus it and press Space to toggle it. Checked states are
saved as Markdown and restored when the recipe is reopened.

## Recipe options and validation

Use the three-dot Recipe options button in the recipe header to save or discard
edits, or confirm deletion. Save failures retain the edits for retry.
Tag entry collapses when unfocused without leaving an empty row.

Jest runs unit tests in `src`; Playwright runs browser tests in `tests` separately.
Run these commands for the integrated recipe flows:

```powershell
yarn test --runInBand
yarn test:e2e e2e recipe-tags recipe-options recipe-header-alignment recipe-gallery-alignment --workers=1
```

Browser tests use intercepted API fixtures and do not require production data.

## 📦 Bundle Analysis

To inspect the client bundle and identify large dependencies, run:

```bash
yarn analyze
```

This command uses `next-bundle-analyzer` and outputs a detailed report in `.next/analyze/webpack-stats.json`. Review the top modules to spot libraries that significantly impact bundle size.
