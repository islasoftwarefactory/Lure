# Detalhes do Modelo de Usuário (`api/user/model.py`)

Este documento descreve a estrutura e as decisões de design por trás do modelo `User` SQLAlchemy encontrado em `api/user/model.py`. O objetivo principal deste modelo é suportar **exclusivamente** a autenticação de usuários via provedores de Single Sign-On (SSO), especificamente **Google** e **Apple**, sem suporte para login local tradicional (email/senha).

## Arquitetura e Decisões Chave

1.  **Tabela Única (`users`):** Optou-se por uma única tabela para armazenar todos os usuários, independentemente do provedor SSO. Isso simplifica as consultas e a gestão dos dados básicos do usuário. Tabelas separadas por provedor foram consideradas desnecessárias, pois os dados essenciais são comuns.
2.  **Sem Autenticação Local:** O modelo foi explicitamente projetado para *não* suportar login via email/senha. Por isso, **não há campo `password`** na tabela.
3.  **Identificação do Provedor (`auth_provider`):**
    *   Um campo `Enum` (`AuthProviderEnum`) é usado para registrar qual provedor (Google ou Apple) foi utilizado para autenticar e criar a conta do usuário.
    *   Este campo é crucial para diferenciar a origem do usuário e para lógicas futuras que possam depender do provedor.
    *   É definido como `nullable=False`.
4.  **Identificador Único do Provedor (`provider_id`):**
    *   Este campo armazena o identificador único (ID) que o provedor SSO (Google/Apple) atribui ao usuário em seu próprio sistema (geralmente o `sub` ou Subject ID do token OpenID Connect).
    *   É essencial para vincular o registro no nosso banco de dados à conta externa do usuário.
    *   É definido como `nullable=False`.
5.  **Restrição de Unicidade (`UniqueConstraint`):**
    *   Uma restrição `UniqueConstraint('auth_provider', 'provider_id', name='uq_provider_identity')` foi adicionada.
    *   **Propósito:** Garantir que a combinação do provedor e o ID fornecido por ele seja única. Isso impede que a mesma conta externa (ex: a mesma conta Google) seja acidentalmente vinculada a mais de um registro de usuário no nosso sistema.
6.  **Campos Padrão:** Campos como `id` (PK interna), `email` (único), `name`, `photo` (opcional), `created_at`, e `updated_at` são mantidos para informações básicas do usuário.

## Estrutura da Classe `User`

```python
class AuthProviderEnum(enum.Enum):
    GOOGLE = 'Google'
    APPLE = 'Apple'

class User(db.Model):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint('auth_provider', 'provider_id', name='uq_provider_identity'),)

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(256), unique=True, nullable=False)
    name = db.Column(db.String(40), nullable=False)
    photo = db.Column(db.String(256), nullable=True)
    auth_provider = db.Column(SQLAlchemyEnum(AuthProviderEnum, name='auth_provider_enum'), nullable=False)
    provider_id = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=...)
    updated_at = db.Column(db.DateTime, nullable=False, default=..., onupdate=...)

    # Métodos: __repr__, serialize
```

## Funções Auxiliares Principais

*   **`find_user_by_provider(auth_provider: AuthProviderEnum, provider_id: str) -> Optional[User]`**:
    *   Busca um usuário específico com base no seu provedor de autenticação (`GOOGLE` ou `APPLE`) e o ID único fornecido por esse provedor (`provider_id`).
    *   **Uso Principal:** Na rota de callback do SSO para verificar se o usuário já existe no sistema.
*   **`create_user(user_data: Dict) -> User`**:
    *   Cria um novo registro de usuário no banco de dados.
    *   Espera um dicionário `user_data` contendo `name`, `email`, `auth_provider` (como string ou Enum), `provider_id`, e opcionalmente `photo`.
    *   **Uso Principal:** Na rota de callback do SSO, *após* `find_user_by_provider` retornar `None`, para registrar o novo usuário.
    *   Inclui validações básicas e tratamento de erros (ex: tentativa de criar usuário duplicado).
*   **`get_user(user_id: int) -> Optional[User]`**: Busca um usuário pelo seu ID interno.
*   **`update_user(user_id: int, user_data: Dict) -> Optional[User]`**: Atualiza dados permitidos (ex: `name`, `photo`) de um usuário existente. Não permite alterar `email`, `auth_provider` ou `provider_id` por padrão.
*   **`delete_user(user_id: int) -> bool`**: Deleta um usuário pelo ID interno.
*   **`find_user_by_email(email: str) -> Optional[User]`**: Função auxiliar para buscar por email, pode ser útil em cenários específicos, mas a busca primária no fluxo SSO deve ser por `provider_id`.

## Integração com Fluxo SSO

Este modelo foi projetado para ser usado principalmente dentro das rotas de callback do Google e Apple SSO no backend. O fluxo típico dentro de um callback seria:

1.  Validar o token recebido do provedor.
2.  Extrair `provider_id`, `email`, `name`, `photo`.
3.  Determinar o `auth_provider` (Google/Apple).
4.  Chamar `find_user_by_provider`.
5.  Se o usuário não for encontrado, chamar `create_user`.
6.  Com o objeto `User` (encontrado ou criado), gerar um token de sessão/JWT da aplicação para autenticar o usuário.

---