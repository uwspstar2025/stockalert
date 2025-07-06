# Stock Search API Documentation

## 🔍 Current Stock Search Implementation

The stock search functionality in this application now uses **Yahoo Finance API** for real-time stock data with client-side filtering.

## Architecture Overview

### **Search Method: Yahoo Finance API + Client-Side Filtering**

The stock search functionality uses:

1. **Yahoo Finance API Backend**: 
   - Backend fetches real stock data from Yahoo Finance
   - Located in `/backend/routes/stocks.js`
   - Uses `yahoo-finance2` npm package
   - Caches data for 5 minutes to optimize performance

2. **Frontend Filtering**:
   - Search is performed client-side in `filterStocks()` method
   - Filters by stock symbol OR company name
   - Uses basic JavaScript `includes()` for matching

## API Endpoints Currently Used

| Endpoint | Purpose | Method | Data Source |
|----------|---------|---------|-------------|
| `GET /api/stocks` | Get all available stocks | Yahoo Finance API with 5min cache |
| `GET /api/stocks/:symbol` | Get specific stock data | Yahoo Finance API real-time |
| `GET /api/stocks/:symbol/history` | Get historical data | Yahoo Finance API |
| `GET /api/stocks/search/:query` | Search stocks | Yahoo Finance API + filtering |
| `GET /health` | API health check | Server status |

## Search Implementation Details

### Frontend Search Logic
```typescript
filterStocks() {
  this.filteredStocks = this.stocks.filter(stock => {
    const matchesSearch = !this.searchTerm || 
      stock.symbol.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(this.searchTerm.toLowerCase());
    
    const matchesMarket = !this.selectedMarket || stock.category === this.selectedMarket;
    const matchesSelection = !this.showOnlySelected || stock.selected;
    
    return matchesSearch && matchesMarket && matchesSelection;
  });
}
```

### Backend Mock Data Structure
```javascript
const mockStocks = [
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 177.97,
    change: 2.4,
    volume: 45234567,
  },
  // ... 7 more stocks
];
```

## Current Available Stocks

| Symbol | Company Name | Category | Featured |
|--------|--------------|----------|----------|
| TSLA | Tesla Inc. | Tech | ✅ |
| AAPL | Apple Inc. | Tech | ❌ |
| GOOGL | Alphabet Inc. | Tech | ❌ |
| MSFT | Microsoft Corp. | Tech | ❌ |
| NVDA | NVIDIA Corp. | Tech | ❌ |
| AMZN | Amazon.com Inc. | Tech | ❌ |
| META | Meta Platforms Inc. | Tech | ❌ |
| AVGO | Broadcom Inc. | Tech | ❌ |

## Search Features

### ✅ Current Features
- **Real Stock Data**: Uses Yahoo Finance API for live market data
- **Text Search**: Search by stock symbol (e.g., "TSLA") or company name (e.g., "Tesla")
- **Market Filter**: Filter by category (tech, finance, energy)
- **Selection Filter**: Show only selected stocks
- **Case Insensitive**: Search works regardless of case
- **Real-time Filtering**: Results update as you type
- **Caching**: 5-minute cache to optimize API calls
- **Historical Data**: Chart data available via Yahoo Finance
- **Extended Data**: Market cap, day high/low, volume included

### ⚠️ Current Limitations
- **Limited Stock Universe**: Only 8 default stocks (can be expanded)
- **No Advanced Search**: No filtering by price, volume, market cap, etc.
- **No Auto-complete**: No suggestions during search
- **API Rate Limits**: Unofficial API may have usage limits
- **Market Hours**: Real-time data only during market hours

## 🎉 Current Implementation: Yahoo Finance API

### 3. **Yahoo Finance API (Unofficial)** ✅ **CURRENTLY IMPLEMENTED**
- **Free**: Unlimited (but unofficial)
- **Features**: Real-time quotes, search, historical data
- **Best For**: Development and testing
- **Package**: yahoo-finance2
- **Status**: ✅ Active and working

### 4. **Finnhub API**
- **Free Tier**: 60 API calls per minute
- **Features**: Real-time data, company profiles, news
- **Best For**: Financial applications

### 5. **Polygon.io API**
- **Free Tier**: 5 API calls per minute
- **Features**: Real-time and historical market data
- **Best For**: Advanced trading applications

## Implementation Examples

### Example: Alpha Vantage Integration
```javascript
// Backend implementation example
router.get('/search', async (req, res) => {
  const { keywords } = req.query;
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${apiKey}`
    );
    
    res.json({
      success: true,
      data: response.data.bestMatches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});
```

### Example: Frontend API Call
```typescript
// Frontend service method
searchStocks(query: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/stocks/search?keywords=${query}`);
}
```

## Migration Path to Real API

1. **Choose API Provider**: Select based on usage requirements and budget
2. **Update Backend Routes**: Add search endpoint with external API integration
3. **Update Frontend Service**: Add search methods to StockService
4. **Enhance Search UI**: Add loading states, auto-complete, advanced filters
5. **Add Error Handling**: Handle API rate limits and failures
6. **Cache Results**: Implement caching to reduce API calls

## Environment Configuration

To integrate real APIs, add to `.env`:
```env
# Stock API Configuration
STOCK_API_PROVIDER=alphavantage
ALPHA_VANTAGE_API_KEY=your_api_key_here
IEX_CLOUD_API_KEY=your_api_key_here
FINNHUB_API_KEY=your_api_key_here
```

## Security Considerations

- **API Key Management**: Store API keys securely in environment variables
- **Rate Limiting**: Implement client-side rate limiting to prevent API abuse
- **Caching**: Cache frequently requested data to reduce API calls
- **Error Handling**: Provide fallback behavior when API is unavailable
- **CORS**: Configure CORS properly for cross-origin API requests

---

**Last Updated**: July 6, 2025  
**Status**: ✅ Yahoo Finance API Implementation - Live and Working  
**Current API**: Yahoo Finance (yahoo-finance2 package)  
**Features**: Real-time stock data, historical charts, search functionality
