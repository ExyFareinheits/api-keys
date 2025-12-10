# API Key Manager

Secure web application for managing API keys with Next.js

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
API_keys/
├── app/                 # Next.js App Router pages
│   ├── api/keys/       # API endpoints
│   ├── keys/           # Keys management page
│   ├── categories/     # Categories page
│   ├── settings/       # Settings page
│   └── page.tsx        # Dashboard
├── components/         # React components
├── data/              # JSON data storage
├── types/             # TypeScript definitions
├── utils/             # Utility functions
└── README.md
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Features

- ✅ Secure API key generation
- ✅ Category organization with colors
- ✅ Search and filtering
- ✅ Export/Import functionality
- ✅ Security settings
- ✅ Ukrainian language support
- ✅ Responsive design

## 🔒 Security

- Local storage only (no external servers)
- Optional key encryption
- Masked key display
- Secure random generation

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎯 Usage

1. **Create your first API key** from the dashboard
2. **Organize keys** into categories
3. **Manage settings** for security preferences
4. **Export/backup** your keys regularly

Enjoy secure API key management! 🔐