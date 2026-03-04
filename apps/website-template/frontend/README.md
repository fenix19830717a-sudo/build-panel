# WebsiteTemplate Frontend

A modern, responsive, and themeable website template built with React + Vite + TypeScript + Tailwind CSS.

## 🚀 Features

### Core Technologies
- **React 19** - Latest React with improved performance
- **Vite** - Lightning fast development and optimized builds
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern utility-first CSS
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing

### Theme System ⭐
Dynamic theme configuration loaded from API:
```typescript
// Theme is fetched from /api/v1/theme/config
const theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    foreground: '#0f172a',
    // ...
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  }
}
```

### Built-in Themes
1. **Default Theme** - Clean, modern blue theme
2. **Elegant Theme** - Dark luxury theme with gold accents (perfect for jewelry)

## 📁 Project Structure

```
src/
├── components/
│   ├── Header/          # Navigation header
│   ├── Footer/          # Site footer
│   ├── Layout/          # Main layout wrapper
│   └── sections/        # Home page sections
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── Products.tsx
│       ├── About.tsx
│       ├── News.tsx
│       └── CTA.tsx
├── pages/
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Products.tsx
│   ├── News.tsx
│   └── Contact.tsx
├── contexts/
│   └── ThemeContext.tsx # Theme management
├── types/
│   └── index.ts         # TypeScript types
├── App.tsx
├── main.tsx
└── index.css
```

## 🎨 Pages

### Home
- Hero section with animated stats
- Features showcase
- Product highlights
- Company overview
- Latest news
- Call-to-action

### About
- Company values
- Timeline/Journey
- Team members

### Products
- Grid/List view toggle
- Category filtering
- Search functionality
- Product cards

### News
- Featured article
- Category filtering
- Article grid

### Contact
- Contact form
- Contact information
- Map placeholder

## 🛠️ Development

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

## 🔌 API Integration

The template expects the following API endpoints:

- `GET /api/v1/theme/config` - Theme configuration
- `GET /api/v1/site/config` - Site information (name, contact, social)

If APIs are unavailable, the template falls back to default configuration.

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Optimized for all screen sizes

## 🎯 Performance

- Lazy loading support ready
- Optimized bundle size
- Smooth scroll animations
- Hardware-accelerated transitions

## 📝 License

MIT License
