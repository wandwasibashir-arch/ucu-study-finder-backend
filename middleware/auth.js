const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    
    const authHeader = req.header('Authorization');
    
    
    const token = authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader); 

    if (!token) {
        console.log("❌ Auth Middleware: No token provided");
        return res.status(401).json({ msg: "Access Denied: No token provided" });
    }

    try {
        const secret = process.env.JWT_SECRET || 'secret123';
        
        
        const decoded = jwt.verify(token, secret);
        
        
        
        req.user = decoded; 
        
        console.log(`✅ User Authenticated: ID ${req.user.id}`);
        next(); 
    } catch (err) {
        console.error("❌ JWT Verification Error:", err.message);
        res.status(401).json({ msg: "Token is not valid or has expired" });
    }
};


module.exports = verifyToken;
