# HomeBudget - Personal Finance Manager

A modern, responsive budget tracking application built with React and Vite.

## Features

- 📊 **Budget Management**: Create, edit, and track budgets with automatic merging
- 💰 **Expense Tracking**: Add and categorize expenses with smart suggestions
- 📈 **Analytics**: Visual charts and insights for spending patterns
- 🔄 **Google Drive Sync**: Backup and sync data across devices
- 🎯 **Achievement System**: Gamified experience with progress tracking
- 📱 **Mobile Responsive**: Optimized for all screen sizes
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 🔐 **Secure Authentication**: Local user management with data isolation

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd homebudget-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Add your Google Drive API credentials to `.env`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Google Drive Sync Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Drive API
4. Create API Key and OAuth 2.0 Client ID
5. Add credentials to `.env` file

## Technologies Used

- **React 18** - UI framework
- **React Router** - Navigation
- **Vite** - Build tool
- **Chart.js** - Data visualization
- **Heroicons** - Icon library
- **React Toastify** - Notifications

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Route components
├── utils/         # Utility functions
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── actions/       # Form actions
└── assets/        # Static assets
```

## Key Features

### Budget Management
- Create budgets with categories and amounts
- Automatic merging of same-named budgets
- Visual progress tracking with color-coded indicators

### Expense Tracking
- Quick expense entry with smart suggestions
- Category-based organization
- Recurring expense support

### Data Sync
- Google Drive integration for cross-device sync
- Automatic backup to "HomeBudget" folder
- Manual sync controls in profile dropdown

### Analytics
- Spending trends and patterns
- Category breakdowns
- Monthly comparisons
- Visual charts and heatmaps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.