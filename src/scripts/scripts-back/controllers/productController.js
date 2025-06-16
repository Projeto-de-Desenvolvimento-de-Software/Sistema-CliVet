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

export const getProductById = async (req, res) => {
    const { idProduto } = req.params;

    try {
        const [rows] = await pool.query("SELECT * FROM Produto WHERE idProduto = ?", [idProduto]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Erro ao buscar Produto por ID:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const getProductsByCategory = async (req, res) => {
  const { categoriaProduto } = req.query;

  try {
    const [rows] = await pool.query(
      "SELECT idProduto, nomeProduto FROM Produto WHERE categoriaProduto = ?",
      [categoriaProduto]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Nenhum produto encontrado para esta categoria." });
    }

    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar produtos por categoria:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const renderProducts = async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM Produto");
    res.json(rows)
};

export const searchProducts = async (req, res) => {
    const { nomeProduto } = req.query;
        const [produto] = await pool.query(
            "SELECT * FROM Produto WHERE nomeProduto LIKE ?", 
            [`%${nomeProduto}%`]
        );

        if (produto.length === 0) {
            return res.status(404).json({ error: "Nenhum Produto encontrado."})
        }
        res.json(produto);
};

export const updateProduct = async (req, res) => {
    const { idProduto } = req.params;
    const { nomeProduto, descricaoProduto, categoriaProduto, precoProduto } = req.body;

    const [currentProduct] = await pool.query("SELECT * FROM Produto WHERE idProduto = ?", [idProduto]);
    if (currentProduct.length === 0) {
        return res.status(404).json({ error: "Produto não encontrado." });
    } else if (
        currentProduct[0].nomeProduto === nomeProduto &&
        currentProduct[0].descricaoProduto === descricaoProduto &&
        currentProduct[0].categoriaProduto === categoriaProduto &&
        currentProduct[0].precoProduto === precoProduto
    ) {
        return res.status(200).json({ message: "Nenhuma alteração foi feita." });
    }

    const [rows] = await pool.query("SELECT * FROM Produto WHERE nomeProduto = ? AND categoriaProduto = ? AND idProduto != ?",
    [nomeProduto, categoriaProduto, idProduto]);

    if (rows.length > 0) {
        return res.status(400).json({ error: "Produto já está cadastrado." });
    }

    await pool.query(
        "UPDATE Produto SET nomeProduto = ?, descricaoProduto = ?, categoriaProduto = ?, precoProduto = ? WHERE idProduto = ?",
        [nomeProduto, descricaoProduto, categoriaProduto, precoProduto, idProduto]
    );

    res.status(200).json({ message: "Produto atualizado com sucesso!" });
};

export const deleteProduct = async (req, res) => {
    const { idProduto } = req.params;
    const [result] = await pool.query("DELETE FROM Produto WHERE idProduto = ?", [idProduto]);
  
    if (result.affectedRows === 1) {
      res.json({ message: "Produto deletado!" });
    } else {
      res.status(404).json({ error: "Produto não encontrado." });
    }
};