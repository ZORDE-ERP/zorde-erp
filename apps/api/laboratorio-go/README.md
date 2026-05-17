# Zorde API (Laboratório) - Go

Este é o backend do projeto Zorde, desenvolvido em **Go (Golang)**. Este documento fornece um guia passo a passo para configurar e executar o projeto em uma máquina que ainda não possui o ambiente Go configurado.

## 1. Pré-requisitos (Instalando o Go)

Se você não tem o Go instalado, precisará instalá-lo primeiro.

### No Linux (Ubuntu/Debian)
```bash
# Baixe a versão mais recente do Go (verifique a versão exata no site oficial)
wget https://go.dev/dl/go1.26.0.linux-amd64.tar.gz

# Extraia para /usr/local
sudo tar -C /usr/local -xzf go1.26.0.linux-amd64.tar.gz

# Adicione o Go ao PATH do seu sistema
echo "export PATH=\$PATH:/usr/local/go/bin:\$HOME/go/bin" >> ~/.bashrc
source ~/.bashrc

# Verifique se instalou corretamente
go version
```

### No Windows ou macOS
Acesse o site oficial [https://go.dev/dl/](https://go.dev/dl/) e baixe o instalador apropriado para o seu sistema. Siga o assistente de instalação (no formato "Next > Next > Finish").
Após a instalação, abra o terminal e digite `go version` para confirmar.

---

## 2. Configurando o Banco de Dados (PostgreSQL)

Este projeto requer um banco de dados PostgreSQL. Certifique-se de ter o PostgreSQL rodando localmente ou via Docker.

1. Crie um banco de dados chamado `zorde_gestao_lab`.
2. Crie um usuário `zorde_lab` com a senha `que_tu_quiser` (ou utilize suas próprias credenciais e atualize o arquivo `.env`).

**Exemplo usando Docker:**
```bash
docker run --name zorde_postgres -e POSTGRES_USER=zorde_lab -e POSTGRES_PASSWORD=que_tu_quiser -e POSTGRES_DB=zorde_gestao_lab -p 5432:5432 -d postgres
```

---

## 3. Configurando o Projeto

Abra o terminal e navegue até a pasta desta API:
```bash
cd apps/api/laboratorio-go
```

### 3.1 Arquivo de Variáveis de Ambiente (`.env`)
Certifique-se de que o arquivo `.env` existe na raiz do projeto `laboratorio-go` (ao lado de `main.go` ou de onde você executa o programa). Caso não exista, crie-o baseado na estrutura abaixo:

```env
DATABASE_URL=postgres://zorde_lab:zorde_2026_lab@localhost:5432/zorde_gestao_lab?sslmode=disable
POSTGRES_DB=zorde_gestao_lab
POSTGRES_USER=zorde_lab
POSTGRES_PASSWORD=zorde_2026_lab

API_PORT=8080
RESEND_API_KEY=sua_chave_aqui
JWT_SECRET=super_secret_jwt_key_for_zorde_gestao_lab
```

### 3.2 Baixando as Dependências
Execute o comando abaixo para baixar e organizar todas as bibliotecas necessárias para o projeto:
```bash
go mod tidy
```

---

## 4. Ferramenta de Hot-Reload (Air)

O projeto utiliza o pacote `air` para recarregar o servidor automaticamente sempre que você salvar um arquivo (semelhante ao `nodemon` do Node.js). 

Para instalar o `air` globalmente na sua máquina, execute:
```bash
go install github.com/air-verse/air@latest
```
*(Lembre-se de garantir que o diretório `~/go/bin` ou `%USERPROFILE%\go\bin` esteja no PATH do seu sistema, conforme configurado na etapa 1).*

---

## 5. Executando o Projeto

Com tudo instalado, você pode rodar o projeto de duas maneiras:

### Opção 1: Modo de Desenvolvimento com Hot-Reload (Recomendado)
Estando dentro da pasta `apps/api/laboratorio-go`, execute:
```bash
# Através do script NPM
npm run dev
```
Ou executando o `air` diretamente:
```bash
air
```

O servidor será iniciado na porta **8080**. Qualquer alteração nos arquivos `.go` fará com que o servidor reinicie automaticamente.

### Opção 2: Modo Padrão (Sem hot-reload)
Se você não quiser usar o `air`, pode rodar o servidor padrão do Go com o comando:
```bash
go run cmd/server/main.go
```

## 6. Build para Produção
Para compilar o aplicativo em um arquivo executável, rode:
```bash
# Compilar via script
npm run build

# Ou compilar com Go diretamente
go build -o bin/api cmd/server/main.go
```
Isso criará um arquivo executável que não necessita do código-fonte para rodar.
