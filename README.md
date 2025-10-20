# WanderMind - Your Intelligent Travel Companion

> A modern, full-stack travel planning application that helps you plan perfect trips with AI-powered itineraries, discover amazing destinations, and manage all your travel experiences in one place.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://wander-mind-taupe.vercel.app/)
[![Backend API](https://img.shields.io/badge/API-live-blue)](https://wander-mind.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![Made with Django](https://img.shields.io/badge/Django-5.2.6-green)](https://www.djangoproject.com/)

---

## Live Deployment

- **Frontend**: [https://wander-mind-taupe.vercel.app/](https://wander-mind-taupe.vercel.app/)
- **Backend API**: [https://wander-mind.onrender.com](https://wander-mind.onrender.com)
- **Demo Account**: Email: demo@example.com, Password: Demo@123

---

## Features

### **AI-Powered Trip Planning**
- Generate personalized day-by-day itineraries with Google Gemini AI
- Smart recommendations based on travel style and budget
- Budget and style customization (Solo, Family, Adventure, Cultural, Romantic)
- Activity scheduling and time optimization
- Multi-destination trip support

### **Interactive Destination Discovery**
-  Explore 1000+ destinations worldwide
-  Real-time weather information for destinations
-  Interactive maps with React Leaflet and custom markers
-  Advanced search and filtering by country, name, and description
-  Save favorite destinations for quick access

###  **Comprehensive Trip Management**
-  Create and manage multiple trips simultaneously
-  Multi-destination support per trip
-  Trip analytics and statistics dashboard
-  Export and share itineraries
-  Clone existing trips for easy planning
-  Track upcoming, current, and past trips

###  **Currency Tools**
-  Real-time currency conversion with live exchange rates
-  Historical exchange rate charts (30-day trends)
-  Popular currency pairs and favorites system
-  Travel-focused currency insights and tips
-  Conversion history tracking

### **Secure Authentication**
-  Email and password authentication
-  Google OAuth 2.0 sign-in integration
-  Secure JWT token management with auto-refresh
-  Profile management and user settings
-  Account security features and password management

### **User Dashboard**
-  Comprehensive travel statistics and analytics
-  Upcoming trips overview
-  Quick access to favorite destinations
-  Interactive map view of all destinations
-  Visual trip progress tracking

---

## Tech Stack

### **Frontend**
- **Framework**: [Next.js 14](https://nextjs.org/) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom CSS
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) validation
- **HTTP Client**: [Axios](https://axios-http.com/) with interceptors
- **Maps**: [React Leaflet](https://react-leaflet.js.org/)
- **UI Components**: [Headless UI](https://headlessui.com/) + Custom components
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/) + [React DatePicker](https://reactdatepicker.com/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

### **Backend**
- **Framework**: [Django 5.2.6](https://www.djangoproject.com/)
- **API**: [Django REST Framework](https://www.django-rest-framework.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- **AI Integration**: [Google Gemini API](https://ai.google.dev/)
- **Weather Data**: [OpenWeather API](https://openweathermap.org/)
- **Currency Data**: [Exchange Rate API](https://exchangerate-api.com/)

### **Deployment**
- **Frontend Hosting**: [Vercel](https://vercel.com/)
- **Backend Hosting**: [Render](https://render.com/)
- **Database**: PostgreSQL on Render

---

## Project Structure

```
Wander-Mind/
├── 📁 frontend/                 # Next.js Frontend Application
│   ├── 📁 components/           # Reusable UI components
│   │   ├── auth/               # Authentication forms
│   │   ├── destinations/       # Destination components
│   │   ├── trips/              # Trip management components
│   │   ├── ui/                 # Base UI components
│   │   └── layout/             # Layout components
│   ├── 📁 pages/               # Next.js pages (file-based routing)
│   │   ├── auth/               # Authentication pages
│   │   ├── trips/              # Trip-related pages
│   │   ├── destinations/       # Destination pages
│   │   ├── _app.tsx            # App wrapper
│   │   ├── _document.tsx       # HTML document
│   │   └── index.tsx           # Home page
│   ├── 📁 services/            # API services and state management
│   ├── 📁 utils/               # Utility functions and types
│   └── 📁 styles/              # Global styles
│
├── 📁 backend/                  # Django Backend Application
│   ├── 📁 accounts/            # User authentication app
│   ├── 📁 destinations/        # Destinations management app
│   ├── 📁 trips/               # Trip planning app
│   ├── 📁 core/                # Core settings and configuration
│   └── manage.py               # Django management script
│
└── 📄 README.md                # This file
```

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 14+
- **Git**

### Installation

#### **Clone the Repository**

```bash
git clone https://github.com/Hanzi448/Wander-Mind.git
cd Wander-Mind
```

#### **Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section)

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

#### **Frontend Setup**

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

---

## Environment Variables

### **Backend (.env)**

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DB_NAME=wandermind_db
DB_USER=your_db_user
DB_PASS=your_db_password
DB_HOST=localhost
DB_PORT=5432

# API Keys
GEMINI_API_KEY=your-gemini-api-key
OPENWEATHER_API_KEY=your-openweather-api-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### **Frontend (.env.local)**

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### **API Keys Setup**

1. **Google Gemini API**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **OpenWeather API**: Get from [OpenWeather](https://openweathermap.org/api)
3. **Google OAuth**: Setup at [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `http://localhost:3000` (development)
     - `https://your-domain.com` (production)

---

## API Documentation

### **Base URL**
- Local: `http://localhost:8000`
- Production: `https://wander-mind.onrender.com`

### **Authentication Endpoints**

```
POST   /api/accounts/register/          # Register new user
POST   /api/accounts/login/             # Login user
POST   /api/accounts/logout/            # Logout user
POST   /api/accounts/refresh/           # Refresh JWT token
GET    /api/accounts/me/                # Get user profile
POST   /api/accounts/google/            # Google OAuth login
```

### **Destinations Endpoints**

```
GET    /api/destinations/                      # List all destinations
GET    /api/destinations/{id}/                 # Get destination details
GET    /api/destinations/{id}/weather/         # Get destination weather
POST   /api/destinations/{id}/favorite/        # Add to favorites
DELETE /api/destinations/{id}/favorite/        # Remove from favorites
GET    /api/destinations/my_favorites/         # Get user favorites
```

### **Trips Endpoints**

```
GET    /api/trips/                             # List user trips
POST   /api/trips/                             # Create new trip
GET    /api/trips/{id}/                        # Get trip details
PUT    /api/trips/{id}/                        # Update trip
DELETE /api/trips/{id}/                        # Delete trip
POST   /api/trips/{id}/generate_itinerary/    # Generate AI itinerary
```

### **Currency Endpoint**

```
GET    /currency/convert/                      # Convert currency
       ?from={currency_code}&to={currency_code}&amount={amount}
```

---

## Features Showcase

### **AI Itinerary Generation**
The AI-powered itinerary generator creates personalized day-by-day plans based on:
- Trip duration and dates
- Selected destinations
- Budget preference (Low, Medium, Luxury)
- Travel style (Solo, Family, Adventure, Cultural, Romantic)
- User preferences and interests

### **Interactive Maps**
- **Custom Markers**: Different colors for primary, secondary, and selected destinations
- **User Location**: Real-time user position tracking
- **Fullscreen Mode**: Immersive map viewing experience
- **Zoom Controls**: Easy navigation and exploration
- **Destination Details**: Click markers for detailed information

### **Real-time Weather**
- Current temperature and conditions
- Humidity and wind information
- Weather forecasts for trip planning
- Location-specific weather data

### **Smart Search & Filters**
- Search by destination name, country, or description
- Filter by country
- Sort by multiple criteria (name, date, popularity)
- View modes (grid/list)
- Active filter management

---

## Development

### **Available Scripts**

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

#### Backend
```bash
python manage.py runserver       # Start development server
python manage.py makemigrations  # Create migrations
python manage.py migrate         # Apply migrations
python manage.py test            # Run tests
python manage.py createsuperuser # Create admin user
```

### **Code Style**

#### Frontend
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Consistent code formatting
- **Naming**: camelCase for variables, PascalCase for components

#### Backend
- **PEP 8**: Python style guide
- **Django**: Follow Django best practices
- **Black**: Code formatting (recommended)

---

## Deployment

### **Frontend (Vercel)**

1. **Connect Repository**
   - Import project from GitHub
   - Select `frontend` directory as root

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Environment Variables**
   - Add all variables from `.env.local`
   - Ensure `NEXT_PUBLIC_API_URL` points to production backend

4. **Deploy**
   - Automatic deployment on push to main branch

### **Backend (Render)**

1. **Create Web Service**
   - Connect GitHub repository
   - Select `backend` directory

2. **Configure Settings**
   ```
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn core.wsgi:application
   ```

3. **Environment Variables**
   - Add all variables from `.env`
   - Set `DEBUG=False` for production
   - Configure `ALLOWED_HOSTS`

4. **Database**
   - Create PostgreSQL instance on Render
   - Update database environment variables

5. **Static Files**
   - Configure static file serving
   - Run `python manage.py collectstatic`

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**
   ```bash
   gh repo fork Hanzi448/Wander-Mind
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit Your Changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```

4. **Push to the Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Ensure all tests pass

### **Development Guidelines**
- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure code passes linting checks

---

## Known Issues & Limitations

- **AI Itinerary Generation**: Response time depends on API availability
- **Weather Data**: Limited to current weather (forecasts coming soon)
- **Map Performance**: Large number of markers may impact performance
- **Mobile Maps**: Touch interactions may need refinement

**Note**: This project is actively maintained. Please report issues on [GitHub Issues](https://github.com/Hanzi448/Wander-Mind/issues).

---

## Performance

### **Lighthouse Scores** (Target)
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 90+

### **Optimizations**
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- API response caching
- Efficient state management
- Minified and compressed assets

---

## Security

### **Implemented Security Measures**
- JWT authentication with automatic refresh
- HTTPS enforcement in production
- CORS configuration
- Input validation and sanitization
- SQL injection protection (Django ORM)
- XSS protection
- CSRF protection
- Secure password hashing (bcrypt)

### **Security Headers**
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: origin-when-cross-origin
```

---

## Future Enhancements

### **Planned Features**
- [ ] **Mobile App**: React Native version
- [ ] **Offline Support**: PWA capabilities
- [ ] **Social Features**: Share trips with friends
- [ ] **Booking Integration**: Hotels and flights booking
- [ ] **Travel Blog**: User-generated content
- [ ] **Advanced Analytics**: Travel insights and trends
- [ ] **Multi-language Support**: i18n implementation
- [ ] **Dark Mode**: Theme customization
- [ ] **Push Notifications**: Trip reminders and updates
- [ ] **Collaborative Planning**: Share and edit trips with others

---

## Support & Contact

### **Get Help**
- **GitHub Issues**: [Report bugs or request features](https://github.com/Hanzi448/Wander-Mind/issues)
- **Email**: salaheenhanzala624@gmail.com
- **Discussions**: [Community Q&A](https://github.com/Hanzi448/Wander-Mind/discussions)

### **Resources**
- [Next.js Documentation](https://nextjs.org/docs)
- [Django Documentation](https://docs.djangoproject.com/)
- [Project Wiki](https://github.com/Hanzi448/Wander-Mind/wiki)

---

## Author

**Hanzala Salaheen**
- GitHub: [@Hanzi448](https://github.com/Hanzi448)
- Email: salaheenhanzala624@gmail.com

---

## Acknowledgments

- **Next.js Team** for the amazing React framework
- **Django** for the robust backend framework
- **Tailwind CSS** for the utility-first CSS framework
- **Google Gemini** for AI-powered itinerary generation
- **OpenWeather** for weather data
- **Leaflet** for interactive maps
- **Vercel** for frontend hosting
- **Render** for backend hosting
- **Unsplash** for beautiful travel photography

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Hanzala Salaheen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

### **Star this repository if you find it helpful!**

**Built with ❤️ for travelers worldwide**

[ Live Demo](https://wander-mind-git-main-hanzalas-projects-632fb6fe.vercel.app/) • [ API](https://wander-mind.onrender.com) • [ Documentation](https://github.com/Hanzi448/Wander-Mind/wiki) • [ Report Bug](https://github.com/Hanzi448/Wander-Mind/issues)

**Happy Traveling!**

</div>
