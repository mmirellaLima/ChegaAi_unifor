-- PostgreSQL

-- Tabela de Usuários
CREATE TABLE Usuario (
    id_usuario SERIAL,
    nome_usuario VARCHAR(100) NOT NULL,
    apelido_usuario VARCHAR(100) NOT NULL,
    email_usuario VARCHAR(100) NOT NULL UNIQUE,
    senha_usuario VARCHAR(100) NOT NULL,
    bio_usuario VARCHAR(100) NOT NULL,
    fotoPerfil_url TEXT,
    fotoCapa_url TEXT,
    nivelSocial INT DEFAULT 1,
    xpAtual INT DEFAULT 0,
    xpMaximo INT DEFAULT 100,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    ultimaVezOnline TIMESTAMP DEFAULT NULL,
    dataCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario)
);

-- Tabela de Comunidades
CREATE TABLE Comunidade (
    id_comunidade SERIAL,
    id_usuario_dono INT NOT NULL,
    nome_comunidade VARCHAR(100) NOT NULL,
    descricao VARCHAR(244) NOT NULL,
    fotoComunidade_url TEXT,
    TemaCor VARCHAR(30),
    dataCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_comunidade),
    FOREIGN KEY (id_usuario_dono) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

-- Relacionamento N:M - Membros da Comunidade
CREATE TABLE Membros_da_Comunidade (
    id_usuario_membro INT NOT NULL,
    id_comunidade INT NOT NULL,
    funcao_membro VARCHAR(30) DEFAULT 'Membro',
    dataEntrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario_membro, id_comunidade),
    FOREIGN KEY (id_usuario_membro) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_comunidade) REFERENCES Comunidade(id_comunidade) ON DELETE CASCADE
);

-- Tabela de Eventos
CREATE TABLE Evento (
    id_evento SERIAL,
    id_comunidade INT NOT NULL,
    id_criador INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao VARCHAR(244) NOT NULL,
    nome_local VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    horario_inicio TIMESTAMP NOT NULL,
    horario_termino TIMESTAMP NOT NULL,
    tipo_evento VARCHAR(30),
    dataCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_evento),
    FOREIGN KEY (id_comunidade) REFERENCES Comunidade(id_comunidade) ON DELETE CASCADE,
    FOREIGN KEY (id_criador) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

-- Relacionamento N:M - Participantes do Evento
CREATE TABLE Participantes_do_Evento (
    id_participante INT NOT NULL,
    id_evento INT NOT NULL,
    status VARCHAR(30) DEFAULT 'Confirmado',
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_participante, id_evento),
    FOREIGN KEY (id_participante) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_evento) REFERENCES Evento(id_evento) ON DELETE CASCADE
);

-- Tabela de Amizades
CREATE TABLE Amizade (
    id_usuario INT NOT NULL,
    id_amigo INT NOT NULL,
    status VARCHAR(30) DEFAULT 'Pendente',
    dataCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_amigo),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_amigo) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

-- Tabela de Conquistas (Achievements)
CREATE TABLE conquista (
    id_conquista SERIAL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(244) NOT NULL,
    simbolo_icone TEXT,
    recompensa_xp INT DEFAULT 0,
    PRIMARY KEY (id_conquista)
);

-- Relacionamento N:M - Usuários e suas Conquistas
CREATE TABLE usuario_conquistas (
    id_usuario INT NOT NULL,
    id_conquista INT NOT NULL,
    conquistado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_conquista),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_conquista) REFERENCES conquista(id_conquista) ON DELETE CASCADE
);

-- Tabela de Desafios
CREATE TABLE desafios (
    id_desafio SERIAL,
    titulo VARCHAR(150) NOT NULL,
    descricao VARCHAR(244) NOT NULL,
    recompensa_xp INT DEFAULT 0,
    data_inicio TIMESTAMP,
    data_fim TIMESTAMP,
    PRIMARY KEY (id_desafio)
);

-- Relacionamento N:M - Progresso dos Usuários nos Desafios
CREATE TABLE usuario_desafios (
    id_usuario INT NOT NULL,
    id_desafio INT NOT NULL,
    progresso INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'em_andamento',
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_desafio),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_desafio) REFERENCES desafios(id_desafio) ON DELETE CASCADE
);

-- Tabela de Mensagens Privadas
CREATE TABLE mensagens (
    id_mensagem SERIAL,
    id_remetente INT NOT NULL,
    id_destinatario INT NOT NULL,
    conteudo TEXT NOT NULL,
    enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lido_em TIMESTAMP DEFAULT NULL,
    PRIMARY KEY (id_mensagem),
    FOREIGN KEY (id_remetente) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_destinatario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);