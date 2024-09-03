"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const app = (0, express_1.default)();
const port = 3000;
const prisma = new client_1.PrismaClient();
// Middleware to parse JSON bodies
app.use(express_1.default.json());
// Middleware function
const checkLogin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token is missing or invalid' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
// Define the validation schema using zod
const signupSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, { message: 'Username is required' }),
    email: zod_1.z.string().email({ message: 'Invalid email address' }),
    password: zod_1.z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    avatar: zod_1.z.string().url().optional()
});
const signinSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: 'Invalid email address' }),
    password: zod_1.z.string().min(6, { message: 'Password must be at least 6 characters long' })
});
// Create Listing Schema
const createListingSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    address: zod_1.z.string(),
    regularPrice: zod_1.z.number(),
    discountPrice: zod_1.z.number(),
    bathrooms: zod_1.z.number(),
    bedrooms: zod_1.z.number(),
    furnished: zod_1.z.boolean(),
    parking: zod_1.z.boolean(),
    type: zod_1.z.string(),
    offer: zod_1.z.boolean(),
    imageUrls: zod_1.z.array(zod_1.z.string().url()),
    userId: zod_1.z.number(),
});
// Update Listing Schema
const updateListingSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    regularPrice: zod_1.z.number().optional(),
    discountPrice: zod_1.z.number().optional(),
    bathrooms: zod_1.z.number().optional(),
    bedrooms: zod_1.z.number().optional(),
    furnished: zod_1.z.boolean().optional(),
    parking: zod_1.z.boolean().optional(),
    type: zod_1.z.string().optional(),
    offer: zod_1.z.boolean().optional(),
    imageUrls: zod_1.z.array(zod_1.z.string().url()).optional(),
});
// Your JWT secret
const JWT_SECRET = process.env.JWT_SECRET;
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body
        const validatedData = signupSchema.parse(req.body);
        const { username, email, password, avatar } = validatedData;
        // Check if the user already exists
        const existingUser = yield prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create a new user
        const user = yield prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                avatar: avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            },
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, // Payload
        JWT_SECRET, // Secret key
        { expiresIn: '1h' } // Token expiration time
        );
        // Send success response with token
        res.status(201).json({ message: 'User created successfully', user, token });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            // Handle validation errors
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
app.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body
        const validatedData = signinSchema.parse(req.body);
        const { email, password } = validatedData;
        // Check if the user exists
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Check if the password is correct
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, // Payload
        JWT_SECRET, // Secret key
        { expiresIn: '1h' } // Token expiration time
        );
        // Send success response with token
        res.status(200).json({ message: 'Signin successful', user, token });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            // Handle validation errors
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Update user details
app.put('/user', checkLogin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { username, email, avatar } = req.body;
        // Validate input using Zod
        const updateSchema = zod_1.z.object({
            username: zod_1.z.string().min(1).optional(),
            email: zod_1.z.string().email().optional(),
            avatar: zod_1.z.string().url().optional(),
        });
        const validatedData = updateSchema.parse(req.body);
        const userId = parseInt((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, 10);
        // Update the user in the database
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: validatedData,
        });
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            // Handle validation errors
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Delete user
app.delete('/user', checkLogin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        // Delete the user from the database
        const userId = parseInt((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId, 10);
        yield prisma.user.delete({
            where: { id: userId },
        });
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Signout (invalidate token)
app.post('/signout', checkLogin, (req, res) => {
    try {
        // Invalidate the token on the client side by removing it
        res.status(200).json({ message: 'Signout successful' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Create Listing Route
app.post('/listing', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = createListingSchema.parse(req.body);
        const listing = yield prisma.listing.create({
            data: validatedData,
        });
        res.status(201).json({ message: 'Listing created successfully', listing });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Update Listing Route
app.put('/listing/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = updateListingSchema.parse(Object.assign({ id: parseInt(req.params.id, 10) }, req.body));
        const listing = yield prisma.listing.update({
            where: { id: validatedData.id },
            data: validatedData,
        });
        res.status(200).json({ message: 'Listing updated successfully', listing });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Delete Listing Route
app.delete('/listing/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listingId = parseInt(req.params.id, 10);
        yield prisma.listing.delete({
            where: { id: listingId },
        });
        res.status(200).json({ message: 'Listing deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
app.get('/listings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listings = yield prisma.listing.findMany();
        res.status(200).json({ listings });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
app.get('/my-listings', checkLogin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const userId = Number((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
        const listings = yield prisma.listing.findMany({
            where: {
                userId: userId,
            },
        });
        res.status(200).json({ listings });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
app.delete('/my-listings/:id', checkLogin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const userId = Number((_d = req.user) === null || _d === void 0 ? void 0 : _d.userId);
        const { id } = req.params;
        const listingId = Number(id);
        // Find the listing
        const listing = yield prisma.listing.findUnique({
            where: { id: listingId }, // Convert to number
        });
        // Check if the listing belongs to the logged-in user
        if ((listing === null || listing === void 0 ? void 0 : listing.userId) !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this listing' });
        }
        // Delete the listing
        yield prisma.listing.delete({
            where: { id: listingId }, // Convert to number
        });
        res.status(200).json({ message: 'Listing deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
app.put('/my-listings/:id', checkLogin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const userId = Number((_e = req.user) === null || _e === void 0 ? void 0 : _e.userId);
        const { id } = req.params;
        const listingId = Number(id);
        // Find the listing
        const listing = yield prisma.listing.findUnique({
            where: { id: listingId }, // Convert to number
        });
        // Check if the listing belongs to the logged-in user
        if ((listing === null || listing === void 0 ? void 0 : listing.userId) !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this listing' });
        }
        // Update the listing
        const updatedListing = yield prisma.listing.update({
            where: { id: listingId }, // Convert to number
            data: req.body, // Assuming body contains the updated fields
        });
        res.status(200).json({ message: 'Listing updated successfully', updatedListing });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
