import express from "express";
import path    from "path";
import { fileURLToPath } from "url";

import { createClient, renderClients, getClientById, searchClients, updateClient, deleteClient } from "../controllers/clientController.js"
import { createProduct, getProductById, getProductsByCategory, renderProducts, searchProducts, updateProduct, deleteProduct } from "../controllers/productController.js";
import { createStock, renderStock, getStockById, searchStock, updateStock, deleteStock } from "../controllers/stockController.js";
import { createSale, renderSale, searchSale, getSaleById, updateSale, deleteSale } from "../controllers/saleController.js";

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

app.get('/produto', renderProducts);
app.post('/produto', createProduct);
app.get('/produto/:idProduto', getProductById);
app.get("/buscarProduto",  searchProducts);
app.put("/produto/editar/:idProduto", updateProduct);
app.delete("/produto/:idProduto", deleteProduct);
app.get('/buscarProdutoPorCategoria', getProductsByCategory);

app.get('/estoque', renderStock);
app.post('/estoque', createStock);
app.get('/estoque/:idEstoque', getStockById);
app.get('/buscarEstoque', searchStock);
app.put("/estoque/editar/:idEstoque", updateStock);
app.delete('/estoque/:idEstoque', deleteStock);

app.get('/venda', renderSale);
app.post('/venda', createSale);
app.get('/venda/:idVenda', getSaleById);
app.get('/buscarVenda', searchSale);
app.put("/venda/editar/:idVenda", updateSale);
app.delete('/venda/:idVenda', deleteSale);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});