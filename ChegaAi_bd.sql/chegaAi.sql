create database bd_chegaAi;
use bd_chegaAi;

create table Usuario (
	id_usuario int not null auto_increment,
    nome_usuario varchar(100) not null,
    apelido_usuario varchar(100) not null,
    email_usuario varchar(100) not null,
    senha_usuario varchar(100) not null,
    bio_usuario varchar(100) not null,
    fotoPerfil_url text,
    fotoCapa_url text,
    nivelSocial int default 1,
    xpAtual int default 0,
    xpMaximo int default 100,
    latitude decimal(9,6),
    longitude decimal(9,6),
    ultimaVezOnline timestamp,
    dataCriacao timestamp default current_timestamp,
    primary key (id_usuario)
);

create table Comunidade (
	id_comunidade int not null auto_increment,
    id_usuario_dono int not null,
    nome_comunidade varchar(100) not null,
    descricao varchar (244) not null,
    fotoComunidade_url text,
    TemaCor varchar (30),
    dataCriacao timestamp default current_timestamp,
    primary key (id_comunidade),
    foreign key (id_usuario_dono) references Usuario(id_usuario)
);

create table Membros_da_Comunidade (
	id_usuario_membro int not null,
    id_comunidade int not null,
    funcao_membro varchar(30) default 'Membro',
    dataEntrada timestamp default current_timestamp,
    primary key (id_usuario_membro,id_comunidade),
    foreign key (id_usuario_membro) references Usuario (id_usuario) on delete cascade,
    foreign key (id_comunidade) references Comunidade (id_comunidade) on delete cascade
);

create table Evento (
	id_evento int not null auto_increment,
    id_comunidade int not null,
    id_criador int not null,
    titulo varchar(100) not null,
    descricao varchar (244) not null,
    nome_local varchar (100) not null,
    latitude decimal(9,6),
    longitude decimal(9,6),
    horario_inicio timestamp not null,
    horario_termino timestamp not null,
    tipo_evento varchar(30),
    dataCriacao timestamp default current_timestamp,
    primary key (id_evento),
    foreign key (id_comunidade) references Comunidade (id_comunidade),
    foreign key (id_criador) references Usuario (id_usuario)
);

create table Participantes_do_Evento (
	id_participante int not null,
    id_evento int not null,
    status varchar (30) default 'Confirmado',
    ultima_atualizacao timestamp default current_timestamp,
    primary key (id_participante,id_evento),
    foreign key (id_participante) references Usuario (id_usuario),
    foreign key (id_evento) references Evento (id_evento)
);

create table Amizade (
	id_usuario int not null,
    id_amigo int not null,
    status varchar(30) default 'Pendente',
    dataCriacao timestamp default current_timestamp,
    primary key (id_usuario,id_amigo),
    foreign key (id_usuario) references Usuario(id_usuario),
    foreign key (id_amigo) references Usuario(id_usuario)
);

CREATE TABLE conquista (
    id_conquista int not null auto_increment,
	nome varchar(100) not null,
    descricao varchar (244) not null,
    simbolo_icone text,
    recompensa_xp int default 0,
    primary key (id_conquista)
);

create table usuario_conquistas (
    id_usuario int not null,
    id_conquista int not null,
    conquistado_em timestamp default current_timestamp,
    primary key (id_usuario, id_conquista),
    foreign key (id_usuario) references Usuario(id_usuario) on delete cascade,
    foreign key (id_conquista) references conquista(id_conquista) on delete cascade
);

create table desafios (
    id_desafio int not null auto_increment,
    titulo varchar(150) not null,
    descricao varchar (244) not null,
    recompensa_xp int default 0,
    data_inicio timestamp,
    data_fim timestamp,
    primary key (id_desafio)
);

create table usuario_desafios (
    id_usuario int not null,
    id_desafio int not null,
    progresso int default 0,
    status varchar(30) default 'em_andamento',
    atualizado_em timestamp default current_timestamp,
    primary key (id_usuario, id_desafio),
    foreign key (id_usuario) references Usuario(id_usuario) on delete cascade,
    foreign key (id_desafio) references desafios(id_desafio) on delete cascade
);

create table mensagens (
    id_mensagem int not null auto_increment,
    id_remetente int not null,
    id_destinatario int not null,
    conteudo text not null,
    enviado_em timestamp default current_timestamp,
    lido_em timestamp,
    primary key (id_mensagem),
    foreign key (id_remetente) references Usuario(id_usuario) on delete cascade,
    foreign key (id_destinatario) references Usuario(id_usuario) on delete cascade
);