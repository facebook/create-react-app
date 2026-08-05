# QuotePro ERP - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Navigate to the Project
```bash
cd packages/quotepro-erp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The app will automatically open at `http://localhost:5173`

### 4. Login with Demo Credentials
- **Email**: demo@quotepro.com
- **Password**: password

## 📂 Project Highlights

### What You're Getting
- ✅ 15 Production-ready UI components
- ✅ 7 Complete screen pages
- ✅ Professional design system
- ✅ Light/Dark theme support
- ✅ Fully responsive design
- ✅ TypeScript for type safety
- ✅ State management with Zustand
- ✅ Form handling & validation
- ✅ Toast notifications
- ✅ Protected routes
- ✅ 42 source files (~6,000 lines)

## 🎯 Main Sections

### 📊 Dashboard
- KPI metrics with trends
- Interactive charts
- Recent activity
- Quick actions
- Located at: `/dashboard`

### 📝 Quotations
- Quote management
- Status tracking
- Search & filter
- Export options
- Located at: `/quotations`

### 👥 Clients
- Client list
- Contact management
- Search & filter
- Details modal
- Located at: `/clients`

### 📦 Products
- Product catalog
- Grid/List view toggle
- Category filter
- Stock tracking
- Located at: `/products`

### ⚙️ Settings
- Profile management
- Notifications
- Security settings
- Theme toggle
- Located at: `/settings`

### 🔐 Login
- Professional login page
- Email/password auth
- Remember me option
- Located at: `/login`

## 🛠️ Available Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 📁 Key Directories

```
src/
├── components/     # Reusable UI components
├── pages/         # Full page screens
├── hooks/         # Custom React hooks
├── store/         # Zustand state stores
├── utils/         # Helper functions
├── types/         # TypeScript definitions
├── constants/     # Design tokens
├── styles/        # Global styles
└── App.tsx        # Main app component
```

## 🎨 Using Components

### Button
```tsx
import { Button } from '@components/index'

<Button variant="primary" size="md">
  Click me
</Button>
```

### Input
```tsx
import { Input } from '@components/index'
import { Mail } from 'lucide-react'

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  icon={<Mail size={18} />}
/>
```

### Card
```tsx
import { Card } from '@components/index'

<Card hover>
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</Card>
```

### Table
```tsx
import { Table } from '@components/index'

<Table
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ]}
  data={items}
  keyExtractor={(item) => item.id}
/>
```

### Modal
```tsx
import { Modal, Button } from '@components/index'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Dialog Title"
  footer={<Button onClick={() => setIsOpen(false)}>Close</Button>}
>
  Modal content
</Modal>
```

## 🎯 State Management

### Authentication
```tsx
import { useAuthStore } from '@store/auth'

const { user, login, logout } = useAuthStore()
```

### Theme
```tsx
import { useTheme } from '@hooks/useTheme'

const { theme, toggleTheme } = useTheme()
```

### Forms
```tsx
import { useForm } from '@hooks/useForm'

const { getFieldProps, handleSubmit } = useForm({
  initialValues: { email: '' },
  onSubmit: (values) => console.log(values),
})
```

## 📊 Design Tokens

### Colors
- Primary: `#0F4C81`
- Light: `#3B82F6`
- Success: `#22C55E`
- Danger: `#EF4444`
- Warning: `#F59E0B`
- Background: `#F8FAFC`

### Spacing
Use `gap-md`, `p-lg`, `m-sm` etc. in Tailwind

### Typography
Inter font with 400, 500, 600, 700 weights

## 🔍 Development Tips

1. **Use path aliases** for clean imports:
   - `@components/Button`
   - `@pages/dashboard/DashboardPage`
   - `@hooks/useTheme`
   - `@store/auth`
   - `@utils/formatters`

2. **Dark mode testing**: Click the moon icon in header to toggle theme

3. **Responsive testing**: Use browser DevTools to test different screen sizes

4. **Component exploration**: Open any page to see components in action

5. **Form validation**: Check `src/utils/validators.ts` for validation functions

## 📱 Mobile Responsiveness

The app is fully responsive with:
- Mobile-first design
- Hamburger menu on small screens
- Touch-friendly buttons
- Optimized layouts for all sizes
- 4 breakpoints: sm, md, lg, xl

## 🚀 Next Steps

### For Development
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Make changes to components
4. Test in browser (hot reload enabled)

### For Production
1. Build: `npm run build`
2. Preview: `npm run preview`
3. Deploy to your hosting

### For Integration
1. Replace mock auth with real API
2. Connect to backend database
3. Implement real business logic
4. Add tests and CI/CD

## ❓ FAQ

**Q: How do I add a new page?**
A: Create a new file in `src/pages/`, create the component, and add a route in `App.tsx`

**Q: How do I add a new component?**
A: Create in `src/components/`, add to `src/components/index.ts`, and import where needed

**Q: How do I change colors?**
A: Edit `tailwind.config.js` in the `colors` section

**Q: How do I add API calls?**
A: Create API functions in `src/utils/` and call them in pages/hooks

**Q: How do I manage state?**
A: Use Zustand stores in `src/store/` for global state

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Lucide Icons](https://lucide.dev)
- [React Router Docs](https://reactrouter.com)

## 🆘 Need Help?

1. Check existing components in `src/components/`
2. Look at page examples in `src/pages/`
3. Review TypeScript definitions in `src/types/`
4. Check utility functions in `src/utils/`
5. Read inline code comments

---

**Happy Coding! 🎉**

Questions? Check the IMPLEMENTATION.md and README.md files for more details.
