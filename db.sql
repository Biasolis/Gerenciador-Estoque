-- Cria um tipo ENUM para garantir que a role do usuário seja sempre 'admin' ou 'user'
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Tabela de Setores
CREATE TABLE sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pessoas (Colaboradores)
CREATE TABLE people (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    extension_line VARCHAR(50),
    sector_id INTEGER REFERENCES sectors(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários do Sistema
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Produtos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    model VARCHAR(255),
    -- A quantidade será um campo calculado para garantir a consistência dos dados.
    -- Vamos controlá-la através das transações de entrada e saída.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de LOG de Entrada de Estoque
CREATE TABLE stock_entries (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_value NUMERIC(10, 2) NOT NULL,
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de LOG de Saída de Estoque (Ordem de Serviço)
CREATE TABLE stock_exits (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    ticket_number VARCHAR(255),
    ticket_link TEXT,
    reason TEXT,
    delivery_date TIMESTAMP WITH TIME ZONE,
    requester_person_id INTEGER NOT NULL REFERENCES people(id),
    user_id INTEGER NOT NULL REFERENCES users(id), -- Usuário do sistema que deu a saída
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Função para atualizar o campo 'updated_at' automaticamente ao editar um registro
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria os Triggers (gatilhos) para cada tabela que precisa da atualização automática
CREATE TRIGGER set_timestamp BEFORE UPDATE ON sectors FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON people FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Permite que o campo de solicitante seja nulo
ALTER TABLE stock_exits ALTER COLUMN requester_person_id DROP NOT NULL;

-- Adiciona um campo de anotações na tabela de entradas
ALTER TABLE stock_entries ADD COLUMN notes TEXT;

-- novo DB --

CREATE TABLE stock_exit_items (
    id SERIAL PRIMARY KEY,
    exit_id INTEGER NOT NULL REFERENCES stock_exits(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    serial_number VARCHAR(255),
    asset_number VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_exit_items_exit_id ON stock_exit_items(exit_id);
CREATE INDEX idx_stock_exit_items_product_id ON stock_exit_items(product_id);

INSERT INTO stock_exit_items (exit_id, product_id, quantity, created_at)
SELECT
    id,          -- O ID da saída antiga se torna a referência 'exit_id'
    product_id,  -- O ID do produto da coluna antiga
    quantity,    -- A quantidade da coluna antiga
    created_at   -- Mantém a data de criação original da saída
FROM
    stock_exits
WHERE
    product_id IS NOT NULL AND quantity IS NOT NULL; -- Garante que só migre registros que tinham dados

-- teste migração --

SELECT COUNT(*) FROM stock_exit_items;

SELECT sei.*, p.name
FROM stock_exit_items sei
JOIN products p ON sei.product_id = p.id
WHERE sei.exit_id = 1; -- Substitua 1 pelo ID de uma saída antiga




-- remove colunas antigas --

ALTER TABLE stock_exits DROP COLUMN product_id;
ALTER TABLE stock_exits DROP COLUMN quantity;