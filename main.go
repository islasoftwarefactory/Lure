package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"log"
)

func main() {
	app := fiber.New(fiber.Config{
		AppName: "E-commerce API",
	})

	// Configuração mais permissiva do CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "*",
		AllowCredentials: true,
	}))

	// Middleware de logging para debug
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path}\n",
	}))

	// Rotas
	auth := app.Group("/auth")
	auth.Get("/anonymous-token", handleAnonymousToken)

	products := app.Group("/product")
	products.Get("/read/all", handleGetAllProducts)

	// Adiciona handler específico para OPTIONS
	app.Options("/*", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	log.Fatal(app.Listen(":8080"))
}

func handleAnonymousToken(c *fiber.Ctx) error {
	// Sua lógica existente de geração de token anônimo
	return c.JSON(fiber.Map{
		"token": "seu_token_jwt",
		"type":  "anonymous",
	})
}

func handleGetAllProducts(c *fiber.Ctx) error {
	// Sua lógica existente de busca de produtos
	return c.JSON(fiber.Map{
		"data": []fiber.Map{
			{
				"id":          "1",
				"name":        "Produto Exemplo",
				"price":       99.99,
				"description": "Descrição do produto exemplo",
			},
		},
	})
}