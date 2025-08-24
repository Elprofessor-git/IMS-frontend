# Guide d'Intégration avec le Backend ASP.NET

Ce guide détaille l'intégration entre le frontend Angular et le backend ASP.NET pour le système de gestion textile.

## Configuration Réseau

### URLs et Ports

**Frontend Angular :**
- Développement : `http://localhost:4200`
- Production : `https://votre-domaine.com`

**Backend ASP.NET :**
- Développement : `https://localhost:7001`
- Production : `https://api.votre-domaine.com`

### Configuration CORS

Dans votre projet ASP.NET, configurez CORS dans `Program.cs` ou `Startup.cs` :

```csharp
// Program.cs (ASP.NET 6+)
var builder = WebApplication.CreateBuilder(args);

// Ajouter CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://votre-domaine.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Utiliser CORS
app.UseCors("AllowAngularApp");
app.UseAuthentication();
app.UseAuthorization();
```

## Modèles de Données

### Structure des Réponses API

Toutes les réponses API doivent suivre cette structure :

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T Data { get; set; }
    public string Message { get; set; }
    public List<string> Errors { get; set; } = new List<string>();
}

public class PaginatedResponse<T>
{
    public List<T> Items { get; set; }
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasPreviousPage { get; set; }
    public bool HasNextPage { get; set; }
}
```

### Modèles Métier Essentiels

```csharp
// Utilisateur
public class User
{
    public int Id { get; set; }
    public string Nom { get; set; }
    public string Prenom { get; set; }
    public string Email { get; set; }
    public int RoleId { get; set; }
    public Role Role { get; set; }
    public bool Actif { get; set; }
    public DateTime DateCreation { get; set; }
    public DateTime? DernierConnexion { get; set; }
}

// Client
public class Client
{
    public int Id { get; set; }
    public string Nom { get; set; }
    public string Contact { get; set; }
    public string Email { get; set; }
    public string Telephone { get; set; }
    public string Adresse { get; set; }
    public string PreferencesToiles { get; set; }
    public bool Actif { get; set; }
}

// Stock
public class Stock
{
    public int Id { get; set; }
    public int ArticleId { get; set; }
    public Article Article { get; set; }
    public decimal QuantiteLibre { get; set; }
    public decimal QuantiteReservee { get; set; }
    public decimal QuantiteTotale { get; set; }
    public string EmplacementPhysique { get; set; }
    public decimal SeuilCritique { get; set; }
    public DateTime DateCreation { get; set; }
    public DateTime DateMiseAJour { get; set; }
}

// Commande
public class Commande
{
    public int Id { get; set; }
    public string Reference { get; set; }
    public int ClientId { get; set; }
    public Client Client { get; set; }
    public int PlateformeId { get; set; }
    public Plateforme Plateforme { get; set; }
    public StatutCommande Statut { get; set; }
    public DateTime DateCommande { get; set; }
    public DateTime? DateLivraison { get; set; }
    public decimal Total { get; set; }
    public List<LigneCommande> LignesCommande { get; set; }
}

public enum StatutCommande
{
    Brouillon,
    EnAttente,
    Prete,
    EnProduction,
    Terminee,
    Livree,
    Annulee
}
```

## Contrôleurs API

### Contrôleur d'Authentification

```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);
            return Ok(new ApiResponse<LoginResponse>
            {
                Success = true,
                Data = result
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<LoginResponse>
            {
                Success = false,
                Message = "Erreur de connexion",
                Errors = new List<string> { ex.Message }
            });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> Logout([FromBody] LogoutRequest request)
    {
        await _authService.LogoutAsync(request.RefreshToken);
        return Ok(new ApiResponse<object> { Success = true });
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken);
        return Ok(new ApiResponse<LoginResponse>
        {
            Success = true,
            Data = result
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<User>>> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _userService.GetByIdAsync(int.Parse(userId));
        return Ok(new ApiResponse<User>
        {
            Success = true,
            Data = user
        });
    }
}
```

### Contrôleur Générique de Base

```csharp
[ApiController]
public abstract class BaseController<T, TDto> : ControllerBase where T : class
{
    protected readonly IGenericService<T> _service;

    protected BaseController(IGenericService<T> service)
    {
        _service = service;
    }

    [HttpGet]
    public virtual async Task<ActionResult<ApiResponse<PaginatedResponse<TDto>>>> GetPaged(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string searchTerm = null,
        [FromQuery] string sortBy = null,
        [FromQuery] string sortDirection = "asc")
    {
        var result = await _service.GetPagedAsync(pageNumber, pageSize, searchTerm, sortBy, sortDirection);
        return Ok(new ApiResponse<PaginatedResponse<TDto>>
        {
            Success = true,
            Data = result
        });
    }

    [HttpGet("{id}")]
    public virtual async Task<ActionResult<ApiResponse<TDto>>> GetById(int id)
    {
        var entity = await _service.GetByIdAsync(id);
        if (entity == null)
        {
            return NotFound(new ApiResponse<TDto>
            {
                Success = false,
                Message = "Élément non trouvé"
            });
        }

        return Ok(new ApiResponse<TDto>
        {
            Success = true,
            Data = _mapper.Map<TDto>(entity)
        });
    }

    [HttpPost]
    public virtual async Task<ActionResult<ApiResponse<TDto>>> Create([FromBody] TDto dto)
    {
        var entity = _mapper.Map<T>(dto);
        var created = await _service.CreateAsync(entity);
        return Ok(new ApiResponse<TDto>
        {
            Success = true,
            Data = _mapper.Map<TDto>(created)
        });
    }

    [HttpPut("{id}")]
    public virtual async Task<ActionResult<ApiResponse<TDto>>> Update(int id, [FromBody] TDto dto)
    {
        var entity = _mapper.Map<T>(dto);
        var updated = await _service.UpdateAsync(id, entity);
        return Ok(new ApiResponse<TDto>
        {
            Success = true,
            Data = _mapper.Map<TDto>(updated)
        });
    }

    [HttpDelete("{id}")]
    public virtual async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(new ApiResponse<object> { Success = true });
    }

    [HttpPatch("{id}/toggle-status")]
    public virtual async Task<ActionResult<ApiResponse<TDto>>> ToggleStatus(int id)
    {
        var updated = await _service.ToggleStatusAsync(id);
        return Ok(new ApiResponse<TDto>
        {
            Success = true,
            Data = _mapper.Map<TDto>(updated)
        });
    }
}
```

### Contrôleurs Spécialisés

```csharp
[Route("api/[controller]")]
public class ClientsController : BaseController<Client, ClientDto>
{
    public ClientsController(IClientService service) : base(service) { }

