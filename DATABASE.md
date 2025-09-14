# Database Setup - MongoDB

This application is now configured to use MongoDB as the database instead of Prisma with PostgreSQL.

## Setup Steps

### 1. Install MongoDB Dependencies

```bash
npm install mongodb mongoose
# or
npm install @types/mongodb --save-dev  # if using TypeScript with native MongoDB driver
```

### 2. Environment Variables

Update your `.env` file with your MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/school-portal
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school-portal?retryWrites=true&w=majority
```

### 3. Database Connection

Create a new database connection file at `lib/mongodb.ts`:

```typescript
import { MongoClient } from 'mongodb';
// or if using Mongoose:
// import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function connectToDatabase() {
  try {
    await client.connect();
    return client.db();
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}
```

### 4. Database Schema

Define your collections and schemas according to your application needs. The current data structure from `lib/data.ts` includes:

- **students**: Student records with attendance, fees, and marks
- **teachers**: Teacher information and credentials  
- **classes**: Class information with subjects and fee structure
- **notices**: School notices and announcements
- **exams**: Exam records and results
- **classTimetables**: Class scheduling information

### 5. Migration from Local Data

The application currently uses local data from `lib/data.ts`. You can use this as a reference for your MongoDB document structure and create migration scripts to populate your database.

## Current Status

✅ Prisma completely removed from codebase  
✅ All Prisma dependencies uninstalled  
✅ Environment variables updated  
✅ Application builds successfully  
⏳ MongoDB integration ready to implement  

## Next Steps

1. Choose your MongoDB setup (local installation or MongoDB Atlas)
2. Install MongoDB dependencies
3. Create database connection utilities
4. Update data access layer to use MongoDB
5. Migrate existing data structure to MongoDB collections
