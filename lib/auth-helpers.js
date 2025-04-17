import jwt from "jsonwebtoken"

export async function verifyAdminToken(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
      return null
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded || !decoded.user_id || decoded.role !== "admin") {
      return null
    }

    return {
      id: decoded.user_id,
      username: decoded.username,
      role: decoded.role,
    }
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

export async function verifyJwtToken(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
      return null
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded || !decoded.user_id) {
      return null
    }

    return {
      id: decoded.user_id,
      username: decoded.username,
      role: decoded.role,
    }
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}