    [HttpGet("active")]
    public async Task<ActionResult<ApiResponse<List<ClientDto>>>> GetActiveClients()
    {
        var clients = await ((IClientService)_service).GetActiveClientsAsync();
        return Ok(new ApiResponse<List<ClientDto>>
        {
            Success = true,
            Data = _mapper.Map<List<ClientDto>>(clients)
        });
    }

    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<List<ClientDto>>>> SearchClients([FromQuery] string searchTerm)
    {
        var clients = await ((IClientService)_service).SearchAsync(searchTerm);
        return Ok(new ApiResponse<List<ClientDto>>
        {
            Success = true,
            Data = _mapper.Map<List<ClientDto>>(clients)
        });
    }
}
```

## Configuration JWT

### Configuration dans Program.cs

```csharp
// JWT Configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]))
        };
    });
```

### Service JWT

```csharp
public interface IJwtService
{
    string GenerateToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
}

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Email),
            new Claim(ClaimTypes.GivenName, user.Prenom),
            new Claim(ClaimTypes.Surname, user.Nom),
            new Claim(ClaimTypes.Role, user.Role.Nom)
        };

        // Ajouter les permissions comme claims
        foreach (var permission in user.Role.Permissions)
        {
            claims.Add(new Claim("permission", $"{permission.Module}.{permission.Action}"));
        }

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(24),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

## Gestion des Erreurs

### Middleware de Gestion d'Erreurs

```csharp
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Une erreur est survenue: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ApiResponse<object>
        {
            Success = false,
            Message = "Une erreur interne est survenue"
        };

        switch (exception)
        {
            case NotFoundException:
                context.Response.StatusCode = 404;
                response.Message = "Ressource non trouvée";
                break;
            case UnauthorizedAccessException:
                context.Response.StatusCode = 401;
                response.Message = "Accès non autorisé";
                break;
            case ValidationException validationEx:
                context.Response.StatusCode = 400;
                response.Message = "Erreur de validation";
                response.Errors = validationEx.Errors.Select(e => e.ErrorMessage).ToList();
                break;
            default:
                context.Response.StatusCode = 500;
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(jsonResponse);
    }
}
```

## Base de Données

### Configuration Entity Framework

```csharp
// Dans Program.cs
builder.Services.AddDbContext<TextileDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
```

### DbContext

```csharp
public class TextileDbContext : DbContext
{
    public TextileDbContext(DbContextOptions<TextileDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<Client> Clients { get; set; }
    public DbSet<Fournisseur> Fournisseurs { get; set; }
    public DbSet<Stock> Stocks { get; set; }
    public DbSet<Article> Articles { get; set; }
    public DbSet<Commande> Commandes { get; set; }
    public DbSet<LigneCommande> LignesCommande { get; set; }
    public DbSet<Tache> Taches { get; set; }
    public DbSet<Achat> Achats { get; set; }
    public DbSet<Importation> Importations { get; set; }
    public DbSet<MouvementStock> MouvementsStock { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuration des relations et contraintes
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TextileDbContext).Assembly);
    }
}
```

## Tests d'Intégration

### Test de l'API Clients

```csharp
[Test]
public async Task GetClients_ShouldReturnPaginatedList()
{
    // Arrange
    var client = new HttpClient();
    client.BaseAddress = new Uri("https://localhost:7001");

    // Act
    var response = await client.GetAsync("/api/clients?pageNumber=1&pageSize=10");

    // Assert
    response.EnsureSuccessStatusCode();
    var content = await response.Content.ReadAsStringAsync();
    var result = JsonSerializer.Deserialize<ApiResponse<PaginatedResponse<ClientDto>>>(content);

    Assert.IsTrue(result.Success);
    Assert.IsNotNull(result.Data);
    Assert.IsTrue(result.Data.Items.Count <= 10);
}
```

## Déploiement

### Configuration IIS

1. **Publier l'API ASP.NET** sur IIS
2. **Configurer HTTPS** avec certificat SSL
3. **Mettre à jour les URLs** dans `environment.prod.ts`

### Variables d'Environnement

```json
// appsettings.Production.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-server;Database=TextileDb;Trusted_Connection=true;"
  },
  "Jwt": {
    "SecretKey": "your-production-secret-key",
    "Issuer": "https://api.votre-domaine.com",
    "Audience": "https://votre-domaine.com"
  }
}
```

Ce guide fournit les bases nécessaires pour une intégration réussie entre votre frontend Angular et votre backend ASP.NET.
