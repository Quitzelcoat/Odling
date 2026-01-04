# Odling

A modern, full-stack social media application built as a capstone project for The Odin Project curriculum. Odling enables users to connect, share posts, and build their social networks with an intuitive, user-friendly interface.

## Live Demo

[Add your deployed link here]

---

## Features

### Core Functionality

- **User Authentication**: Secure sign-up and login using Passport.js with JWT token-based authentication
- **Guest Access**: Test the app without creating an account
- **Post Creation**: Share text and image posts with other users
- **Interactions**: Like and comment on posts from users you follow
- **Follow System**: Send follow requests, accept or reject requests, and manage your followers and following lists
- **User Profiles**: Customize your profile with profile pictures, bio, name, and personal information
- **Notifications**: Real-time alerts for follow requests, accepted follows, likes, and comments
- **User Discovery**: Browse all users, search by username, and view public profiles
- **Image Upload**: Upload profile pictures and post images using cloud storage integration

### Implemented Features (Completed)

✓ User signup and login with JWT authentication  
✓ Post creation (text and images)  
✓ Like and comment system with notifications  
✓ Follow/unfollow with request management  
✓ User profile pages with bio and profile pictures  
✓ Edit profile information (username, email, name, bio)  
✓ Feed page showing posts from followed users  
✓ Notification sidebar for requests and interactions  
✓ User discovery and search functionality  
✓ Image uploads (profile photos and post images)  
✓ Guest user login

---

## Tech Stack

### Frontend

- **Framework**: React
- **Styling**: CSS3 with animations and responsive design
- **State Management**: [Your state management choice - Redux/Context API/etc.]
- **HTTP Client**: Axios
- **Additional Libraries**: [List any other libraries you used]

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: Passport.js with JWT
- **Image Storage**: Cloudinary / Supabase

---

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Cloudinary account (for image uploads)

### Backend Setup

1. Clone the repository:

```bash
git clone https://github.com/Quitzelcoat/Odling
cd odling/backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend root directory:

```
DATABASE_URL=postgresql://username:password@localhost:5432/messenger_app
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

4. Set up the PostgreSQL database:

```bash
npx prisma migrate dev --name init
```

This command will:

- Create the PostgreSQL database
- Run all migrations
- Generate Prisma client

5. (Optional) Seed the database with sample data:

```bash
npx prisma db seed
```

6. Start the backend server:

```bash
npm start
```

The backend server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend root directory:

```
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development server:

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Key Pages & Components

### Home Page

- Landing page with modern design and interactive mobile mockup
- Featured typography and design elements
- Login and signup buttons
- Dark/Light mode toggle

### Feed Page

- Posts from users you follow
- Sidebar with navigation menu
- Right sidebar with recommended users to follow
- Like and comment functionality on each post

### User Profile

- User information (name, username, bio, profile picture)
- All posts created by the user
- Followers and following lists
- Edit profile button (for your own profile)

### User Discovery

- Browse all users on the platform
- Search users by username
- Follow buttons with request status indicators
- View public user profiles

### Create Post

- Modal for writing new posts
- Option to upload images
- Text editor for post content

### Notifications

- Sidebar showing all notifications
- Follow requests with accept/reject buttons
- Like and comment notifications
- Mark as read functionality

---

---

## Design System

### Color Palette

| Color       | Hex Code  | Usage                |
| ----------- | --------- | -------------------- |
| Dark Navy   | `#1E212B` | Primary background   |
| Medium Gray | `#6E747B` | Secondary text       |
| Light Gray  | `#AEBAB1` | Borders and dividers |
| Beige       | `#D8CFC7` | Accent elements      |
| Off-White   | `#F5F4F2` | Light backgrounds    |

The design implements a dark/light mode toggle, with the color palette reversed in light mode for optimal contrast and user experience.

### Design Features

- Clean, minimalist interface
- Smooth animations and transitions
- Responsive design for mobile and desktop
- Dark/light mode support
- Intuitive navigation

---

## Future Enhancements

- [ ] Direct messaging between users
- [ ] User-generated collections or boards
- [ ] Advanced feed filtering and sorting
- [ ] Post sharing and reposting
- [ ] User blocking functionality
- [ ] Hashtags and trending topics
- [ ] Video uploads
- [ ] Real-time notifications using WebSockets
- [ ] User recommendations algorithm
- [ ] Progressive Web App (PWA) capabilities

---

## Learning Outcomes

This project demonstrates proficiency in:

- Full-stack web development (MERN stack)
- User authentication and authorization
- RESTful API design and implementation
- Database design and management
- Frontend state management
- Responsive UI/UX design
- Real-world application architecture
- Version control with Git
- Deployment and DevOps basics

---

## How to Use

### As a Regular User

1. Click "Sign Up" to create a new account
2. Fill in your information (username, email, password, name, bio, etc.)
3. Log in with your credentials
4. Start exploring! Create posts, follow users, and interact with content
5. Visit your profile to customize your information and profile picture

### As a Guest

1. Click "Login as Guest" on the home page
2. Browse the app with limited functionality
3. Explore posts and user profiles without creating an account

---

## Credits

This project was built as a capstone project for **The Odin Project** curriculum, which is an excellent free resource for learning web development.

- **The Odin Project**: https://www.theodinproject.com/

---

## License

This project is open source and available under the MIT License.

---

## Contact & Portfolio

This project is part of my portfolio and demonstrates my full-stack development capabilities.

- **GitHub**: https://github.com/Quitzelcoat/Odling
- **Portfolio**: [Your portfolio website]
- **Email**: haris76689@gmail.com

---

## Troubleshooting

### Common Issues

**PostgreSQL Connection Failed**

- Ensure PostgreSQL is running on your system
- Verify your `DATABASE_URL` in `.env` is correct
- Check that the database user has proper permissions

**Image Upload Not Working**

- Verify Cloudinary credentials in `.env`
- Check that image file size is under 5MB
- Ensure the image format is supported (JPG, PNG, etc.)

**Port Already in Use**

- Change the `PORT` in your backend `.env` file
- Or kill the process using the port: `lsof -ti:5000 | xargs kill -9`

**CORS Errors**

- Ensure your backend `CORS` configuration includes your frontend URL
- Check that both frontend and backend are running

For additional help, please open an issue on the GitHub repository.

---

**Last Updated**: January 2026
