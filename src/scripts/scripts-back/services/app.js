import express from "express";
import path    from "path";
import { fileURLToPath } from "url";

import { createClient, renderClients, getClientById, searchClients, updateClient, deleteClient } from "../controllers/clientController.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../../../../")));

app.use(express.urlencoded({ extended: true }));

app.get('/cliente', renderClients);
app.post("/cliente", createClient);
app.get("/cliente/:id", getClientById);
app.get("/buscar",  searchClients);
app.put("/cliente/editar/:id", updateClient);
app.delete("/cliente/:id", deleteClient);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});