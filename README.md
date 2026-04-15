# Quantity Measurement App — Frontend

A React frontend for the **QuantityMeasurement** Spring Boot backend.

## Features
- **JWT Authentication** — Register & Login with token-based auth
- **Calculator** — Convert, Compare, Add, Subtract, Divide quantities
- **Measurement Types** — Length, Weight, Volume, Temperature
- **History** — Full log with filtering and search
- **Dashboard** — Stats overview and recent operations

---

## Prerequisites
- Node.js 16+ and npm
- Backend running on `http://localhost:8080`

---

## Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Configure backend URL (optional)
By default the app proxies requests to `http://localhost:8080`.  
To change this, edit `package.json` → `"proxy"` field, or create a `.env` file:
```
REACT_APP_API_URL=http://localhost:8080
```

### 3. Start the app
```bash
npm start
```

The app opens at **http://localhost:3000**

---

## Backend CORS Setup

Add this to your Spring Boot `SecurityConfig.java` or a separate `CorsConfig.java` to allow the frontend:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

And enable it in `securityFilterChain`:
```java
http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
```

---

## Project Structure

```
src/
├── App.js                  # Root routes
├── index.js                # Entry point
├── index.css               # Global styles & CSS variables
├── context/
│   └── AuthContext.js      # JWT auth state
├── services/
│   └── api.js              # All Axios API calls
├── components/
│   ├── Layout.js/css       # Navbar + page wrapper
├── pages/
│   ├── AuthPage.js/css     # Login & Register
│   ├── Dashboard.js/css    # Stats overview
│   ├── CalculatorPage.js/css  # Main calculator
│   └── HistoryPage.js/css  # Operation history
```

---

## API Endpoints Used

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login + get JWT |
| POST | /api/v1/quantities/convert | Convert units |
| POST | /api/v1/quantities/compare | Compare quantities |
| POST | /api/v1/quantities/add | Add quantities |
| POST | /api/v1/quantities/subtract | Subtract quantities |
| POST | /api/v1/quantities/divide | Divide quantities |
| GET | /api/v1/quantities/history | All history |
| GET | /api/v1/quantities/history/{op} | History by operation |
| GET | /api/v1/quantities/count/{op} | Count by operation |

---

## Build for Production

```bash
npm run build
```

Output in `build/` folder — serve with any static web server.
