import jwt from "jsonwebtoken";

const authAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const tokenParts = authHeader.split(" ");
        if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
            return res.status(401).json({ message: "Unauthorized: Invalid token format" });
        }

        const token = tokenParts[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded Token:", decoded); // Debugging

        if (decoded.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        req.admin = decoded;
        next();

    } catch (error) {
        return res.status(401).json({ message: "User not authenticated. Please log in again." });
    }
};

export default authAdmin;
