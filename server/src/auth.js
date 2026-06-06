const jwt = require("jsonwebtoken");
const { query } = require("./db");

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      companyId: user.company_id,
      role: user.role,
      canViewFinancial: user.can_view_financial,
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" },
  );
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Token de acesso ausente." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { rows } = await query(
      `SELECT id, company_id, name, email, role, active, can_view_financial
       FROM users
       WHERE id = $1 AND active = true`,
      [payload.sub],
    );

    if (!rows[0]) {
      return res.status(401).json({ error: "Usuario invalido ou inativo." });
    }

    req.user = rows[0];
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token de acesso invalido." });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Perfil sem permissao para esta acao." });
    }

    return next();
  };
}

function allowFinancial(req, res, next) {
  if (req.user.role === "admin" || req.user.can_view_financial) {
    return next();
  }

  return res.status(403).json({ error: "Acesso financeiro restrito ao administrador." });
}

module.exports = {
  requireAuth,
  allowRoles,
  allowFinancial,
  signToken,
};
