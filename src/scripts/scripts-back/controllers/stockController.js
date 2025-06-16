import { pool } from "../services/db.js";


export const createStock = async (req, res) => {
  const { quantidade, dataEntrada, validade, idProduto } = req.body;

  const [produtos] = await pool.query("SELECT * FROM Produto WHERE idProduto = ? ", [idProduto]);

  if (produtos.length === 0) {
    return res.status(404).json({ error: "Produto não encontrado para adicionar ao estoque." });
  }

  const [stockExists] = await pool.query(
    "SELECT * FROM Estoque WHERE fk_Produto_idProduto = ?",
    [idProduto]
  );

  if (stockExists.length > 0) {
    return res.status(400).json({ error: "Este produto já está cadastrado no estoque." });
  }
  await pool.query(
    "INSERT INTO Estoque (quantidade, dataEntrada, validade, fk_Produto_idProduto) VALUES (?, ?, ?, ?)",
    [quantidade, dataEntrada, validade, idProduto]
  );

  return res.status(201).json({ message: "Produto adicionado ao estoque com sucesso!" });
};
