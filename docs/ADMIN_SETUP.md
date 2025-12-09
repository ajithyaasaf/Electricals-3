# Admin Setup Instructions

## Create Admin Login Credentials

### Firebase Console Method
1. Go to https://console.firebase.google.com/
2. Select your CopperBear project
3. Click "Authentication" → "Users" tab
4. Click "Add user"
5. Enter:
   - Email: `admin@copperbear.com`
   - Password: [Your secure password - minimum 8 characters]
6. Click "Add user"

## Access Admin Panel
1. Go to `/admin` on your website
2. Enter the admin credentials you created
3. You'll see the admin dashboard with:
   - Dashboard overview
   - Products management
   - Services management
   - Categories management
   - Orders management
   - Bookings management

## Security Notes
- Only users with email `admin@copperbear.com` can access the admin panel
- The admin authentication is separate from regular user accounts
- Admin sessions are managed securely through Firebase Auth
- You can create multiple admin users by adding more users with the admin email pattern in Firebase Console

## Admin Features
✅ Secure separate authentication
✅ Professional admin login interface
✅ Complete product and service management
✅ Order and booking oversight
✅ Secure logout functionality
✅ Session management