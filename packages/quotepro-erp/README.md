# QuotePro ERP - Professional Quotation & Tender Management System

A complete React + TypeScript prototype for an enterprise quotation and tender management system with professional UI design inspired by Salesforce, HubSpot, and Monday.com.

## Features

### 🎨 Professional Design System
- **Color Scheme**: Azul Corporativo (#0F4C81), Azul Claro (#3B82F6), Verde (#22C55E), Rojo (#EF4444), Naranja (#F59E0B), Gris Fondo (#F8FAFC)
- **Typography**: Inter font with weights 400, 500, 600, 700
- **Icons**: Lucide Icons
- **Styling**: 12px border radius, soft shadows, whitespace-heavy layout
- **Theme Support**: Light and dark mode with persistent storage

### 📦 Complete Component Library
- Buttons (multiple variants and sizes)
- Input fields with validation
- Cards with hover effects
- Alerts (success, error, warning, info)
- Badges (multiple variants)
- Select dropdowns
- Tabs with badge support
- Avatars with color coding
- Modals/Dialogs
- Pagination
- Data Tables with sorting
- Timeline component
- Sidebar navigation
- Header with theme toggle
- Responsive Layout

### 📱 Responsive Design
- Mobile-first approach
- Tablet optimized
- Desktop fully featured
- Mobile sidebar with hamburger menu

### 🔐 Multi-User System
- Authentication & authorization
- Protected routes
- User roles (admin, manager, user)
- Session management

### 📊 Core Modules

#### Dashboard
- KPI metrics with trend indicators
- Quote and tender overview
- Revenue tracking
- Conversion rate monitoring
- Interactive charts (Line, Bar)
- Recent activity feed
- Quick actions

#### Quotations
- Create and manage quotations
- Quote status tracking (draft, sent, pending, accepted, rejected)
- Client association
- Amount tracking
- Due date management
- Export functionality
- Search and filtering

#### Clients
- Client management interface
- Search and filter capabilities
- Contact information
- Company details
- Quote history per client
- Status tracking (active/inactive)

#### Products
- Product/service catalog
- Category management
- Pricing and stock tracking
- Grid and list view modes
- Product selection for quotations
- SKU management

#### Settings
- User profile management
- Language and timezone settings
- Notification preferences
- Security settings
- Theme customization
- Account management

### 🛠️ Technical Stack
- **React 18** with TypeScript
- **React Router v6** for navigation
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Recharts** for data visualization
- **Lucide React** for icons
- **Vite** for fast development and building

### 📁 Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
│   ├── auth/           # Login page
│   ├── dashboard/      # Dashboard
│   ├── quotations/     # Quotation management
│   ├── clients/        # Client management
│   ├── products/       # Product catalog
│   └── settings/       # Settings
├── hooks/              # Custom React hooks
│   ├── useTheme.tsx    # Theme management
│   ├── useForm.ts      # Form handling
│   └── useToast.tsx    # Toast notifications
├── store/              # Zustand stores
│   ├── auth.ts         # Authentication
│   └── data.ts         # Data management
├── types/              # TypeScript types
├── utils/              # Utility functions
├── constants/          # Design tokens
├── styles/             # Global styles
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Getting Started

### Prerequisites
- Node.js 16+ or 18+
- npm or yarn

### Installation

1. Navigate to the QuotePro package:
```bash
cd packages/quotepro-erp
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser to http://localhost:5173

### Build for Production

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Demo Credentials

- **Email**: demo@quotepro.com
- **Password**: password

## Design System Tokens

### Colors
- **Primary**: #0F4C81 (Azul Corporativo)
- **Light**: #3B82F6 (Azul Claro)
- **Success**: #22C55E (Verde)
- **Danger**: #EF4444 (Rojo)
- **Warning**: #F59E0B (Naranja)
- **Background**: #F8FAFC (Gris Fondo)

### Spacing
- 4xs: 2px
- 3xs: 4px
- 2xs: 6px
- xs: 8px
- sm: 12px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

### Border Radius
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 20px

### Shadows
- xs, sm, md, lg: Various elevation levels
- soft: 0 2px 8px rgba(0, 0, 0, 0.08)
- softer: 0 1px 4px rgba(0, 0, 0, 0.06)

## Component Usage Examples

### Button
```tsx
<Button variant="primary" size="md" fullWidth>
  Click me
</Button>
```

### Input
```tsx
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  icon={<Mail size={18} />}
/>
```

### Card
```tsx
<Card hover onClick={() => console.log('clicked')}>
  Content here
</Card>
```

### Table
```tsx
<Table
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ]}
  data={data}
  keyExtractor={(item) => item.id}
/>
```

### Modal
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Dialog Title"
  footer={<Button onClick={() => setIsOpen(false)}>Close</Button>}
>
  Modal content
</Modal>
```

## State Management

### Authentication
```tsx
import { useAuthStore } from '@store/auth'

const { user, login, logout, isAuthenticated } = useAuthStore()
```

### Data Management
```tsx
import { useQuotationStore, useClientStore } from '@store/data'

const { quotations, addQuotation } = useQuotationStore()
const { clients, addClient } = useClientStore()
```

### Theme
```tsx
import { useTheme } from '@hooks/useTheme'

const { theme, toggleTheme } = useTheme()
```

## Advanced Features (Ready to Implement)

1. **Quotation Builder**: Excel-like table editor with drag/drop and autocomplete
2. **Export to PDF**: Quote generation and export
3. **Email Integration**: Send quotes via email
4. **Activity Timeline**: Track all quote interactions
5. **File Attachments**: Attach files to quotes and clients
6. **Comments & Notes**: Collaborate on quotes
7. **Approval Workflows**: Multi-step approval process
8. **Analytics Dashboard**: Advanced reporting
9. **Mobile App**: React Native version
10. **API Integration**: Backend connectivity

## Production Checklist

- [ ] Replace demo authentication with real backend
- [ ] Implement API integration
- [ ] Add database persistence
- [ ] Set up CI/CD pipeline
- [ ] Implement error logging
- [ ] Add performance monitoring
- [ ] Set up environment variables
- [ ] Implement rate limiting
- [ ] Add comprehensive error handling
- [ ] Create API documentation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Support

For issues and feature requests, please create an issue in the repository.

## Roadmap

- v1.0: Core quotation and client management
- v1.1: Advanced reporting and analytics
- v1.2: Mobile app launch
- v1.3: API marketplace integration
- v2.0: AI-powered quote generation

---

Built with ❤️ for modern business operations.
