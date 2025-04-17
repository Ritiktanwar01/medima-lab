import jwt from "jsonwebtoken"

export async function verifyToken(request) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded || !decoded.id) {
      return null
    }

    return decoded
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}
