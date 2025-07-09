import { pool } from "../services/db.js";

export const createClient = async (req, res) => {
    const { nome, email, telefone, endereco} = req.body;
    const newClient = { nome, email, telefone, endereco };

    const [rows] = await pool.query("SELECT * FROM Cliente WHERE email = ?", [email]);

    if (rows.length > 0) {
        return res.status(400).json({ error: "E-mail já está sendo utilizado." });
    } else {
    await pool.query("INSERT INTO Cliente SET ?", [newClient]);
    return res.status(201).json({ message: "Cliente salvo com sucesso!", client: newClient });  
    }
};

export const getClientById = async (req, res) => {
    const { idCliente } = req.params;

    try {
        const [rows] = await pool.query("SELECT * FROM Cliente WHERE idCliente = ?", [idCliente]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Cliente não encontrado." });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Erro ao buscar cliente por ID:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const renderClients = async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM Cliente");
    res.json(rows)
};

export const searchClients = async (req, res) => {
    const { nome } = req.query;
        const [cliente] = await pool.query(
            "SELECT * FROM Cliente WHERE nome LIKE ?", 
            [`%${nome}%`]
        );

        if (cliente.length === 0) {
            return res.status(404).json({ error: "Nenhum cliente encontrado."})
        }
        res.json(cliente);
};

export const updateClient = async (req, res) => {
    const { idCliente } = req.params;
    const { nome, email, telefone, endereco } = req.body;

    const [currentClient] = await pool.query("SELECT * FROM Cliente WHERE idCliente = ?", [idCliente]);
    if (currentClient.length === 0) {
        return res.status(404).json({ error: "Cliente não encontrado." });
    } else if (
        currentClient[0].nome === nome &&
        currentClient[0].email === email &&
        currentClient[0].telefone === telefone &&
        currentClient[0].endereco === endereco
    ) {
        return res.status(200).json({ message: "Nenhuma alteração foi feita." });
    }

    const [rows] = await pool.query("SELECT * FROM Cliente WHERE email = ? AND idCliente != ?", [email, idCliente]);
    if (rows.length > 0) {
        return res.status(400).json({ error: "E-mail já está sendo utilizado." });
    }

    await pool.query(
        "UPDATE Cliente SET nome = ?, email = ?, telefone = ?, endereco = ? WHERE idCliente = ?",
        [nome, email, telefone, endereco, idCliente]
    );

    res.status(200).json({ message: "Cliente atualizado com sucesso!" });
};

export const deleteClient = async (req, res) => {
  const { idCliente } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM Cliente WHERE idCliente = ?", [idCliente]);
    if (result.affectedRows === 1) {
      res.json({ message: "Cliente deletado com sucesso." });
    } else {
      res.status(404).json({ error: "Cliente não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};