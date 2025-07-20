# Insurance Customer Calling App

A React application for managing customer calls with CSV import functionality, built with Supabase authentication.

## Features

- **Multi-user Authentication**: Sign up and sign in with email/password using Supabase
- **CSV Import**: Upload customer data with required headers
- **Customer Management**: View and manage customer information
- **Calling Features**: 
  - Direct phone calls
  - SMS with default message
  - WhatsApp integration
- **Status Tracking**: Track call status (pending, called, completed)
- **Notes System**: Add notes for each customer
- **Data Persistence**: Data persists in localStorage after page refresh
- **Responsive Design**: Works on desktop and mobile devices

## Required CSV Headers

Your CSV file must include these headers:
- `ownerName`
- `phone_number`
- `vehicle_number`
- `model`
- `make`
- `reg_date`
- `vehicleInsuranceUpto`

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Tailwind CSS**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Usage

1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Upload CSV**: Click "Choose File" and select your CSV file
3. **Review Data**: Verify the imported customer data
4. **Make Calls**: Use the action buttons to:
   - 📞 Make a phone call
   - 💬 Send SMS
   - 📱 Send WhatsApp message
   - 📝 Add notes
5. **Track Progress**: Update call status using the dropdown menu

## Technology Stack

- **Frontend**: React 18
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **CSV Parsing**: Papa Parse
- **Routing**: React Router DOM

## File Structure

```
src/
├── components/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── CsvUpload.jsx
│   ├── CustomerList.jsx
│   └── PrivateRoute.jsx
├── contexts/
│   └── AuthContext.jsx
├── supabaseClient.jsx
├── App.jsx
├── index.jsx
└── index.css
```

## Supabase Configuration

The app is configured with the provided Supabase credentials:
- Project URL: https://ussrrfoyuclwtnkuwqzl.supabase.co
- API Key: [Configured in supabaseClient.jsx]

## Data Persistence

Customer data is stored in localStorage to persist across browser sessions. The data includes:
- Customer information from CSV
- Call status updates
- Notes for each customer

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Mobile Support

The app is fully responsive and works on mobile devices for:
- Viewing customer lists
- Making calls
- Sending SMS/WhatsApp messages
- Adding notes 