/*
  # Update Invoicing Release Note with Media Content

  1. Updates
    - Add images and videos to the invoicing update release note
    - Include multimedia content relevant to invoicing features
    - Enhance content with visual examples

  2. Content Changes
    - Add feature screenshots and demo videos
    - Include before/after comparisons
    - Add visual guides for new features
*/

UPDATE release_notes 
SET content = '## Overview

Our latest invoicing update transforms how processors handle billing and payments. This comprehensive overhaul introduces automated invoice generation, customizable templates, and seamless QuickBooks integration—making your billing process faster, more accurate, and completely streamlined.

![Invoicing Dashboard](https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg)

## New Features

### Automated Invoice Generation
* **Smart Calculations**: Automatically calculate charges based on carcass weight, processing fees, and extras
* **Batch Processing**: Generate multiple invoices at once for efficiency
* **Custom Rules**: Set up automated pricing rules by species, customer type, or service level

![Invoice Generation](https://images.pexels.com/photos/7947654/pexels-photo-7947654.jpeg)

**Demo Video**: See automated invoicing in action
[VIDEO:https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content//Invoicing.mp4]

### Customizable Invoice Templates
* **Brand Your Invoices**: Add your logo, colors, and business information
* **Flexible Layouts**: Choose from multiple professional templates
* **Custom Fields**: Add specific line items relevant to your operation

### QuickBooks Integration
* **One-Click Sync**: Export invoices directly to QuickBooks with a single click
* **Real-Time Updates**: Automatic synchronization of payment status and customer data
* **Error Prevention**: Built-in validation prevents duplicate entries

![QuickBooks Integration](https://images.pexels.com/photos/7947761/pexels-photo-7947761.jpeg)

## Improvements

### Enhanced Pricing Rules
* **Species-Specific Pricing**: Set different rates for beef, pork, lamb, and other species
* **Volume Discounts**: Automatic discounts for high-volume customers
* **Seasonal Adjustments**: Built-in support for seasonal pricing changes

### Payment Tracking
* **Status Indicators**: Visual indicators for paid, pending, and overdue invoices
* **Payment Reminders**: Automated email reminders for outstanding balances
* **Partial Payments**: Support for partial payment tracking and remaining balances

![Payment Dashboard](https://images.pexels.com/photos/7947890/pexels-photo-7947890.jpeg)

**Feature Walkthrough**: Complete payment tracking overview
[VIDEO:https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content//Job%20Management.mp4]

## Bug Fixes

* **Fixed**: Invoice totals now correctly calculate tax amounts for multi-state operations
* **Resolved**: Email delivery issues that prevented some invoices from being sent
* **Improved**: Performance optimization for large invoice batches (500+ invoices)
* **Fixed**: Date formatting inconsistencies in invoice headers

## What''s Next

We''re already working on the next wave of invoicing improvements, including:

* **Mobile Invoice Review**: Full invoice management from your smartphone
* **Advanced Reporting**: Detailed financial reports and analytics
* **Multi-Currency Support**: For processors working with international customers
* **API Integration**: Connect with other accounting and ERP systems

![Future Features Preview](https://images.pexels.com/photos/7947541/pexels-photo-7947541.jpeg)

Ready to streamline your invoicing? These features are rolling out to all Farmshare customers over the next week. Questions? Reach out to our support team!'
WHERE title = 'Invoicing Update';