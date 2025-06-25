CREATE DATABASE IF NOT EXISTS CliVet;
USE CliVet;

CREATE TABLE Cliente (
    idCliente INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    endereco VARCHAR(100)
);

CREATE TABLE Produto (
    idProduto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nomeProduto VARCHAR(100) NOT NULL,
    categoriaProduto ENUM('Ração','Petisco','Acessório','Item','Higiene') NOT NULL,
    precoProduto DECIMAL(10,2) NOT NULL,
    descricaoProduto VARCHAR(255)
);

CREATE TABLE Estoque (
    idEstoque INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    quantidade INT NOT NULL,
    validade DATE NOT NULL,
    dataEntrada DATE NOT NULL,
    fk_Produto_idProduto INT UNSIGNED NOT NULL
);

CREATE TABLE Venda (
    idVenda INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    dataVenda DATE NOT NULL,
    valorTotal DECIMAL(10,2) NOT NULL,
    fk_Cliente_idCliente INT UNSIGNED NOT NULL
);

CREATE TABLE Itens_Venda (
    fk_Venda_idVenda INT UNSIGNED NOT NULL,
    fk_Produto_idProduto INT UNSIGNED NOT NULL,
    precoUnitario DECIMAL(10,2) NOT NULL,
    quantidade INT NOT NULL,
    idItem INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
);
 
ALTER TABLE Estoque ADD CONSTRAINT fk_Estoque_Produto
    FOREIGN KEY (fk_Produto_idProduto)
    REFERENCES Produto (idProduto)
    ON DELETE RESTRICT;
 
ALTER TABLE Venda ADD CONSTRAINT fk_Venda_Cliente
    FOREIGN KEY (fk_Cliente_idCliente)
    REFERENCES Cliente (idCliente)
    ON DELETE RESTRICT;
 
ALTER TABLE Itens_Venda ADD CONSTRAINT fk_Itens_Venda_Venda
    FOREIGN KEY (fk_Venda_idVenda)
    REFERENCES Venda (idVenda)
    ON DELETE RESTRICT;
 
ALTER TABLE Itens_Venda ADD CONSTRAINT fk_Itens_Venda_Produto
    FOREIGN KEY (fk_Produto_idProduto)
    REFERENCES Produto (idProduto)
    ON DELETE RESTRICT;