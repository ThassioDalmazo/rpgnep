import express from "express";
import { createServer as createViteServer } from "vite";
import http from "http";
import fs from "fs";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);
  
  // Socket.IO REMOVIDO para evitar erros de WebSocket no servidor

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Rota para listar texturas locais
  app.get("/api/assets/creatures", (req, res) => {
    const creaturesPath = path.join(process.cwd(), "public", "textures", "creatures");
    
    if (!fs.existsSync(creaturesPath)) {
      return res.json([]);
    }

    try {
      const files = fs.readdirSync(creaturesPath);
      const images = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
      ).map(file => `/textures/creatures/${file}`);
      
      res.json(images);
    } catch (error) {
      console.error("Erro ao ler pasta de criaturas:", error);
      res.status(500).json({ error: "Falha ao ler diretório" });
    }
  });

  // Rota para listar mapas locais
  app.get("/api/assets/maps", (req, res) => {
    const mapsPath = path.join(process.cwd(), "public", "textures", "mapas");
    
    if (!fs.existsSync(mapsPath)) {
      // Tentar criar a pasta se não existir para facilitar a vida do usuário
      try {
        fs.mkdirSync(mapsPath, { recursive: true });
        return res.json([]);
      } catch (err) {
        return res.json([]);
      }
    }

    try {
      const files = fs.readdirSync(mapsPath);
      const images = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
      ).map(file => `/textures/mapas/${file}`);
      
      res.json(images);
    } catch (error) {
      console.error("Erro ao ler pasta de mapas:", error);
      res.status(500).json({ error: "Falha ao ler diretório" });
    }
  });

  // Room state storage (Mantido apenas para compatibilidade de rotas se necessário, mas sem Socket.IO)
  const rooms: Record<string, any> = {};
  const roomUsers: Record<string, { id: string, name: string, isDM: boolean }[]> = {};

  // Lógica de Socket.IO removida

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const path = await import('path');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
