import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z, ZodError } from 'zod';
import cors from 'cors';




const app = express();
const port = 3000;
const prisma = new PrismaClient();

// Middleware to parse JSON bodies
app.use(express.json());

app.use(cors());app.use(cors({
  origin: 'http://localhost:5173',
}));

// Define the type for the JWT payload
interface JwtPayload {
  userId: string;
  email: string;
}

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
// Middleware function
const checkLogin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is missing or invalid' });
  }
  const token = authHeader.split(' ')[1]; 
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next(); 
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};


// Define the validation schema using zod
const signupSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  avatar: z.string().url().optional()
});
const signinSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' })
});


// Create Listing Schema
const createListingSchema = z.object({
  name: z.string(),
  description: z.string(),
  address: z.string(),
  regularPrice: z.number(),
  discountPrice: z.number(),
  bathrooms: z.number(),
  bedrooms: z.number(),
  furnished: z.boolean(),
  parking: z.boolean(),
  type: z.string(),
  offer: z.boolean(),
  imageUrls: z.array(z.string().url()),
  userId: z.number(),
});

// Update Listing Schema
const updateListingSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  regularPrice: z.number().optional(),
  discountPrice: z.number().optional(),
  bathrooms: z.number().optional(),
  bedrooms: z.number().optional(),
  furnished: z.boolean().optional(),
  parking: z.boolean().optional(),
  type: z.string().optional(),
  offer: z.boolean().optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

// Your JWT secret
const JWT_SECRET:any = process.env.JWT_SECRET;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.post('/signup', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = signupSchema.parse(req.body);

    const { username, email, password, avatar } = validatedData;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        avatar: avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: '1h' } // Token expiration time
    );

    // Send success response with token
    res.status(201).json({ message: 'User created successfully', user, token });
  } catch (error) {
    if (error instanceof ZodError) {
      // Handle validation errors
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/signin', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = signinSchema.parse(req.body);

    const { email, password } = validatedData;

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: '1h' } // Token expiration time
    );

    // Send success response with token
    res.status(200).json({ message: 'Signin successful', user, token });
  } catch (error) {
    if (error instanceof ZodError) {
      // Handle validation errors
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/user', checkLogin, async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.userId);

    // Fetch the user's details from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the user details as response
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user details
app.put('/user', checkLogin, async (req: Request, res: Response) => {
  try {
    const { username, email, avatar } = req.body;

    // Validate input using Zod
    const updateSchema = z.object({
      username: z.string().min(1).optional(),
      email: z.string().email().optional(),
      avatar: z.string().url().optional(),
    });

    const validatedData = updateSchema.parse(req.body);
    const userId = parseInt(req.user?.userId as string, 10);
    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
    });

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    if (error instanceof ZodError) {
      // Handle validation errors
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
app.delete('/user', checkLogin, async (req: Request, res: Response) => {
  try {
    // Delete the user from the database
    const userId = parseInt(req.user?.userId as string, 10);
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Signout (invalidate token)
app.post('/signout', checkLogin, (req: Request, res: Response) => {
  try {
    // Invalidate the token on the client side by removing it
    res.status(200).json({ message: 'Signout successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Listing Route
app.post('/listing', async (req: Request, res: Response) => {
  try {
    const validatedData = createListingSchema.parse(req.body);

    const listing = await prisma.listing.create({
      data: validatedData,
    });

    res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Listing Route
app.put('/listing/:id', async (req: Request, res: Response) => {
  try {
    const validatedData = updateListingSchema.parse({
      id: parseInt(req.params.id, 10),
      ...req.body,
    });

    const listing = await prisma.listing.update({
      where: { id: validatedData.id },
      data: validatedData,
    });

    res.status(200).json({ message: 'Listing updated successfully', listing });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Listing Route
app.delete('/listing/:id', async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.id, 10);

    await prisma.listing.delete({
      where: { id: listingId },
    });

    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/listings', async (req: Request, res: Response) => {
  try {
    const listings = await prisma.listing.findMany();
    res.status(200).json({ listings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/my-listings', checkLogin, async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.userId);

    const listings = await prisma.listing.findMany({
      where: {
        userId: userId,
      },
    });

    res.status(200).json({ listings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/my-listings/:id', checkLogin, async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.userId);
    const { id } = req.params;
    const listingId = Number(id);

    // Find the listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },  // Convert to number
    });

    // Check if the listing belongs to the logged-in user
    if (listing?.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this listing' });
    }

    // Delete the listing
    await prisma.listing.delete({
      where: { id: listingId },  // Convert to number
    });

    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/my-listings/:id', checkLogin, async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.userId);
    const { id } = req.params;
    const listingId = Number(id);

    // Find the listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },  // Convert to number
    });

    // Check if the listing belongs to the logged-in user
    if (listing?.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this listing' });
    }

    // Update the listing
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },  // Convert to number
      data: req.body, // Assuming body contains the updated fields
    });

    res.status(200).json({ message: 'Listing updated successfully', updatedListing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/listings/search', async (req: Request, res: Response) => {
  const { query } = req.query;

  try {
    const listings = await prisma.listing.findMany({
      where: {
        OR: [
          { name: { contains: query as string, mode: 'insensitive' } },
          { description: { contains: query as string, mode: 'insensitive' } },
          { address: { contains: query as string, mode: 'insensitive' } },
        ],
      },
    });

    res.status(200).json({ listings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
