/*
  # Update release notes content format

  1. Changes
    - Update existing release notes with structured content using markdown-style headers
*/

UPDATE release_notes
SET content = '## Overview
We are excited to announce the release of Farmshare 2.0! This major update brings significant improvements to our platform, making it even easier for producers, processors, and buyers to connect and manage their operations.

## New Features
* Redesigned dashboard with improved analytics
* Real-time inventory tracking system
* Enhanced scheduling capabilities
* Mobile app for iOS and Android

## Improvements
* Faster loading times across all pages
* Streamlined booking process
* Enhanced security features
* Better notification system

## Bug Fixes
* Fixed calendar sync issues
* Resolved payment processing delays
* Improved error handling
* Fixed mobile responsiveness issues'
WHERE version = '2.0.0';

UPDATE release_notes
SET content = '## Overview
This release focuses on enhancing the user experience with improved navigation and new features for processors.

## Key Updates
* New processor dashboard layout
* Advanced filtering options
* Improved search functionality

## Performance Improvements
* Optimized database queries
* Reduced page load times
* Enhanced caching system

## Bug Fixes
* Fixed scheduling conflicts
* Resolved notification delays
* Improved form validation'
WHERE version = '1.9.0';

UPDATE release_notes
SET content = '## Overview
This patch release addresses several important bug fixes and performance improvements.

## Bug Fixes
* Resolved calendar sync issues
* Fixed payment processing errors
* Improved error messages

## Performance Updates
* Faster data loading
* Reduced API response times
* Optimized image loading

## Security Enhancements
* Updated authentication system
* Enhanced data encryption
* Improved password security'
WHERE version = '1.8.5';