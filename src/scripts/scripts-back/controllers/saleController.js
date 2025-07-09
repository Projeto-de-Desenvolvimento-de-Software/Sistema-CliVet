import { pool } from "../services/db.js";

export const createSale = async (req, res) => {
  const { idCliente, idProduto, quantidadeVendida, dataVenda } = req.body;

  try {
    const [clients] = await pool.query("SELECT * FROM Cliente WHERE idCliente = ?", [idCliente]);
    if (clients.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    const [products] = await pool.query("SELECT * FROM Produto WHERE idProduto = ?", [idProduto]);
    if (products.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    const precoUnitario = products[0].precoProduto;

    const [stock] = await pool.query(
      "SELECT * FROM Estoque WHERE fk_Produto_idProduto = ?",
      [idProduto]
    );

    if (stock.length === 0) {
      return res.status(400).json({ error: "Produto não cadastrado no estoque." });
    }

    const stockQuant = stock[0].quantidade;

    if (stockQuant < quantidadeVendida) {
      return res.status(400).json({ error: "Estoque insuficiente para a venda." });
    }

    const valorTotal = precoUnitario * quantidadeVendida;

    const [vendaResult] = await pool.query(
      "INSERT INTO Venda (dataVenda, valorTotal, fk_Cliente_idCliente) VALUES (?, ?, ?)",
      [dataVenda, valorTotal, idCliente]
    );

    const idVenda = vendaResult.insertId;

    await pool.query(
      "INSERT INTO Itens_Venda (fk_Venda_idVenda, fk_Produto_idProduto, precoUnitario, quantidade) VALUES (?, ?, ?, ?)",
      [idVenda, idProduto, precoUnitario, quantidadeVendida]
    );

    const newQuant = stockQuant - quantidadeVendida;

    if (newQuant > 0) {
      await pool.query(
        "UPDATE Estoque SET quantidade = ? WHERE fk_Produto_idProduto = ?",
        [newQuant, idProduto]
      );
    } else {
      await pool.query(
        "DELETE FROM Estoque WHERE fk_Produto_idProduto = ?",
        [idProduto]
      );
    }

    return res.status(201).json({
      message: "Venda realizada com sucesso.",
      venda: { idVenda, dataVenda, idCliente, idProduto, precoUnitario, quantidadeVendida, valorTotal }
    });
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
};


export const getSaleById = async (req, res) => {
    const { idVenda } = req.params;

    try {
        const [rows] = await pool.query(`
            SELECT 
            v.idVenda, v.dataVenda, v.valorTotal,
            c.idCliente, COALESCE(c.nome, 'Cliente Removido') AS nome, c.email,
            p.idProduto, p.nomeProduto, p.categoriaProduto, 
            iv.precoUnitario, iv.quantidade
          FROM Venda v
          LEFT JOIN Cliente c ON v.fk_Cliente_idCliente = c.idCliente
          JOIN Itens_Venda iv ON iv.fk_Venda_idVenda = v.idVenda
          LEFT JOIN Produto p ON iv.fk_Produto_idProduto = p.idProduto
          WHERE v.idVenda = ?
        `, [idVenda]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Venda não encontrada." });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Erro ao buscar venda por ID:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const renderSale = async (req, res) => {
  try {
    const [sales] = await pool.query(`
     SELECT 
        v.idVenda, v.dataVenda, v.valorTotal,
        c.idCliente, COALESCE(c.nome, 'Cliente Removido') AS nome, c.email,
        COALESCE(p.idProduto, NULL) AS idProduto,
        COALESCE(p.nomeProduto, 'Produto removido') AS nomeProduto,
        iv.precoUnitario, iv.quantidade
      FROM Venda v
      LEFT JOIN Cliente c ON v.fk_Cliente_idCliente = c.idCliente
      JOIN Itens_Venda iv ON iv.fk_Venda_idVenda = v.idVenda
      LEFT JOIN Produto p ON iv.fk_Produto_idProduto = p.idProduto
    `);

    if (sales.length === 0) {
      return res.status(404).json({ message: "Nenhuma venda encontrada." });
    }

    return res.status(200).json(sales);
  } catch (error) {
    console.error("Erro ao buscar as vendas:", error);
    return res.status(500).json({ error: "Erro ao buscar as vendas." });
  }
};

export const searchSale = async (req, res) => {
  const { pesquisa = "" } = req.query;

  try {
    const [sales] = await pool.query(`
       SELECT 
        v.idVenda, v.dataVenda, v.valorTotal,
        c.idCliente, COALESCE(c.nome, 'Cliente Removido') AS nome, c.email,
        p.idProduto, IFNULL(p.nomeProduto, 'Produto removido') AS nomeProduto,
        iv.precoUnitario, iv.quantidade
      FROM Venda v
      LEFT JOIN Cliente c ON v.fk_Cliente_idCliente = c.idCliente
      JOIN Itens_Venda iv ON iv.fk_Venda_idVenda = v.idVenda
      LEFT JOIN Produto p ON iv.fk_Produto_idProduto = p.idProduto
      WHERE c.nome LIKE ? OR 
        IFNULL(p.nomeProduto, 'Produto removido') LIKE ? OR 
        DATE(v.dataVenda) LIKE ?`, 
        [`%${pesquisa}%`, `%${pesquisa}%`, `%${pesquisa}%`]);

    res.json(sales);
  } catch (error) {
    console.error("Erro ao pesquisar vendas:", error);
    res.status(500).json({ error: "Erro ao pesquisar vendas." });
  }
};

export const updateSale = async (req, res) => {
  const { idVenda } = req.params;
  let { idProduto, quantidadeVendida, idCliente, dataVenda } = req.body;

  try {
    const [saleItems] = await pool.query(
      "SELECT iv.fk_Produto_idProduto AS idProduto, iv.quantidade, iv.precoUnitario, v.dataVenda, v.fk_Cliente_idCliente AS idCliente " +
      "FROM Itens_Venda iv JOIN Venda v ON iv.fk_Venda_idVenda = v.idVenda WHERE iv.fk_Venda_idVenda = ?",
      [idVenda]
    );

    if (saleItems.length === 0) {
      return res.status(404).json({ error: "Venda não encontrada." });
    }

    const oldProductId = saleItems[0].idProduto;
    const oldQuantity = saleItems[0].quantidade;
    const oldPrice = saleItems[0].precoUnitario;
    const oldDate = saleItems[0].dataVenda.toISOString().slice(0, 10);
    const oldClientId = saleItems[0].idCliente;
    const idClienteNum = idCliente === null || idCliente === "null" ? null : Number(idCliente);
    const oldClientIdNum = oldClientId === null ? null : Number(oldClientId);

    if (
      Number(oldProductId) === Number(idProduto) &&
      Number(oldQuantity) === Number(quantidadeVendida) &&
      ((oldClientIdNum === null && idClienteNum === null) || oldClientIdNum === idClienteNum) &&
      oldDate === dataVenda
    ) {
      return res.status(200).json({ message: "Nenhuma alteração foi feita." });
    }

    if (idCliente === null || idCliente === "null" || idCliente === undefined) {
      idCliente = null;
    } else {
      idCliente = Number(idCliente);
    }

    const productChanged = Number(oldProductId) !== Number(idProduto);

    const [oldStockRows] = await pool.query(
      "SELECT quantidade FROM Estoque WHERE fk_Produto_idProduto = ?",
      [oldProductId]
    );
    const oldProductInStock = oldStockRows.length > 0;

    if (productChanged && !oldProductInStock) {
      return res.status(400).json({ error: "Não é possível alterar o produto da venda, pois o produto antigo foi removido." });
    }

    if (productChanged && oldProductInStock) {
      const updatedOldStockQty = oldStockRows[0].quantidade + oldQuantity;

      if (updatedOldStockQty > 0) {
        await pool.query(
          "UPDATE Estoque SET quantidade = ? WHERE fk_Produto_idProduto = ?",
          [updatedOldStockQty, oldProductId]
        );
      } else {
        await pool.query(
          "DELETE FROM Estoque WHERE fk_Produto_idProduto = ?",
          [oldProductId]
        );
      }
    }

    if (productChanged) {
      const [newProductRows] = await pool.query(
        "SELECT * FROM Produto WHERE idProduto = ?",
        [idProduto]
      );

      if (newProductRows.length === 0) {
        return res.status(404).json({ error: "Produto não encontrado." });
      }

      const newUnitPrice = newProductRows[0].precoProduto;

      const [newStockRows] = await pool.query(
        "SELECT quantidade FROM Estoque WHERE fk_Produto_idProduto = ?",
        [idProduto]
      );

      if (newStockRows.length === 0) {
        return res.status(400).json({ error: "Produto novo não cadastrado no estoque." });
      }

      if (newStockRows[0].quantidade < quantidadeVendida) {
        return res.status(400).json({ error: "Estoque insuficiente para a quantidade desejada." });
      }

      const updatedNewStockQty = newStockRows[0].quantidade - quantidadeVendida;

      if (updatedNewStockQty > 0) {
        await pool.query(
          "UPDATE Estoque SET quantidade = ? WHERE fk_Produto_idProduto = ?",
          [updatedNewStockQty, idProduto]
        );
      } else {
        await pool.query(
          "DELETE FROM Estoque WHERE fk_Produto_idProduto = ?",
          [idProduto]
        );
      }

      const totalValue = newUnitPrice * quantidadeVendida;

      await pool.query(
        "UPDATE Venda SET dataVenda = ?, valorTotal = ?, fk_Cliente_idCliente = ? WHERE idVenda = ?",
        [dataVenda, totalValue, idCliente, idVenda]
      );

      await pool.query(
        "UPDATE Itens_Venda SET fk_Produto_idProduto = ?, precoUnitario = ?, quantidade = ? WHERE fk_Venda_idVenda = ?",
        [idProduto, newUnitPrice, quantidadeVendida, idVenda]
      );

    } else {
      if (!oldProductInStock && Number(oldQuantity) !== Number(quantidadeVendida)) {
        return res.status(400).json({ error: "Não é possível alterar a quantidade, pois o produto foi removido do estoque." });
      }

      if (oldProductInStock) {
        const currentStockQty = oldStockRows[0].quantidade;
        const updatedStockQty = currentStockQty + oldQuantity - quantidadeVendida;

        if (updatedStockQty < 0) {
          return res.status(400).json({ error: "Estoque insuficiente para a quantidade desejada." });
        }

        if (updatedStockQty > 0) {
          await pool.query(
            "UPDATE Estoque SET quantidade = ? WHERE fk_Produto_idProduto = ?",
            [updatedStockQty, oldProductId]
          );
        } else {
          await pool.query(
            "DELETE FROM Estoque WHERE fk_Produto_idProduto = ?",
            [oldProductId]
          );
        }
      }

      const totalValue = oldPrice * quantidadeVendida;

      await pool.query(
        "UPDATE Venda SET dataVenda = ?, valorTotal = ?, fk_Cliente_idCliente = ? WHERE idVenda = ?",
        [dataVenda, totalValue, idCliente, idVenda]
      );

      await pool.query(
        "UPDATE Itens_Venda SET quantidade = ? WHERE fk_Venda_idVenda = ?",
        [quantidadeVendida, idVenda]
      );
    }

    return res.status(200).json({ message: "Venda atualizada com sucesso!" });

  } catch (error) {
    console.error("Erro ao atualizar venda:", error);
    return res.status(500).json({ error: "Erro ao atualizar venda." });
  }
};


export const deleteSale = async (req, res) => {
  const { idVenda } = req.params;

  try {
    const [saleItems] = await pool.query(
      "SELECT fk_Produto_idProduto AS idProduto, quantidade FROM Itens_Venda WHERE fk_Venda_idVenda = ?",
      [idVenda]
    );

    if (saleItems.length === 0) {
      return res.status(404).json({ error: "Venda não encontrada ou sem itens registrados." });
    }

    for (const item of saleItems) {
      const { idProduto, quantidade } = item;

      const [stockRows] = await pool.query(
        "SELECT quantidade FROM Estoque WHERE fk_Produto_idProduto = ?",
        [idProduto]
      );

      if (stockRows.length > 0) {
        const currentStockQty = stockRows[0].quantidade;
        const updatedStockQty = currentStockQty + quantidade;

        await pool.query(
          "UPDATE Estoque SET quantidade = ? WHERE fk_Produto_idProduto = ?",
          [updatedStockQty, idProduto]
        );
      } else {
        console.warn(`Produto ${idProduto} não encontrado no estoque, não foi possível devolver quantidade.`);
      }
    }

    await pool.query("DELETE FROM Itens_Venda WHERE fk_Venda_idVenda = ?", [idVenda]);

    const [result] = await pool.query("DELETE FROM Venda WHERE idVenda = ?", [idVenda]);

    if (result.affectedRows === 1) {
      res.json({ message: "Venda deletada e produtos devolvidos ao estoque!" });
    } else {
      res.status(404).json({ error: "Venda não encontrada." });
    }

  } catch (error) {
    console.error("Erro ao deletar venda:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};
