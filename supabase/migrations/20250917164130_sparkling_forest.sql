/*
  # Add Invoicing Update Release Note

  1. New Release Note
    - Title: "Invoicing Update"
    - Version: "2.1.0"
    - Content: Detailed information about invoicing improvements
    - Published date: Current date

  This migration adds a new release note about invoicing updates to the release_notes table.
*/

INSERT INTO release_notes (
  title,
  content,
  version,
  published_at
) VALUES (
  'Invoicing Update',
  '## Overview

We''ve rolled out significant improvements to our invoicing system, making it easier than ever to manage billing, track payments, and maintain accurate financial records for your processing operation.

## New Features

* **Automated Invoice Generation**: Invoices are now automatically created when jobs are completed, reducing manual data entry
* **Customizable Invoice Templates**: Tailor your invoices with your business logo, custom fields, and personalized messaging
* **Multi-Payment Tracking**: Track partial payments, deposits, and final balances with detailed payment history
* **QuickBooks Integration**: Seamlessly sync all invoice data directly to QuickBooks Online for streamlined bookkeeping

## Improvements

* **Enhanced Pricing Rules**: Set up complex pricing structures with species-specific rates, weight tiers, and processing add-ons
* **Automatic Tax Calculations**: Configure tax rates by location and service type for accurate billing
* **Payment Reminders**: Automated email and text reminders for overdue invoices help improve cash flow
* **Detailed Reporting**: New financial reports provide insights into revenue trends, outstanding balances, and payment patterns

## Bug Fixes

* Fixed issue where invoice totals would occasionally miscalculate with multiple add-on services
* Resolved problem with invoice PDF generation for customers with special characters in their names
* Corrected timezone display issues in payment timestamps
* Fixed duplicate invoice creation when jobs were updated multiple times

## What''s Next

We''re continuing to enhance the financial management capabilities of Farmshare. Coming soon: credit card processing integration, recurring billing for regular customers, and advanced financial analytics dashboard.',
  '2.1.0',
  NOW()
);