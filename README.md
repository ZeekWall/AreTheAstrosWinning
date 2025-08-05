# Astros Live Score

A beautiful, responsive website that shows if the Houston Astros are winning, displays the current score, and shows their opponent. Built with modern web technologies and designed with a clean, user-friendly interface.

## Features

- **Live Score Display**: Shows current Astros score vs opponent score
- **Winning Status**: Clear indication of whether the Astros are winning, losing, or tied
- **Game Details**: Displays inning, time, venue, and game status
- **Auto-refresh**: Automatically updates every 30 seconds
- **Manual Refresh**: Button to manually refresh game data
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations

## How to Use

1. Open `index.html` in your web browser
2. The website will automatically load and display game data
3. Click the "Refresh" button to manually update the data
4. Toggle the auto-refresh checkbox to enable/disable automatic updates

## Current Implementation

The website now uses the **official MLB Stats API** to fetch real live game data! No API key required - the MLB Stats API is free and open.

### Features:
- **Real-time data**: Fetches actual Astros game data from MLB's official API
- **Live games**: Shows current score, inning, and game status
- **Upcoming games**: Displays scheduled games when no game is currently live
- **Fallback system**: Uses mock data if the API is temporarily unavailable
- **Auto-refresh**: Updates every 30 seconds to keep data current

### Data Sources:
- **MLB Stats API**: Primary data source (free, no API key required)
- **Team ID**: 117 (Houston Astros)
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
5. Falls back to mock data if the API is unavailable

### Example API Calls

```javascript
// Get today's schedule
GET https://statsapi.mlb.com/api/v1/schedule?teamId=117&date=2024-01-15&sportId=1

// Get upcoming games
GET https://statsapi.mlb.com/api/v1/schedule?teamId=117&startDate=2024-01-15&endDate=2024-01-22&sportId=1
```

## File Structure

```
astros-live-score/
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

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Customization

### Colors
The website uses the Astros' official colors:
- Primary: `#002d62` (Navy Blue)
- Accent: `#ff6b35` (Orange)

### Styling
All styles are in `styles.css` and can be easily customized:
- Change colors in the CSS variables
- Modify animations and transitions
- Adjust responsive breakpoints

## Deployment

Your Astros Live Score website is ready to deploy! Here are the best options:

### 🚀 **Recommended: GitHub Pages (Free)**
- **Perfect for**: First-time deployment, learning
- **Cost**: Free
- **Setup**: 5 minutes
- **Guide**: See [deploy-github-pages.md](deploy-github-pages.md)

### ⚡ **Fastest: Netlify (Free)**
- **Perfect for**: Quick deployment, custom domains
- **Cost**: Free tier available
- **Setup**: 2 minutes (drag & drop)
- **Guide**: See [deploy-netlify.md](deploy-netlify.md)

### 🎯 **Professional: Vercel (Free)**
- **Perfect for**: Production sites, team collaboration
- **Cost**: Free tier available
- **Setup**: 3 minutes
- **Guide**: See [deploy-vercel.md](deploy-vercel.md)

### 🧪 **Local Testing**
Before deploying, test locally:
```bash
# Using Python (built-in)
python -m http.server 8000

# Using Node.js
npx serve .
```
**Guide**: See [local-development.md](local-development.md)

### 📱 **After Deployment**
1. Test the live site on your phone
2. Verify the MLB API calls work
3. Check that auto-refresh functions properly
4. Share your URL with friends!

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