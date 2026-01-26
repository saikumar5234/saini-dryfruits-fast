# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-14

### Added
- Initial release of Saini Mewa Stores web application
- Admin authentication system with Super Admin, Admin, and Sub-Admin roles
- User management dashboard with user listing, approvals, and analytics
- Sub-admin management: Create and manage sub-admin emails
- Sub-admin signup with email validation
- OTP verification for sub-admin login
- User registration and login functionality
- Price analytics dashboard
- Greeting management system
- Banner text management
- Multi-language support (i18n)
- Date range filtering for user analytics
- User session tracking and time spent analytics
- Pending user approvals with notifications
- Responsive Material-UI design
- Export functionality for user data

### Features
- **Authentication**: Role-based access control (Super Admin, Admin, Sub-Admin)
- **User Management**: View, approve, and manage registered users
- **Analytics**: Track user sessions, time spent, and activity
- **Notifications**: Real-time pending approval notifications
- **Internationalization**: Multi-language support ready

---

## Versioning Guide

This project follows [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR version** (1.0.0 → 2.0.0): Breaking changes, major feature additions
- **MINOR version** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH version** (1.0.0 → 1.0.1): Bug fixes, backward compatible

### How to Update Version for New Releases

1. **For Bug Fixes (Patch)**: Update `1.0.0` → `1.0.1`
   ```json
   "version": "1.0.1"
   ```

2. **For New Features (Minor)**: Update `1.0.0` → `1.1.0`
   ```json
   "version": "1.1.0"
   ```

3. **For Breaking Changes (Major)**: Update `1.0.0` → `2.0.0`
   ```json
   "version": "2.0.0"
   ```

4. **Update CHANGELOG.md**: Add a new section for the new version with all changes

5. **Commit and Tag**: 
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to 1.0.1"
   git tag -a v1.0.1 -m "Release version 1.0.1"
   ```

