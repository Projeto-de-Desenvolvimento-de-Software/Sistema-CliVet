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

export const getStockById = async (req, res) => {
    const { idEstoque } = req.params;

    try {
          const [rows] = await pool.query(`
            SELECT 
              e.idEstoque,
              e.quantidade,
              e.dataEntrada,
              e.validade,
              p.idProduto,
              p.nomeProduto,
              p.categoriaProduto
            FROM Estoque e
            JOIN Produto p ON e.fk_Produto_idProduto = p.idProduto
            WHERE e.idEstoque = ?
        `, [idEstoque]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Estoque não encontrado." });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Erro ao buscar Estoque por ID:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const renderStock = async (req, res) => {
  try {
    const [estoque] = await pool.query(`
      SELECT 
        e.idEstoque,
        p.nomeProduto,
        p.descricaoProduto,
        e.quantidade,
        e.dataEntrada,
        e.validade
      FROM Estoque e
      JOIN Produto p ON e.fk_Produto_idProduto = p.idProduto
    `);

    if (estoque.length === 0) {
      return res.status(404).json({ message: "Nenhum produto cadastrado no estoque." });
    }

    return res.status(200).json(estoque);
  } catch (error) {
    console.error("Erro ao buscar o estoque:", error);
    return res.status(500).json({ error: "Erro ao buscar o estoque." });
  }
};


export const searchStock = async (req, res) => {
  const { pesquisa = "" } = req.query;

  try {
    const [estoque] = await pool.query(`
      SELECT 
        p.nomeProduto,
        p.descricaoProduto,
        p.categoriaProduto,
        e.quantidade,
        e.dataEntrada,
        e.validade,
        e.idEstoque
      FROM Estoque e
      JOIN Produto p ON e.fk_Produto_idProduto = p.idProduto
      WHERE p.nomeProduto LIKE ? OR p.categoriaProduto LIKE ?
    `, [`%${pesquisa}%`, `%${pesquisa}%`]);

    res.json(estoque);
  } catch (error) {
    console.error("Erro ao pesquisar estoque:", error);
    res.status(500).json({ error: "Erro ao pesquisar o estoque." });
  }
};

export const updateStock = async (req, res) => {
    const { idEstoque } = req.params;
    const { quantidade, dataEntrada, validade } = req.body;

    try {
        const [currentStock] = await pool.query("SELECT * FROM Estoque WHERE idEstoque = ?", [idEstoque]);

        if (currentStock.length === 0) {
            return res.status(404).json({ error: "Estoque não encontrado." });
        }

        if (
            currentStock[0].quantidade == quantidade &&
            currentStock[0].dataEntrada.toISOString().slice(0, 10) === dataEntrada &&
            currentStock[0].validade.toISOString().slice(0, 10) === validade
        ) {
            return res.status(200).json({ message: "Nenhuma alteração foi feita." });
        }

        await pool.query(
            "UPDATE Estoque SET quantidade = ?, dataEntrada = ?, validade = ? WHERE idEstoque = ?",
            [quantidade, dataEntrada, validade, idEstoque]
        );

        return res.status(200).json({ message: "Estoque atualizado com sucesso!" });

    } catch (error) {
        console.error("Erro ao atualizar o estoque:", error);
        return res.status(500).json({ error: "Erro ao atualizar o estoque." });
    }
};

export const deleteStock = async (req, res) => {
    const { idEstoque } = req.params;
    const [result] = await pool.query("DELETE FROM Estoque WHERE idEstoque = ?", [idEstoque]);
  
    if (result.affectedRows === 1) {
      res.json({ message: "Estoque deletado!" });
    } else {
      res.status(404).json({ error: "Estoque não encontrado." });
    }
};