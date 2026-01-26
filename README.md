# Saini Mewa Stores - Web Application

A comprehensive web application for managing dry fruits store operations, user management, and analytics.

## Version

**Current Version:** `1.0.0`

See [CHANGELOG.md](./CHANGELOG.md) for detailed release notes and version history.

## Features

- **Admin Dashboard**: Role-based access control (Super Admin, Admin, Sub-Admin)
- **User Management**: View, approve, and manage registered users
- **Analytics**: Track user sessions, time spent, and activity metrics
- **Sub-Admin Management**: Create and manage sub-admin accounts
- **OTP Verification**: Secure authentication with OTP verification
- **Price Analytics**: Track and analyze product pricing
- **Greeting Management**: Manage user greetings
- **Banner Management**: Add and manage banner text
- **Multi-language Support**: Internationalization (i18n) ready
- **Real-time Notifications**: Pending approval notifications

## Tech Stack

- **Frontend**: React 19, Vite
- **UI Framework**: Material-UI (MUI) v7
- **Routing**: React Router v7
- **Internationalization**: i18next, react-i18next
- **Charts**: Recharts
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Version Management

This project follows [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR.MINOR.PATCH** (e.g., `1.0.0`)
  - **MAJOR**: Breaking changes
  - **MINOR**: New features (backward compatible)
  - **PATCH**: Bug fixes (backward compatible)

### Updating Version

1. Update version in `package.json`
2. Add release notes to `CHANGELOG.md`
3. Commit changes with version tag
4. Create git tag for the release

Example:
```bash
# Update package.json version to 1.0.1
# Add changes to CHANGELOG.md
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.0.1"
git tag -a v1.0.1 -m "Release version 1.0.1"
git push origin main --tags
```

## Project Structure

```
src/
├── components/          # Reusable components
├── contexts/           # React contexts
├── config.js           # API endpoints configuration
├── App.jsx             # Main application component
├── MainRoutes.jsx      # Route definitions
└── ...
```

## License

Private - Saini Mewa Stores
