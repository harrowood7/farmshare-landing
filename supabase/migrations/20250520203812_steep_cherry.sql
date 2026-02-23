/*
  # Add example release notes

  1. Changes
    - Insert sample release notes with realistic content
    - Each note includes title, version, content, and publication date
*/

INSERT INTO release_notes (title, content, version, published_at)
VALUES
  (
    'Major Platform Update: Enhanced Scheduling System',
    'We''re excited to announce a complete overhaul of our scheduling system, bringing major improvements to how processors manage their daily operations.\n\nKey Improvements:\n• Smart Capacity Management: Automatically adjusts available slots based on your facility''s current workload and capacity\n• Waitlist Automation: Automatically fills cancelled slots from your waitlist\n• Mobile-Optimized Calendar: Better viewing and management of schedules on mobile devices\n• Real-time Updates: Instant notifications when changes occur in your schedule\n\nThese updates are designed to save you valuable time and reduce scheduling conflicts while maximizing your facility''s throughput.',
    '2.0.0',
    '2025-05-15T10:00:00Z'
  ),
  (
    'New Feature: Advanced Analytics Dashboard',
    'We''ve launched a new analytics dashboard to help you make data-driven decisions about your business.\n\nNew Features:\n• Processing Volume Trends: Track your facility''s processing volume over time\n• Revenue Analytics: Monitor revenue streams and identify opportunities for growth\n• Customer Insights: Understand your customer base better with detailed analytics\n• Performance Metrics: Track key performance indicators in real-time\n\nThe new dashboard is available now in your account settings.',
    '1.9.0',
    '2025-04-20T14:30:00Z'
  ),
  (
    'Improved Mobile Experience',
    'This update focuses on making Farmshare more accessible and easier to use on mobile devices.\n\nEnhancements:\n• Redesigned mobile navigation\n• Improved touch controls for calendar management\n• Optimized loading times on mobile networks\n• Better handling of photos and documents on mobile devices\n\nWe''ve also fixed several bugs reported by our users.',
    '1.8.5',
    '2025-03-10T09:15:00Z'
  ),
  (
    'New Communication Features',
    'We''ve added new ways to stay connected with your customers and team.\n\nWhat''s New:\n• Bulk messaging capabilities for customer updates\n• Automated reminder system for upcoming appointments\n• New chat interface for real-time communication\n• Custom notification preferences\n\nThese features are designed to streamline communication and reduce time spent on phone calls and emails.',
    '1.8.0',
    '2025-02-01T16:45:00Z'
  ),
  (
    'Platform Launch',
    'Welcome to Farmshare! We''re thrilled to announce the official launch of our platform.\n\nCore Features:\n• Smart scheduling system for processors\n• Digital cut sheets and documentation\n• Real-time communication tools\n• Comprehensive reporting system\n\nThis is just the beginning - we''re committed to continuously improving and expanding our platform based on your feedback.',
    '1.0.0',
    '2025-01-01T08:00:00Z'
  );