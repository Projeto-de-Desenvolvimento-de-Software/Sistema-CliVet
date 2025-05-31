-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS CliVet;
USE CliVet;

-- Tabela Cliente: armazena dados dos clientes da clínica veterinária
CREATE TABLE Cliente (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200),
    email VARCHAR(100), 
    telefone VARCHAR(15), 
    endereco VARCHAR(100) NOT NULL
);

-- Tabela Venda: registra as vendas realizadas
CREATE TABLE Venda (
    idVenda INT AUTO_INCREMENT PRIMARY KEY,
    valor DECIMAL(10, 2),
    dataVenda DATE,
    desconto DECIMAL(5, 2),
    fk_Cliente_email VARCHAR(100)
);

-- Adiciona relacionamento entre Venda e Cliente
ALTER TABLE Venda
ADD CONSTRAINT fk_venda_cliente
FOREIGN KEY (fk_Cliente_email)
REFERENCES Cliente(email)
ON DELETE SET NULL;

-- Tabela Produto: representa os produtos disponíveis
CREATE TABLE Produto (
    idProduto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nomeProduto VARCHAR(100) NOT NULL,
    descricaoProduto VARCHAR(255),
    categoriaProduto ENUM(
        'Ração',
        'Petisco',
        'Acessório',
        'Item',
        'Higiene'
    ) NOT NULL,
    precoProduto DECIMAL(10, 2) NOT NULL
);

-- Tabela ItensVenda: relaciona os produtos vendidos em uma venda
CREATE TABLE ItensVenda (
    idItem INT AUTO_INCREMENT PRIMARY KEY,
    quantidade INT,
    precoUnitario DECIMAL(10, 2),
    desconto DECIMAL(5, 2),
    fk_Produto_idProduto INT,
    fk_Venda_idVenda INT
);

-- Adiciona chaves estrangeiras em ItensVenda
ALTER TABLE ItensVenda
ADD CONSTRAINT fk_itensvenda_produto
FOREIGN KEY (fk_Produto_idProduto)
REFERENCES Produto(idProduto)
ON DELETE NO ACTION;

ALTER TABLE ItensVenda
ADD CONSTRAINT fk_itensvenda_venda
FOREIGN KEY (fk_Venda_idVenda)
REFERENCES Venda(idVenda)
ON DELETE CASCADE;

-- Tabela Medicamento: contém os medicamentos vendidos
CREATE TABLE Medicamento (
    idMedicamento INT PRIMARY KEY,
    nomeMedicamento VARCHAR(100),
    descricaoMedicamento VARCHAR(100),
    categoriaMedicamento VARCHAR(50),
    precoMedicamento DECIMAL(10, 2)
);

-- Tabela ProdutoMedicamento: relaciona medicamentos que também são produtos
CREATE TABLE ProdutoMedicamento (
    fk_Medicamento_idMedicamento INT,
    fk_Produto_idProduto INT,
    PRIMARY KEY (fk_Medicamento_idMedicamento, fk_Produto_idProduto)
);

-- Adiciona relacionamentos na tabela ProdutoMedicamento
ALTER TABLE ProdutoMedicamento
ADD CONSTRAINT fk_produtomedicamento_medicamento
FOREIGN KEY (fk_Medicamento_idMedicamento)
REFERENCES Medicamento(idMedicamento)
ON DELETE CASCADE;

ALTER TABLE ProdutoMedicamento
ADD CONSTRAINT fk_produtomedicamento_produto
FOREIGN KEY (fk_Produto_idProduto)
REFERENCES Produto(idProduto)
ON DELETE CASCADE;

-- Tabela Estoque: controla o estoque de produtos e medicamentos
CREATE TABLE Estoque (
    idEstoque INT AUTO_INCREMENT PRIMARY KEY,
    descricaoEstoque VARCHAR(255),
    quantidade INT,
    validade DATE,
    dataEntrada DATE,
    fk_Produto_idProduto INT,
    fk_Medicamento_idMedicamento INT
);

-- Adiciona relacionamentos na tabela Estoque
ALTER TABLE Estoque
ADD CONSTRAINT fk_estoque_produto
FOREIGN KEY (fk_Produto_idProduto)
REFERENCES Produto(idProduto)
ON DELETE SET NULL;

ALTER TABLE Estoque
ADD CONSTRAINT fk_estoque_medicamento
FOREIGN KEY (fk_Medicamento_idMedicamento)
REFERENCES Medicamento(idMedicamento)
ON DELETE SET NULL;