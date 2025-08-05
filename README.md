# Are The Astros Winning?

A beautiful, responsive website that shows if the Houston Astros are winning, displays the current score, and shows their opponent. Built with modern web technologies and designed with a clean, user-friendly interface.

## Features

- **Live Score Display**: Shows current Astros score vs opponent score with team logos
- **Dynamic Team Colors**: Opponent scores display in their team colors, Astros scores in orange
- **Winning Status**: Clear indication of whether the Astros are winning, losing, or tied
- **Game Details**: Displays inning, time, venue, and game status
- **Smart Auto-refresh**: Automatically updates based on game status (15s for live games, 60s for scheduled, 5min for final)
- **Manual Refresh**: Button to manually refresh game data
- **Last Game Widget**: Shows the most recent game result with scores and team logos
- **Confetti Animation**: Celebrates when the Astros score during live games
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations and team branding

## How to Use

1. Open `index.html` in your web browser
2. The website will automatically load and display game data
3. Click the "Refresh" button to manually update the data
4. Status information and last updated time are displayed at the top of the page

## Current Implementation

The website uses the **official MLB Stats API** to fetch real live game data! No API key required - the MLB Stats API is free and open.

### Features:
- **Real-time data**: Fetches actual Astros game data from MLB's official API
- **Live games**: Shows current score, inning, and game status
- **Upcoming games**: Displays scheduled games when no game is currently live
- **Last game results**: Shows the most recent completed game
- **Team logos**: Displays official team logos from MLB's CDN
- **Dynamic colors**: Opponent scores use their team colors, Astros scores use orange
- **Fallback system**: Uses mock data if the API is temporarily unavailable
- **Smart refresh**: Updates based on game status for optimal performance

### Data Sources:
- **MLB Stats API**: Primary data source (free, no API key required)
- **Team ID**: 117 (Houston Astros)
- **Team Logos**: MLB Static CDN for official team logos
- **Endpoints Used**:
  - Schedule endpoint for today's games
  - Schedule endpoint for upcoming games (7-day range)
  - Game details with live scoring

### API Integration Details

The website automatically:
1. Checks for today's Astros game
2. If no game today, looks for upcoming games in the next 7 days
3. Displays live scores, inning, venue, and game status
4. Shows whether the Astros are winning, losing, or tied
5. Displays team logos and uses dynamic team colors
6. Falls back to mock data if the API is unavailable

### Example API Calls

```javascript
// Get today's schedule
GET https://statsapi.mlb.com/api/v1/schedule?teamId=117&date=2024-01-15&sportId=1

// Get upcoming games
GET https://statsapi.mlb.com/api/v1/schedule?teamId=117&startDate=2024-01-15&endDate=2024-01-22&sportId=1
```

## File Structure

```
AreTheAstrosWinning/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md          # This file
```

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **JavaScript (ES6+)**: Modern JavaScript with async/await
- **Font Awesome**: Icons
- **Google Fonts**: Inter font family
- **MLB Static CDN**: Team logos and favicon

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Mobile Experience

The website is fully optimized for mobile devices:
- **Responsive layout**: Adapts to different screen sizes
- **Touch-friendly**: Large buttons and touch targets
- **Pull-to-refresh**: Works with mobile browser refresh gestures
- **Compact design**: All information fits on one screen
- **Team logos**: Clear team identification with official logos
- **Dynamic colors**: Team colors help with quick visual identification

## Customization

### Colors
The website uses the Astros' official colors:
- Primary: `#002d62` (Navy Blue)
- Accent: `#ff6b35` (Orange)
- Opponent teams: Dynamic colors based on team identity

### Styling
All styles are in `styles.css` and can be easily customized:
- Change colors in the CSS variables
- Modify animations and transitions
- Adjust responsive breakpoints
- Update team color mappings in JavaScript

## Recent Updates

### Latest Features Added:
- **Dynamic Team Colors**: Opponent scores now display in their respective team colors
- **Team Logos**: Official MLB team logos for all teams
- **Status Info Relocation**: Status and last updated time moved to top of page
- **Mobile Layout Optimization**: Improved horizontal layout for mobile devices
- **Smart Refresh System**: Removed auto-refresh checkbox, always-on smart refresh
- **Confetti Integration**: Works seamlessly with auto-refresh system

## Contributing

Feel free to contribute improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, please open an issue in the repository.

---

**Go Astros! 🚀** 