class AstrosLiveScore {
    constructor() {
        this.gameCard = document.getElementById('gameCard');
        this.lastGameContent = document.getElementById('lastGameContent');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.autoRefresh = document.getElementById('autoRefresh');
        this.lastUpdated = document.getElementById('lastUpdated');
        this.autoRefreshInterval = null;
        
        // Track previous scores for confetti detection
        this.previousAstrosScore = 0;
        this.previousOpponentScore = 0;
        this.isFirstLoad = true;
        
        this.init();
    }

    init() {
        this.refreshBtn.addEventListener('click', () => this.fetchGameData());
        this.autoRefresh.addEventListener('change', () => this.toggleAutoRefresh());
        
        // Add mobile-friendly touch events
        this.addMobileTouchSupport();
        
        // Initial load
        this.fetchGameData();
        this.fetchLastGameData();
        
        // Start auto-refresh if checked
        if (this.autoRefresh.checked) {
            this.startAutoRefresh();
        }
    }

    addMobileTouchSupport() {
        // Prevent zoom on double tap for mobile
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Add haptic feedback for mobile devices
        if ('vibrate' in navigator) {
            this.refreshBtn.addEventListener('click', () => {
                navigator.vibrate(50);
            });
        }

        // Optimize for mobile performance
        this.optimizeForMobile();
    }

