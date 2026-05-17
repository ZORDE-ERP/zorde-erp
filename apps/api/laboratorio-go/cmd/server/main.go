package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"github.com/zorde/api/internal/database"
	"github.com/zorde/api/internal/handler"
	"github.com/zorde/api/internal/repository"
	"github.com/zorde/api/internal/security"
	"github.com/zorde/api/internal/service"
	"github.com/zorde/api/internal/usecase"
)

func main() {

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatalf("DATABASE_URL environment variable is required")
	}

	db, err := database.Connect(dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	resendAPIKey := os.Getenv("RESEND_API_KEY")
	if resendAPIKey == "" {
		log.Fatalf("RESEND_API_KEY environment variable is required")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatalf("JWT_SECRET environment variable is required")
	}

	// Services
	emailSvc := service.NewEmailService(resendAPIKey)
	passwordHasher := security.NewArgon2Hasher()

	// Repositories
	clienteRepo := repository.NewClienteRepository(db)
	fornecedorRepo := repository.NewFornecedorRepository(db)
	ordemRepo := repository.NewOrdemDeServicoRepository(db)
	tabelaRepo := repository.NewTabelaMontagemRepository(db)
	solicitacaoRepo := repository.NewSolicitacaoCadastroRepository(db)
	usuarioRepo := repository.NewUsuarioRepository(db)
	autenticacaoRepo := repository.NewAutenticacaoRepository(db)

	// Use cases
	clienteUC := usecase.NewClienteUseCase(clienteRepo)
	fornecedorUC := usecase.NewFornecedorUseCase(fornecedorRepo)
	ordemUC := usecase.NewOrdemDeServicoUseCase(ordemRepo, clienteRepo, tabelaRepo)
	tabelaMontagemUC := usecase.NewTabelaMontagemUseCase(tabelaRepo)
	solicitacaoUC := usecase.NewSolicitacaoCadastroUseCase(solicitacaoRepo, emailSvc)
	usuarioUC := usecase.NewUsuarioUseCase(usuarioRepo, passwordHasher)
	autenticacaoUC := usecase.NewAutenticacaoUseCase(autenticacaoRepo, usuarioRepo, passwordHasher)

	// Handlers
	clienteHandler := handler.NewClienteHandler(clienteUC)
	fornecedorHandler := handler.NewFornecedorHandler(fornecedorUC)
	ordemHandler := handler.NewOrdemDeServicoHandler(ordemUC)
	tabelaMontagemHandler := handler.NewTabelaMontagemHandler(tabelaMontagemUC)
	solicitacaoHandler := handler.NewSolicitacaoCadastroHandler(solicitacaoUC)
	usuarioHandler := handler.NewUsuarioHandler(usuarioUC)
	autenticacaoHandler := handler.NewAutenticacaoHandler(autenticacaoUC)

	mux := http.NewServeMux()

	// Define as regras CORS
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4200"}, // Sua origem front-end
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}).Handler(mux)

	mux.HandleFunc("/api/health", handler.HealthCheck)

	// Autenticacao
	mux.HandleFunc("POST /api/auth/login", autenticacaoHandler.Login)
	mux.HandleFunc("POST /api/auth/refresh", autenticacaoHandler.Refresh)
	mux.HandleFunc("POST /api/auth/logout", autenticacaoHandler.Logout)

	// Clientes
	mux.HandleFunc("GET /api/clientes", handler.AuthMiddleware(clienteHandler.List))
	mux.HandleFunc("POST /api/clientes", handler.AuthMiddleware(clienteHandler.Create))
	mux.HandleFunc("GET /api/clientes/{id}", handler.AuthMiddleware(clienteHandler.GetByID))
	mux.HandleFunc("PUT /api/clientes/{id}", handler.AuthMiddleware(clienteHandler.Update))
	mux.HandleFunc("DELETE /api/clientes/{id}", handler.AuthMiddleware(clienteHandler.Delete))

	// Fornecedores
	mux.HandleFunc("GET /api/fornecedores", handler.AuthMiddleware(fornecedorHandler.List))
	mux.HandleFunc("POST /api/fornecedores", handler.AuthMiddleware(fornecedorHandler.Create))
	mux.HandleFunc("GET /api/fornecedores/{id}", handler.AuthMiddleware(fornecedorHandler.GetByID))
	mux.HandleFunc("PUT /api/fornecedores/{id}", handler.AuthMiddleware(fornecedorHandler.Update))
	mux.HandleFunc("DELETE /api/fornecedores/{id}", handler.AuthMiddleware(fornecedorHandler.Delete))

	// Ordens de Serviço
	mux.HandleFunc("GET /api/ordens-de-servico", handler.AuthMiddleware(ordemHandler.List))
	mux.HandleFunc("POST /api/ordens-de-servico", handler.AuthMiddleware(ordemHandler.Create))
	mux.HandleFunc("GET /api/ordens-de-servico/{id}", handler.AuthMiddleware(ordemHandler.GetByID))
	mux.HandleFunc("PUT /api/ordens-de-servico/{id}", handler.AuthMiddleware(ordemHandler.Update))
	mux.HandleFunc("DELETE /api/ordens-de-servico/{id}", handler.AuthMiddleware(ordemHandler.Delete))

	// Auth — verificação de email
	mux.HandleFunc("POST /api/auth/solicitar-cadastro", solicitacaoHandler.SolicitarCadastro)
	mux.HandleFunc("POST /api/auth/verificar-email", solicitacaoHandler.VerificarEmail)
	mux.HandleFunc("POST /api/auth/reenviar-codigo", solicitacaoHandler.ReenviarCodigo)

	// Usuários (A criação é pública, mas a listagem, update e delete são protegidas)
	mux.HandleFunc("POST /api/usuarios", usuarioHandler.Create)
	mux.HandleFunc("GET /api/usuarios", handler.AuthMiddleware(usuarioHandler.List))
	mux.HandleFunc("PUT /api/usuarios/{id}", handler.AuthMiddleware(usuarioHandler.Update))
	mux.HandleFunc("DELETE /api/usuarios/{id}", handler.AuthMiddleware(usuarioHandler.Delete))

	// Tabela de Montagem
	mux.HandleFunc("GET /api/tabela-montagem", handler.AuthMiddleware(tabelaMontagemHandler.GetAll))
	mux.HandleFunc("POST /api/tabela-montagem", handler.AuthMiddleware(tabelaMontagemHandler.Create))
	mux.HandleFunc("PUT /api/tabela-montagem/{id}", handler.AuthMiddleware(tabelaMontagemHandler.Update))
	mux.HandleFunc("DELETE /api/tabela-montagem/{id}", handler.AuthMiddleware(tabelaMontagemHandler.Delete))

	log.Printf("Starting server on port %s", port)
	if err := http.ListenAndServe(":"+port, corsHandler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
