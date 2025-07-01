import { pool } from "../services/db.js";

export const createSale = async (req, res) => {
    const { dataVenda, valorTotal, fk_Cliente_idCliente, itens } = req.body;
    
    // Validação dos dados obrigatórios
    if (!dataVenda || !valorTotal || !fk_Cliente_idCliente || !itens || itens.length === 0) {
        return res.status(400).json({ error: "Dados obrigatórios não fornecidos." });
    }

    try {
        // Verificar se o cliente existe
        const [clientRows] = await pool.query("SELECT * FROM Cliente WHERE idCliente = ?", [fk_Cliente_idCliente]);
        if (clientRows.length === 0) {
            return res.status(404).json({ error: "Cliente não encontrado." });
        }

        // Iniciar transação
        await pool.query("START TRANSACTION");

        // Inserir a venda
        const [saleResult] = await pool.query(
            "INSERT INTO Venda (dataVenda, valorTotal, fk_Cliente_idCliente) VALUES (?, ?, ?)",
            [dataVenda, valorTotal, fk_Cliente_idCliente]
        );

        const saleId = saleResult.insertId;

        // Inserir os itens da venda e atualizar estoque
        for (const item of itens) {
            const { fk_Produto_idProduto, precoUnitario, quantidade } = item;

            // Verificar se o produto existe
            const [productRows] = await pool.query("SELECT * FROM Produto WHERE idProduto = ?", [fk_Produto_idProduto]);
            if (productRows.length === 0) {
                await pool.query("ROLLBACK");
                return res.status(404).json({ error: `Produto com ID ${fk_Produto_idProduto} não encontrado.` });
            }

            // Verificar estoque disponível
            const [stockRows] = await pool.query(
                "SELECT SUM(quantidade) as totalEstoque FROM Estoque WHERE fk_Produto_idProduto = ?",
                [fk_Produto_idProduto]
            );

            const estoqueDisponivel = stockRows[0].totalEstoque || 0;
            if (estoqueDisponivel < quantidade) {
                await pool.query("ROLLBACK");
                return res.status(400).json({ 
                    error: `Estoque insuficiente para o produto ${productRows[0].nomeProduto}. Disponível: ${estoqueDisponivel}, Solicitado: ${quantidade}` 
                });
            }

            // Inserir item da venda
            await pool.query(
                "INSERT INTO Itens_Venda (fk_Venda_idVenda, fk_Produto_idProduto, precoUnitario, quantidade) VALUES (?, ?, ?, ?)",
                [saleId, fk_Produto_idProduto, precoUnitario, quantidade]
            );

            // Atualizar estoque (FIFO - First In, First Out)
            let quantidadeRestante = quantidade;
            const [estoqueItems] = await pool.query(
                "SELECT * FROM Estoque WHERE fk_Produto_idProduto = ? AND quantidade > 0 ORDER BY dataEntrada ASC",
                [fk_Produto_idProduto]
            );

            for (const estoqueItem of estoqueItems) {
                if (quantidadeRestante <= 0) break;

                if (estoqueItem.quantidade >= quantidadeRestante) {
                    // Este item de estoque é suficiente
                    await pool.query(
                        "UPDATE Estoque SET quantidade = quantidade - ? WHERE idEstoque = ?",
                        [quantidadeRestante, estoqueItem.idEstoque]
                    );
                    quantidadeRestante = 0;
                } else {
                    // Este item de estoque não é suficiente, usar tudo
                    quantidadeRestante -= estoqueItem.quantidade;
                    await pool.query(
                        "UPDATE Estoque SET quantidade = 0 WHERE idEstoque = ?",
                        [estoqueItem.idEstoque]
                    );
                }
            }
        }

        // Confirmar transação
        await pool.query("COMMIT");

        return res.status(201).json({ 
            message: "Venda criada com sucesso!", 
            saleId: saleId 
        });

    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Erro ao criar venda:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const getSaleById = async (req, res) => {
    const { id } = req.params;

    try {
        // Buscar dados da venda
        const [saleRows] = await pool.query(`
            SELECT v.*, c.nome as nomeCliente, c.email as emailCliente 
            FROM Venda v 
            JOIN Cliente c ON v.fk_Cliente_idCliente = c.idCliente 
            WHERE v.idVenda = ?
        `, [id]);

        if (saleRows.length === 0) {
            return res.status(404).json({ error: "Venda não encontrada." });
        }

        // Buscar itens da venda
        const [itemRows] = await pool.query(`
            SELECT iv.*, p.nomeProduto, p.categoriaProduto 
            FROM Itens_Venda iv 
            JOIN Produto p ON iv.fk_Produto_idProduto = p.idProduto 
            WHERE iv.fk_Venda_idVenda = ?
        `, [id]);

        const sale = {
            ...saleRows[0],
            itens: itemRows
        };

        res.json(sale);
    } catch (error) {
        console.error("Erro ao buscar venda por ID:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const renderSales = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT v.*, c.nome as nomeCliente 
            FROM Venda v 
            JOIN Cliente c ON v.fk_Cliente_idCliente = c.idCliente 
            ORDER BY v.dataVenda DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Erro ao buscar vendas:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const searchSales = async (req, res) => {
    const { cliente, dataInicio, dataFim } = req.query;
    
    try {
        let query = `
            SELECT v.*, c.nome as nomeCliente 
            FROM Venda v 
            JOIN Cliente c ON v.fk_Cliente_idCliente = c.idCliente 
            WHERE 1=1
        `;
        const params = [];

        if (cliente) {
            query += " AND c.nome LIKE ?";
            params.push(`%${cliente}%`);
        }

        if (dataInicio) {
            query += " AND v.dataVenda >= ?";
            params.push(dataInicio);
        }

        if (dataFim) {
            query += " AND v.dataVenda <= ?";
            params.push(dataFim);
        }

        query += " ORDER BY v.dataVenda DESC";

        const [sales] = await pool.query(query, params);

        if (sales.length === 0) {
            return res.status(404).json({ error: "Nenhuma venda encontrada." });
        }

        res.json(sales);
    } catch (error) {
        console.error("Erro ao buscar vendas:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const updateSale = async (req, res) => {
    const { id } = req.params;
    const { dataVenda, valorTotal, fk_Cliente_idCliente, itens } = req.body;

    try {
        // Verificar se a venda existe
        const [currentSale] = await pool.query("SELECT * FROM Venda WHERE idVenda = ?", [id]);
        if (currentSale.length === 0) {
            return res.status(404).json({ error: "Venda não encontrada." });
        }

        // Verificar se o cliente existe
        const [clientRows] = await pool.query("SELECT * FROM Cliente WHERE idCliente = ?", [fk_Cliente_idCliente]);
        if (clientRows.length === 0) {
            return res.status(404).json({ error: "Cliente não encontrado." });
        }

        // Iniciar transação
        await pool.query("START TRANSACTION");

        // Reverter estoque dos itens antigos
        const [oldItems] = await pool.query("SELECT * FROM Itens_Venda WHERE fk_Venda_idVenda = ?", [id]);
        
        for (const oldItem of oldItems) {
            // Adicionar de volta ao estoque mais recente do produto
            const [latestStock] = await pool.query(
                "SELECT * FROM Estoque WHERE fk_Produto_idProduto = ? ORDER BY dataEntrada DESC LIMIT 1",
                [oldItem.fk_Produto_idProduto]
            );

            if (latestStock.length > 0) {
                await pool.query(
                    "UPDATE Estoque SET quantidade = quantidade + ? WHERE idEstoque = ?",
                    [oldItem.quantidade, latestStock[0].idEstoque]
                );
            }
        }

        // Deletar itens antigos
        await pool.query("DELETE FROM Itens_Venda WHERE fk_Venda_idVenda = ?", [id]);

        // Atualizar dados da venda
        await pool.query(
            "UPDATE Venda SET dataVenda = ?, valorTotal = ?, fk_Cliente_idCliente = ? WHERE idVenda = ?",
            [dataVenda, valorTotal, fk_Cliente_idCliente, id]
        );

        // Inserir novos itens e atualizar estoque
        for (const item of itens) {
            const { fk_Produto_idProduto, precoUnitario, quantidade } = item;

            // Verificar se o produto existe
            const [productRows] = await pool.query("SELECT * FROM Produto WHERE idProduto = ?", [fk_Produto_idProduto]);
            if (productRows.length === 0) {
                await pool.query("ROLLBACK");
                return res.status(404).json({ error: `Produto com ID ${fk_Produto_idProduto} não encontrado.` });
            }

            // Verificar estoque disponível
            const [stockRows] = await pool.query(
                "SELECT SUM(quantidade) as totalEstoque FROM Estoque WHERE fk_Produto_idProduto = ?",
                [fk_Produto_idProduto]
            );

            const estoqueDisponivel = stockRows[0].totalEstoque || 0;
            if (estoqueDisponivel < quantidade) {
                await pool.query("ROLLBACK");
                return res.status(400).json({ 
                    error: `Estoque insuficiente para o produto ${productRows[0].nomeProduto}. Disponível: ${estoqueDisponivel}, Solicitado: ${quantidade}` 
                });
            }

            // Inserir novo item da venda
            await pool.query(
                "INSERT INTO Itens_Venda (fk_Venda_idVenda, fk_Produto_idProduto, precoUnitario, quantidade) VALUES (?, ?, ?, ?)",
                [id, fk_Produto_idProduto, precoUnitario, quantidade]
            );

            // Atualizar estoque (FIFO)
            let quantidadeRestante = quantidade;
            const [estoqueItems] = await pool.query(
                "SELECT * FROM Estoque WHERE fk_Produto_idProduto = ? AND quantidade > 0 ORDER BY dataEntrada ASC",
                [fk_Produto_idProduto]
            );

            for (const estoqueItem of estoqueItems) {
                if (quantidadeRestante <= 0) break;

                if (estoqueItem.quantidade >= quantidadeRestante) {
                    await pool.query(
                        "UPDATE Estoque SET quantidade = quantidade - ? WHERE idEstoque = ?",
                        [quantidadeRestante, estoqueItem.idEstoque]
                    );
                    quantidadeRestante = 0;
                } else {
                    quantidadeRestante -= estoqueItem.quantidade;
                    await pool.query(
                        "UPDATE Estoque SET quantidade = 0 WHERE idEstoque = ?",
                        [estoqueItem.idEstoque]
                    );
                }
            }
        }

        // Confirmar transação
        await pool.query("COMMIT");

        res.status(200).json({ message: "Venda atualizada com sucesso!" });

    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Erro ao atualizar venda:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const deleteSale = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar se a venda existe
        const [saleRows] = await pool.query("SELECT * FROM Venda WHERE idVenda = ?", [id]);
        if (saleRows.length === 0) {
            return res.status(404).json({ error: "Venda não encontrada." });
        }

        // Iniciar transação
        await pool.query("START TRANSACTION");

        // Reverter estoque dos itens da venda
        const [items] = await pool.query("SELECT * FROM Itens_Venda WHERE fk_Venda_idVenda = ?", [id]);
        
        for (const item of items) {
            // Adicionar de volta ao estoque mais recente do produto
            const [latestStock] = await pool.query(
                "SELECT * FROM Estoque WHERE fk_Produto_idProduto = ? ORDER BY dataEntrada DESC LIMIT 1",
                [item.fk_Produto_idProduto]
            );

            if (latestStock.length > 0) {
                await pool.query(
                    "UPDATE Estoque SET quantidade = quantidade + ? WHERE idEstoque = ?",
                    [item.quantidade, latestStock[0].idEstoque]
                );
            }
        }

        // Deletar itens da venda
        await pool.query("DELETE FROM Itens_Venda WHERE fk_Venda_idVenda = ?", [id]);

        // Deletar a venda
        const [result] = await pool.query("DELETE FROM Venda WHERE idVenda = ?", [id]);

        // Confirmar transação
        await pool.query("COMMIT");

        if (result.affectedRows === 1) {
            res.json({ message: "Venda deletada com sucesso!" });
        } else {
            res.status(404).json({ error: "Venda não encontrada." });
        }

    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Erro ao deletar venda:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

// Função auxiliar para obter relatórios de vendas
export const getSalesReport = async (req, res) => {
    const { dataInicio, dataFim } = req.query;

    try {
        let query = `
            SELECT 
                DATE(v.dataVenda) as data,
                COUNT(v.idVenda) as totalVendas,
                SUM(v.valorTotal) as faturamento,
                AVG(v.valorTotal) as ticketMedio
            FROM Venda v 
            WHERE 1=1
        `;
        const params = [];

        if (dataInicio) {
            query += " AND v.dataVenda >= ?";
            params.push(dataInicio);
        }

        if (dataFim) {
            query += " AND v.dataVenda <= ?";
            params.push(dataFim);
        }

        query += " GROUP BY DATE(v.dataVenda) ORDER BY data DESC";

        const [report] = await pool.query(query, params);

        res.json(report);
    } catch (error) {
        console.error("Erro ao gerar relatório de vendas:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

