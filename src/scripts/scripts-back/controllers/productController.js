import { pool } from "../services/db.js";

export const createProduct = async (req, res) => {
    const { nomeProduto, descricaoProduto, categoriaProduto, precoProduto } = req.body;
    const newProduct = { nomeProduto, descricaoProduto, categoriaProduto, precoProduto };

    await pool.query("INSERT INTO Produto SET ?", [newProduct]);
    return res.status(201).json({ message: "Produto salvo com sucesso!", product: newProduct});  
};