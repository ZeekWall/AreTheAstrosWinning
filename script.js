class AstrosLiveScore {
    constructor() {
        this.gameCard = document.getElementById('gameCard');
        this.lastGameContent = document.getElementById('lastGameContent');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.lastUpdated = document.getElementById('lastUpdated');
        this.autoRefreshInterval = null;
        
        // Track previous scores for confetti detection
        this.previousAstrosScore = 0;
        this.previousOpponentScore = 0;
        this.isFirstLoad = true;
        
        // Smart refresh tracking
        this.lastGameData = null;
        this.lastLastGameData = null;
        this.smartRefreshInterval = null;
        
        // Team color mapping for dynamic opponent colors
        this.teamColors = {
            117: '#ff6b35', // Houston Astros - Orange
            140: '#c8102e', // Texas Rangers - Red
            147: '#003087', // New York Yankees - Navy Blue
            111: '#0c2340', // Boston Red Sox - Navy Blue
            121: '#002d72', // New York Mets - Blue
            120: '#002d72', // Baltimore Orioles - Orange
            139: '#0c2340', // Tampa Bay Rays - Navy Blue
            141: '#1d2d5c', // Toronto Blue Jays - Blue
            142: '#ce1141', // Minnesota Twins - Red
            145: '#002d72', // Chicago White Sox - Black
            158: '#0c2340', // Milwaukee Brewers - Navy Blue
            113: '#ce1141', // Cincinnati Reds - Red
            114: '#0c2340', // Cleveland Guardians - Navy Blue
            115: '#0c2340', // Colorado Rockies - Purple
            116: '#0c2340', // Detroit Tigers - Navy Blue
            118: '#002d72', // Kansas City Royals - Blue
            108: '#002d72', // Los Angeles Angels - Red
            119: '#002d72', // Los Angeles Dodgers - Blue
            110: '#0c2340', // Baltimore Orioles - Orange
            121: '#002d72', // New York Mets - Blue
            133: '#0c2340', // Oakland Athletics - Green
            143: '#002d72', // Philadelphia Phillies - Red
            134: '#0c2340', // Pittsburgh Pirates - Black
            135: '#002d72', // San Diego Padres - Brown
            137: '#0c2340', // San Francisco Giants - Orange
            138: '#002d72', // Seattle Mariners - Navy Blue
            146: '#0c2340', // Miami Marlins - Orange
            144: '#002d72', // Atlanta Braves - Red
            121: '#002d72', // Arizona Diamondbacks - Red
            109: '#0c2340', // Chicago Cubs - Blue
            112: '#002d72', // Chicago White Sox - Black
            113: '#ce1141', // Cincinnati Reds - Red
            114: '#0c2340', // Cleveland Guardians - Navy Blue
            115: '#0c2340', // Colorado Rockies - Purple
            116: '#0c2340', // Detroit Tigers - Navy Blue
            117: '#ff6b35', // Houston Astros - Orange
            118: '#002d72', // Kansas City Royals - Blue
            119: '#002d72', // Los Angeles Dodgers - Blue
            120: '#002d72', // Baltimore Orioles - Orange
            121: '#002d72', // New York Mets - Blue
            133: '#0c2340', // Oakland Athletics - Green
            134: '#0c2340', // Pittsburgh Pirates - Black
            135: '#002d72', // San Diego Padres - Brown
            136: '#0c2340', // San Francisco Giants - Orange
            137: '#0c2340', // San Francisco Giants - Orange
            138: '#002d72', // Seattle Mariners - Navy Blue
            139: '#0c2340', // Tampa Bay Rays - Navy Blue
            140: '#c8102e', // Texas Rangers - Red
            141: '#1d2d5c', // Toronto Blue Jays - Blue
            142: '#ce1141', // Minnesota Twins - Red
            143: '#002d72', // Philadelphia Phillies - Red
            144: '#002d72', // Atlanta Braves - Red
            145: '#002d72', // Chicago White Sox - Black
            146: '#0c2340', // Miami Marlins - Orange
            147: '#003087', // New York Yankees - Navy Blue
            158: '#0c2340', // Milwaukee Brewers - Navy Blue
        };
        
        this.init();
    }

    init() {
        this.refreshBtn.addEventListener('click', () => this.fetchGameData());
        
        // Add mobile-friendly touch events
        this.addMobileTouchSupport();
        
        // Initial load
        this.fetchGameData();
        this.fetchLastGameData();
        
        // Start smart auto-refresh
        this.startAutoRefresh();
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

    getOpponentTeamColor(teamId) {
        return this.teamColors[teamId] || '#ffffff'; // Default to white if team not found
    }

    async fetchGameData() {
        try {
            // Store scroll position before any updates
            const scrollPosition = window.scrollY;
            
            // Only show loading on first load, not on refreshes
            if (this.isFirstLoad) {
                this.showLoading();
            }
            this.updateStatus('Fetching game data...');
            
            const gameData = await this.getMLBGameData();
            
            // Check if data has changed before updating
            if (this.hasGameDataChanged(gameData)) {
                this.displayGameData(gameData);
                this.lastGameData = gameData; // Store for comparison
                this.updateLastUpdated();
            } else {
                // No changes, just update status
                this.updateStatus('No updates available');
            }
            
            // Also refresh last game data
            this.fetchLastGameData();
            
            // Ensure scroll position is maintained
            if (!this.isFirstLoad) {
                window.scrollTo(0, scrollPosition);
            }
            
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
            console.log('Schedule API response:', scheduleData);
            
            // Check if there's a game today
            if (scheduleData.dates && scheduleData.dates.length > 0 && scheduleData.dates[0].games.length > 0) {
                const game = scheduleData.dates[0].games[0];
                console.log('Found game today:', game);
                console.log('Game status:', game.status);
                return this.processMLBGameData(game);
            } else {
                console.log('No game found today, checking upcoming games...');
                // No game today, check for upcoming games
                const upcomingResponse = await fetch(`https://statsapi.mlb.com/api/v1/schedule?teamId=${astrosTeamId}&startDate=${today}&endDate=${this.getDateInFuture(7)}&sportId=1`);
                
                if (!upcomingResponse.ok) {
                    throw new Error('Failed to fetch upcoming games');
                }
                
                const upcomingData = await upcomingResponse.json();
                console.log('Upcoming games response:', upcomingData);
                
                if (upcomingData.dates && upcomingData.dates.length > 0 && upcomingData.dates[0].games.length > 0) {
                    const upcomingGame = upcomingData.dates[0].games[0];
                    console.log('Found upcoming game:', upcomingGame);
                    return this.processMLBGameData(upcomingGame, true);
                } else {
                    console.log('No upcoming games found');
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
        
        console.log('Processing game data:', {
            originalStatus: game.status,
            detailedState: status,
            isUpcoming: isUpcoming
        });
        
        if (status === 'Live' || status === 'In Progress') {
            isLive = true;
            status = 'Live';
        } else if (status === 'Final') {
            status = 'Final';
        } else if (isUpcoming) {
            status = 'Scheduled';
        }
        
        console.log('Processed status:', { status, isLive });
        
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
            opponentTeamId: opponentTeam.team.id,
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
            opponentTeamId: null,
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
                opponentTeamId: 140,
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
                opponentTeamId: 147,
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
                opponentTeamId: 111,
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
            // Only show loading on first load, not on refreshes
            if (this.isFirstLoad) {
                this.showLastGameLoading();
            }
            
            const lastGameData = await this.getLastMLBGameData();
            
            // Check if last game data has changed before updating
            if (this.hasLastGameDataChanged(lastGameData)) {
                this.displayLastGameData(lastGameData);
                this.lastLastGameData = lastGameData; // Store for comparison
            }
            
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
            opponentTeamId: opponentTeam.team.id,
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
            opponentTeamId: null,
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
                opponentTeamId: 140,
                date: 'Yesterday',
                time: '8:30 PM',
                venue: 'Minute Maid Park',
                result: 'win'
            },
            {
                astrosScore: 2,
                opponentScore: 5,
                opponent: 'Yankees',
                opponentTeamId: 147,
                date: '2 days ago',
                time: '7:10 PM',
                venue: 'Yankee Stadium',
                result: 'loss'
            },
            {
                astrosScore: 3,
                opponentScore: 3,
                opponent: 'Red Sox',
                opponentTeamId: 111,
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
        
        // Check if mobile layout is needed
        const isMobile = window.innerWidth <= 480;
        
        const newContent = `
            <div class="last-game-score">
                ${isMobile ? `
                                    <div class="last-game-team">
                    <div class="team-logo">
                        <img src="https://www.mlbstatic.com/team-logos/team-cap-on-dark/117.svg" alt="Houston Astros" onerror="this.style.display='none'">
                    </div>
                    <div class="last-game-team-name">Houston Astros</div>
                    <div class="last-game-team-score astros">${lastGameData.astrosScore}</div>
                </div>
                <div class="last-game-team">
                    <div class="team-logo">
                        <img src="https://www.mlbstatic.com/team-logos/team-cap-on-dark/${lastGameData.opponentTeamId}.svg" alt="${lastGameData.opponent}" onerror="this.style.display='none'">
                    </div>
                    <div class="last-game-team-name">${lastGameData.opponent}</div>
                    <div class="last-game-team-score opponent" style="color: ${this.getOpponentTeamColor(lastGameData.opponentTeamId)};">${lastGameData.opponentScore}</div>
                </div>
                ` : `
                    <div class="last-game-team">
                        <div class="team-logo">
                            <img src="https://www.mlbstatic.com/team-logos/team-cap-on-dark/117.svg" alt="Houston Astros" onerror="this.style.display='none'">
                        </div>
                        <div class="last-game-team-name">Houston Astros</div>
                        <div class="last-game-team-score astros">${lastGameData.astrosScore}</div>
                    </div>
                    <div class="last-game-vs">VS</div>
                    <div class="last-game-team">
                        <div class="team-logo">
                            <img src="https://www.mlbstatic.com/team-logos/team-cap-on-dark/${lastGameData.opponentTeamId}.svg" alt="${lastGameData.opponent}" onerror="this.style.display='none'">
                        </div>
                        <div class="last-game-team-name">${lastGameData.opponent}</div>
                        <div class="last-game-team-score opponent" style="color: ${this.getOpponentTeamColor(lastGameData.opponentTeamId)};">${lastGameData.opponentScore}</div>
                    </div>
                `}
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
        
        // Use smooth update for last game data as well
        this.smoothUpdate(this.lastGameContent, newContent);
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
        
        // Check if mobile layout is needed
        const isMobile = window.innerWidth <= 480;
        
        // Create new content with mobile-optimized layout
        const newContent = `
            <div class="game-status">
                <span class="status-badge status-${gameData.status.toLowerCase()}">${gameData.status}</span>
            </div>
            
            <div class="winning-indicator ${winningStatus.class}">
                ${winningStatus.message}
            </div>
            
            <div class="game-info">
                ${isMobile ? `
                                    <div class="team">
                    <div class="team-logo">
                        <img src="https://www.mlbstatic.com/team-logos/team-cap-on-dark/117.svg" alt="Houston Astros" onerror="this.style.display='none'">
                    </div>
                    <div class="team-name">Houston Astros</div>
                    <div class="team-score astros">${gameData.astrosScore}</div>
                </div>
                <div class="team">
                    <div class="team-logo">
                        <img src="https://www.mlbstatic.com/team-logos/team-cap-on-dark/${gameData.opponentTeamId}.svg" alt="${gameData.opponent}" onerror="this.style.display='none'">
                    </div>
                    <div class="team-name">${gameData.opponent}</div>
                    <div class="team-score opponent" style="color: ${this.getOpponentTeamColor(gameData.opponentTeamId)};">${gameData.opponentScore}</div>
                </div>
                ` : `
                    <div class="team">
                        <div class="team-logo">
                            <img src="https://www.mlbstatic.com/team-logos/team-cap-on-dark/117.svg" alt="Houston Astros" onerror="this.style.display='none'">
                        </div>
                        <div class="team-name">Houston Astros</div>
                        <div class="team-score astros">${gameData.astrosScore}</div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team">
                        <div class="team-logo">
                            <img src="https://www.mlbstatic.com/team-logos/team-cap-on-dark/${gameData.opponentTeamId}.svg" alt="${gameData.opponent}" onerror="this.style.display='none'">
                        </div>
                        <div class="team-name">${gameData.opponent}</div>
                        <div class="team-score opponent" style="color: ${this.getOpponentTeamColor(gameData.opponentTeamId)};">${gameData.opponentScore}</div>
                    </div>
                `}
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
        
        // Smooth update - fade out, update content, fade in
        if (!this.isFirstLoad) {
            this.smoothUpdate(this.gameCard, newContent);
        } else {
            // Store scroll position for initial load too
            const scrollPosition = window.scrollY;
            this.gameCard.innerHTML = newContent;
            // Restore scroll position
            window.scrollTo(0, scrollPosition);
        }
        
        this.updateStatus(gameData.isLive ? 'Live game in progress' : 'Game data updated');
    }

    smoothUpdate(element, newContent) {
        // Store current scroll position
        const scrollPosition = window.scrollY;
        
        // Add fade out effect
        element.style.opacity = '0.7';
        element.style.transition = 'opacity 0.2s ease';
        
        setTimeout(() => {
            element.innerHTML = newContent;
            element.style.opacity = '1';
            
            // Restore scroll position
            window.scrollTo(0, scrollPosition);
        }, 200);
    }

    // updateQuickStatus(gameData) { // Removed
    //     let answer = '';
    //     let className = '';
        
    //     if (gameData.isWinning === null) {
    //         // No game or game not started
    //         answer = 'No Game';
    //         className = 'no-game';
    //     } else if (gameData.astrosScore === gameData.opponentScore) {
    //         // Game is tied
    //         answer = 'TIE';
    //         className = 'tie';
    //     } else if (gameData.isWinning) {
    //         // Astros are winning
    //         answer = 'YES';
    //         className = 'yes';
    //     } else {
    //         // Astros are losing
    //         answer = 'NO';
    //         className = 'no';
    //     }
        
    //     // Debug logging
    //     console.log('Quick Status Update:', { answer, className, gameData });
        
    //     if (this.quickStatusAnswer) {
    //         this.quickStatusAnswer.textContent = answer;
    //         this.quickStatusAnswer.className = `quick-status-answer ${className}`;
    //         console.log('Updated quick status element:', this.quickStatusAnswer);
    //     } else {
    //         console.error('Quick status answer element not found!');
    //     }
    // }

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
        
        // Add subtle loading indicator during refreshes
        if (message.includes('Fetching')) {
            this.statusIndicator.style.opacity = '0.8';
        } else if (message.includes('No updates')) {
            this.statusIndicator.style.opacity = '0.6';
        } else {
            this.statusIndicator.style.opacity = '1';
        }
    }

    updateLastUpdated() {
        const now = new Date();
        this.lastUpdated.textContent = now.toLocaleTimeString();
    }

    startAutoRefresh() {
        this.stopAutoRefresh(); // Clear any existing interval
        
        // Smart refresh intervals based on game status
        const getRefreshInterval = () => {
            if (!this.lastGameData) return 30000; // Default 30 seconds
            
            if (this.lastGameData.isLive) {
                return 15000; // Live games: refresh every 15 seconds
            } else if (this.lastGameData.status === 'Scheduled') {
                return 60000; // Scheduled games: refresh every minute
            } else {
                return 300000; // Final games: refresh every 5 minutes
            }
        };
        
        const performRefresh = () => {
            this.fetchGameData();
            
            // Update interval based on current game status
            const newInterval = getRefreshInterval();
            if (this.autoRefreshInterval) {
                clearInterval(this.autoRefreshInterval);
                this.autoRefreshInterval = setInterval(performRefresh, newInterval);
            }
        };
        
        // Start with initial interval
        this.autoRefreshInterval = setInterval(performRefresh, getRefreshInterval());
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

    hasGameDataChanged(newGameData) {
        if (!this.lastGameData) return true; // First load
        
        // Compare key fields that indicate a change
        const old = this.lastGameData;
        const new_ = newGameData;
        
        return (
            old.astrosScore !== new_.astrosScore ||
            old.opponentScore !== new_.opponentScore ||
            old.status !== new_.status ||
            old.inning !== new_.inning ||
            old.isLive !== new_.isLive ||
            old.opponent !== new_.opponent
        );
    }

    hasLastGameDataChanged(newLastGameData) {
        if (!this.lastLastGameData) return true; // First load
        
        // Compare key fields for last game
        const old = this.lastLastGameData;
        const new_ = newLastGameData;
        
        return (
            old.astrosScore !== new_.astrosScore ||
            old.opponentScore !== new_.opponentScore ||
            old.result !== new_.result ||
            old.opponent !== new_.opponent
        );
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