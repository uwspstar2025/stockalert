# Stock Tracker

A comprehensive full-stack application for tracking Tesla and other stock prices with real-time monitoring, AI analysis, portfolio management, and intelligent price alerts.

## Features

- 📊 **Real-time Stock Monitoring** - Live price updates via WebSocket
- 🎯 **Stock Selection** - Choose from popular stocks including TSLA, AAPL, GOOGL, etc.
- 📈 **Trading System** - Classic 4%-20% trading strategy implementation
- 💼 **Portfolio Management** - Track your investments and performance
- 🤖 **AI Analysis** - Intelligent market analysis and predictions (coming soon)
- 🔔 **Price Alerts** - Email, SMS, and push notifications for price movements

## Tech Stack

### Frontend
- **Angular 17** - Modern web framework
- **Angular Material** - UI component library
- **SCSS** - Styling
- **WebSocket** - Real-time data updates
- **Chart.js** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **WebSocket (ws)** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client
- **Node-cron** - Scheduled tasks

## Project Structure

```
stockalert/
├── frontend/                 # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Angular components
│   │   │   └── services/     # Angular services
│   │   └── styles.scss       # Global styles
│   ├── package.json
│   └── angular.json
├── backend/                  # Node.js backend API
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── server.js            # Main server file
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stockalert
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ng serve
   ```

4. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000
   - WebSocket: ws://localhost:3000

## API Endpoints

### Stocks
- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/:symbol` - Get specific stock data
- `GET /api/stocks/:symbol/history` - Get stock price history
- `POST /api/stocks/watchlist` - Add stocks to watchlist

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (authenticated)

## WebSocket Events

### Client to Server
- `subscribe` - Subscribe to stock updates
- `unsubscribe` - Unsubscribe from stock updates
- `ping` - Health check

### Server to Client
- `welcome` - Connection established
- `price_update` - Real-time price updates
- `alert` - Price alert notifications
- `pong` - Ping response

## Development

### Frontend Development
```bash
cd frontend
ng serve --open    # Start dev server with auto-reload
ng build          # Build for production
ng test           # Run unit tests
```

### Backend Development
```bash
cd backend
npm run dev       # Start with nodemon (auto-reload)
npm start         # Start production server
npm test          # Run tests
```

## Configuration

### Environment Variables (Backend)
Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
STOCK_API_KEY=your-stock-api-key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

## Features Overview

### 1. Stock Selection
- Modern card-based interface
- Real-time price display
- Multi-select functionality
- Featured stock highlighting (TSLA)

### 2. Tracking System
- 4%-20% trading strategy
- Real-time data monitoring
- Error handling and alerts
- Service restart functionality

### 3. Portfolio Management
- Coming soon with advanced features
- Holdings analysis
- Performance tracking
- Risk assessment

### 4. AI Analysis
- Intelligent market predictions
- Technical analysis
- Investment recommendations
- Machine learning insights

### 5. Price Alerts
- Multiple notification methods
- Custom trigger conditions
- Real-time alert processing
- Smart triggering logic

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@tesla-stock-tracker.com or create an issue in the repository.

---

Built with ❤️ using Angular and Node.js
