using Application.Users.Queries;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Application.Core;
using AutoMapper;
using FluentValidation;
using Application.Stats.Queries;
using API.Middlewares;
using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Scalar.AspNetCore;
using API.Services;
using Application.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using API.Services.ChatPressence;
using API.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers(
opts =>
{
    var policy = new AuthorizationPolicyBuilder();
    opts.Filters.Add(new AuthorizeFilter());
}
);
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddCors();
builder.Services.AddSignalR();
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddMediatR(opts =>
{
    opts.RegisterServicesFromAssemblyContaining<GetUsersList>();
    opts.AddOpenBehavior(typeof(ValidationBehaviour<,>));
});
builder.Services.AddAutoMapper(x => x.AddMaps(typeof(MappingProfiles).Assembly));
builder.Services.AddValidatorsFromAssemblyContaining<GetDashboardStats.Validator>();
builder.Services.AddTransient<ExceptionMiddleware>();
builder.Services.AddIdentity<User, IdentityRole<Guid>>(opts =>
{
    opts.Password.RequireDigit = false;
    opts.Password.RequiredLength = 6;
    opts.Password.RequiredUniqueChars = 0;
    opts.Password.RequireNonAlphanumeric = false;
    opts.Password.RequireUppercase = false;
    opts.User.RequireUniqueEmail = true;
}
).AddRoles<IdentityRole<Guid>>()
.AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddAuthentication(options =>
{
    // Set the default scheme to JWT
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => // 2. Configure the JWT handler
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            builder.Configuration["Jwt:SecretKey"]
            ?? throw new NullReferenceException("Jwt:SecretKey is not found")
        )),

        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],

        // 3. We are not validating the audience
        ValidateAudience = false
    };

    // This tells the handler how to find the token when
    // SignalR connects via WebSocket
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Get the token from the query string
            var accessToken = context.Request.Query["access_token"];

            // If the request is for our hub...
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/api/hubs/chat"))
            {
                // Read the token from the query string
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});
builder.Services.AddSingleton<PressenceService>();


var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// app.UseHttpsRedirection();

app.UseCors(opts => opts
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()
    .WithOrigins("https://hq0fch8z-3000.euw.devtunnels.ms"));

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("api/hubs/chat");

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
    var userManager = services.GetRequiredService<UserManager<User>>();
    await SeedDb.Migrator.Seed(userManager, context);
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An Error occured during database migration.");
}


try
{
    var mapper = services.GetRequiredService<IMapper>();
    // this will throw an exception if any mappings are invalid.
    mapper.ConfigurationProvider.AssertConfigurationIsValid();
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError("An Error occured while Asserting Mappings. Error: {Message}", ex.Message);
}


app.Run();