    optimizeForMobile() {
        // Reduce animation complexity on mobile for better performance
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Reduce confetti particle count on mobile
            this.mobileConfettiCount = 100;
        } else {
            this.mobileConfettiCount = 200;
        }
    }


    async fetchGameData() {
        try {
            this.showLoading();
            this.updateStatus('Fetching game data...');
            
            const gameData = await this.getMLBGameData();
            this.displayGameData(gameData);
            this.updateLastUpdated();
            
            // Also refresh last game data
            this.fetchLastGameData();
            
        } catch (error) {
            console.error('Error fetching game data:', error);
            this.showError('Failed to fetch game data. Please try again.');
        }
    }

    async getMLBGameData() {
        const today = new Date().toISOString().split('T')[0];
        const astrosTeamId = '117'; // Houston Astros team ID
        
        try {
            // First, get today's schedule for the Astros
            const scheduleResponse = await fetch(`https://statsapi.mlb.com/api/v1/schedule?teamId=${astrosTeamId}&date=${today}&sportId=1`);
            
            if (!scheduleResponse.ok) {
                throw new Error('Failed to fetch schedule data');
            }
            
            const scheduleData = await scheduleResponse.json();
            
            // Check if there's a game today
            if (scheduleData.dates && scheduleData.dates.length > 0 && scheduleData.dates[0].games.length > 0) {
                const game = scheduleData.dates[0].games[0];
                return this.processMLBGameData(game);
            } else {
                // No game today, check for upcoming games
                const upcomingResponse = await fetch(`https://statsapi.mlb.com/api/v1/schedule?teamId=${astrosTeamId}&startDate=${today}&endDate=${this.getDateInFuture(7)}&sportId=1`);
                
                if (!upcomingResponse.ok) {
                    throw new Error('Failed to fetch upcoming games');
                }
                
                const upcomingData = await upcomingResponse.json();
                
                if (upcomingData.dates && upcomingData.dates.length > 0 && upcomingData.dates[0].games.length > 0) {
                    const upcomingGame = upcomingData.dates[0].games[0];
                    return this.processMLBGameData(upcomingGame, true);
                } else {
                    return this.getNoGameData();
                }
            }
            
        } catch (error) {
            console.error('Error fetching MLB data:', error);
            // Fallback to mock data if API fails
            return this.getMockGameData();
        }
    }

    processMLBGameData(game, isUpcoming = false) {
        const astrosTeam = game.teams.away.team.name === 'Houston Astros' ? game.teams.away : game.teams.home;
        const opponentTeam = game.teams.away.team.name === 'Houston Astros' ? game.teams.home : game.teams.away;
        
        const astrosScore = astrosTeam.score || 0;
        const opponentScore = opponentTeam.score || 0;
        
        let status = game.status.detailedState;
        let isLive = false;
        
        if (status === 'Live' || status === 'In Progress') {
            isLive = true;
            status = 'Live';
        } else if (status === 'Final') {
            status = 'Final';
        } else if (isUpcoming) {
            status = 'Scheduled';
        }
        
        const gameTime = new Date(game.gameDate);
        const timeString = gameTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            timeZoneName: 'short'
        });
        
        return {
            isLive: isLive,
            astrosScore: astrosScore,
            opponentScore: opponentScore,
            opponent: opponentTeam.team.name.replace('Houston Astros', '').trim(),
            inning: this.getInningString(game.linescore),
            status: status,
            time: timeString,
            venue: game.venue.name,
            isWinning: astrosScore > opponentScore ? true : astrosScore < opponentScore ? false : null
        };
    }

    getInningString(linescore) {
        if (!linescore || !linescore.currentInning) {
            return 'N/A';
        }
        
        const inning = linescore.currentInning;
        const half = linescore.inningHalf;
        
        if (linescore.isTopInning) {
            return `${inning}${half === 'T' ? 'th Top' : 'th Bottom'}`;
        } else {
            return `${inning}th`;
        }
    }

    getDateInFuture(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    getNoGameData() {
        return {
            isLive: false,
            astrosScore: 0,
            opponentScore: 0,
            opponent: 'No Game',
            inning: 'N/A',
            status: 'No Game Today',
            time: 'N/A',
            venue: 'N/A',
            isWinning: null
        };
    }

    async getMockGameData() {
        // Fallback mock data if API fails
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockGames = [
            {
                isLive: true,
                astrosScore: 5,
                opponentScore: 3,
                opponent: 'Rangers',
                inning: '7th',
                status: 'Live',
                time: '8:30 PM',
                venue: 'Minute Maid Park',
                isWinning: true
            },
            {
                isLive: false,
                astrosScore: 2,
                opponentScore: 4,
                opponent: 'Yankees',
                inning: 'Final',
                status: 'Final',
                time: '7:10 PM',
                venue: 'Yankee Stadium',
                isWinning: false
            },
            {
                isLive: false,
                astrosScore: 0,
                opponentScore: 0,
                opponent: 'Red Sox',
                inning: 'Scheduled',
                status: 'Scheduled',
                time: 'Tomorrow 7:10 PM',
                venue: 'Fenway Park',
                isWinning: null
            }
        ];

        const randomIndex = Math.floor(Math.random() * mockGames.length);
        return mockGames[randomIndex];
    }

    async fetchLastGameData() {
        try {
            this.showLastGameLoading();
            
            const lastGameData = await this.getLastMLBGameData();
            this.displayLastGameData(lastGameData);
            
        } catch (error) {
            console.error('Error fetching last game data:', error);
            this.showLastGameError('Failed to load last game data');
        }
    }

    async getLastMLBGameData() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const astrosTeamId = '117';
        
        try {
            // Get yesterday's games
            const response = await fetch(`https://statsapi.mlb.com/api/v1/schedule?teamId=${astrosTeamId}&date=${yesterdayStr}&sportId=1`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch last game data');
            }
            
            const data = await response.json();
            
            // Check if there was a game yesterday
            if (data.dates && data.dates.length > 0 && data.dates[0].games.length > 0) {
                const lastGame = data.dates[0].games[0];
                return this.processLastMLBGameData(lastGame);
            } else {
                // Check for games in the last 7 days
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                const weekAgoStr = weekAgo.toISOString().split('T')[0];
                
                const weekResponse = await fetch(`https://statsapi.mlb.com/api/v1/schedule?teamId=${astrosTeamId}&startDate=${weekAgoStr}&endDate=${yesterdayStr}&sportId=1`);
                
                if (!weekResponse.ok) {
                    throw new Error('Failed to fetch recent games');
                }
                
                const weekData = await weekResponse.json();
                
                // Find the most recent completed game
                let lastGame = null;
                for (const date of weekData.dates) {
                    for (const game of date.games) {
                        if (game.status.detailedState === 'Final') {
                            lastGame = game;
                            break;
                        }
                    }
                    if (lastGame) break;
                }
                
                if (lastGame) {
                    return this.processLastMLBGameData(lastGame);
                } else {
                    return this.getNoLastGameData();
                }
            }
            
        } catch (error) {
            console.error('Error fetching last MLB game data:', error);
            return this.getMockLastGameData();
        }
    }

    processLastMLBGameData(game) {
        const astrosTeam = game.teams.away.team.name === 'Houston Astros' ? game.teams.away : game.teams.home;
        const opponentTeam = game.teams.away.team.name === 'Houston Astros' ? game.teams.home : game.teams.away;
        
        const astrosScore = astrosTeam.score || 0;
        const opponentScore = opponentTeam.score || 0;
        
        const gameDate = new Date(game.gameDate);
        const dateString = gameDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        const timeString = gameDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit'
        });
        
        let result = 'tie';
        if (astrosScore > opponentScore) {
            result = 'win';
        } else if (astrosScore < opponentScore) {
            result = 'loss';
        }
        
        return {
            astrosScore: astrosScore,
            opponentScore: opponentScore,
            opponent: opponentTeam.team.name.replace('Houston Astros', '').trim(),
            date: dateString,
            time: timeString,
            venue: game.venue.name,
            result: result
        };
    }

    getNoLastGameData() {
        return {
            astrosScore: 0,
            opponentScore: 0,
            opponent: 'No Recent Games',
            date: 'N/A',
            time: 'N/A',
            venue: 'N/A',
            result: 'none'
        };
    }

    async getMockLastGameData() {
        // Fallback mock data for last game
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockLastGames = [
            {
                astrosScore: 6,
                opponentScore: 4,
                opponent: 'Rangers',
                date: 'Yesterday',
                time: '8:30 PM',
                venue: 'Minute Maid Park',
                result: 'win'
            },
            {
                astrosScore: 2,
                opponentScore: 5,
                opponent: 'Yankees',
                date: '2 days ago',
                time: '7:10 PM',
                venue: 'Yankee Stadium',
                result: 'loss'
            },
            {
                astrosScore: 3,
                opponentScore: 3,
                opponent: 'Red Sox',
                date: '3 days ago',
                time: '7:05 PM',
                venue: 'Fenway Park',
                result: 'tie'
            }
        ];
        
        const randomIndex = Math.floor(Math.random() * mockLastGames.length);
        return mockLastGames[randomIndex];
    }

    displayLastGameData(lastGameData) {
        if (lastGameData.result === 'none') {
            this.lastGameContent.innerHTML = `
                <div class="no-last-game">
                    <i class="fas fa-calendar-times"></i>
                    <p>No recent games found</p>
                </div>
            `;
            return;
        }
        
        const resultClass = lastGameData.result;
        const resultText = lastGameData.result === 'win' ? 'WIN' : 
                          lastGameData.result === 'loss' ? 'LOSS' : 'TIE';
        
        this.lastGameContent.innerHTML = `
            <div class="last-game-score">
                <div class="last-game-team">
                    <div class="last-game-team-name">Houston Astros</div>
                    <div class="last-game-team-score">${lastGameData.astrosScore}</div>
                </div>
                <div class="last-game-vs">VS</div>
                <div class="last-game-team">
                    <div class="last-game-team-name">${lastGameData.opponent}</div>
                    <div class="last-game-team-score">${lastGameData.opponentScore}</div>
                </div>
            </div>
            
            <div class="last-game-result ${resultClass}">
                ${resultText}
            </div>
            
            <div class="last-game-details">
                <div class="last-game-detail">
                    <div class="last-game-detail-label">Date</div>
                    <div class="last-game-detail-value">${lastGameData.date}</div>
                </div>
                <div class="last-game-detail">
                    <div class="last-game-detail-label">Time</div>
                    <div class="last-game-detail-value">${lastGameData.time}</div>
                </div>
                <div class="last-game-detail">
                    <div class="last-game-detail-label">Venue</div>
                    <div class="last-game-detail-value">${lastGameData.venue}</div>
                </div>
                <div class="last-game-detail">
                    <div class="last-game-detail-label">Status</div>
                    <div class="last-game-detail-value">Final</div>
                </div>
            </div>
        `;
    }

    showLastGameLoading() {
        this.lastGameContent.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading last game...</p>
            </div>
        `;
    }

    showLastGameError(message) {
        this.lastGameContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    displayGameData(gameData) {
        // Check if Astros scored (score increased from previous)
        if (!this.isFirstLoad && gameData.isLive && gameData.astrosScore > this.previousAstrosScore) {
            this.triggerConfetti();
        }
        
        // Update previous scores
        this.previousAstrosScore = gameData.astrosScore;
        this.previousOpponentScore = gameData.opponentScore;
        this.isFirstLoad = false;
        
        const winningStatus = this.getWinningStatus(gameData);
        
        this.gameCard.innerHTML = `
            <div class="game-status">
                <span class="status-badge status-${gameData.status.toLowerCase()}">${gameData.status}</span>
            </div>
            
            <div class="winning-indicator ${winningStatus.class}">
                ${winningStatus.message}
            </div>
            
            <div class="game-info">
                <div class="team">
                    <div class="team-name">Houston Astros</div>
                    <div class="team-score">${gameData.astrosScore}</div>
                </div>
                <div class="vs">VS</div>
                <div class="team">
                    <div class="team-name">${gameData.opponent}</div>
                    <div class="team-score">${gameData.opponentScore}</div>
                </div>
            </div>
            
            <div class="game-details">
                <div class="detail-item">
                    <div class="detail-label">Inning</div>
                    <div class="detail-value">${gameData.inning}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Time</div>
                    <div class="detail-value">${gameData.time}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Venue</div>
                    <div class="detail-value">${gameData.venue}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">${gameData.status}</div>
                </div>
            </div>
        `;
        
        this.updateStatus(gameData.isLive ? 'Live game in progress' : 'Game data updated');
    }

    getWinningStatus(gameData) {
        if (gameData.isWinning === null) {
            return {
                class: 'no-game',
                message: 'No active game'
            };
        }
        
        if (gameData.astrosScore === gameData.opponentScore) {
            return {
                class: 'tied',
                message: 'Game is tied!'
            };
        }
        
        if (gameData.isWinning) {
            return {
                class: 'winning',
                message: 'Astros are WINNING! 🎉'
            };
        } else {
            return {
                class: 'losing',
                message: 'Astros are losing 😔'
            };
        }
    }

    showLoading() {
        this.gameCard.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading game data...</p>
            </div>
        `;
    }

    showError(message) {
        this.gameCard.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
        this.updateStatus('Error occurred');
    }

    updateStatus(message) {
        this.statusText.textContent = message;
    }

    updateLastUpdated() {
        const now = new Date();
        this.lastUpdated.textContent = now.toLocaleTimeString();
    }

    toggleAutoRefresh() {
        if (this.autoRefresh.checked) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }
    }

    startAutoRefresh() {
        this.stopAutoRefresh(); // Clear any existing interval
        this.autoRefreshInterval = setInterval(() => {
            this.fetchGameData();
        }, 30000); // Refresh every 30 seconds
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    triggerConfetti() {
        // Create a festive confetti animation
        const count = this.mobileConfettiCount; // Use mobileConfettiCount
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AstrosLiveScore();
});

// MLB Stats API Integration
// The website now uses the official MLB Stats API to fetch real game data
// No API key required - the MLB Stats API is free and open
// Team ID: 117 (Houston Astros) 