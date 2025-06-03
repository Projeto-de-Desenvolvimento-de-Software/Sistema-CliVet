import { pool } from "../services/db.js";

export const createProduct = async (req, res) => {
    const { nomeProduto, descricaoProduto, categoriaProduto, precoProduto } = req.body;
    const newProduct = { nomeProduto, descricaoProduto, categoriaProduto, precoProduto };

     const [rows] = await pool.query("SELECT * FROM Produto WHERE nomeProduto = ? AND categoriaProduto = ?",
    [nomeProduto, categoriaProduto]);

    if (rows.length > 0) {
        return res.status(400).json({ error: "Produto já está cadastrado." });
    } else {

    await pool.query("INSERT INTO Produto SET ?", [newProduct]);
    return res.status(201).json({ message: "Produto salvo com sucesso!", product: newProduct});  
    }
};