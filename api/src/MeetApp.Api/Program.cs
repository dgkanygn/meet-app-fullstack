using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using MeetApp.Api.Hubs;
using MeetApp.Api.Middleware;
using MeetApp.Api.Realtime;
using MeetApp.Application;
using MeetApp.Application.Interfaces;
using MeetApp.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Serilog
builder.Host.UseSerilog((ctx, lc) => lc.ReadFrom.Configuration(ctx.Configuration));

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Enum'lar istemciye sayi yerine "Accepted" gibi string olarak gider ve
        // string olarak da geri okunur.
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Application & Infrastructure
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// NotificationPublisher — Api katmanında, IHubContext bağımlılığından dolayı burada kayıtlı
builder.Services.AddScoped<INotificationPublisher, NotificationPublisher>();
builder.Services.AddScoped<IMeetingRealtimeNotifier, MeetingRealtimeNotifier>();
builder.Services.AddScoped<IMessageRealtimeNotifier, MessageRealtimeNotifier>();
builder.Services.AddSingleton<IMeetingRoomTracker, MeetingRoomTracker>();

// SignalR — hub payload'lari da REST ile ayni JSON sekline sahip olsun
builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
    {
        options.PayloadSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// JWT Auth
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret is required. Set it via user-secrets.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        // SignalR için JWT query string desteği
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    (path.StartsWithSegments("/hubs/notifications") || path.StartsWithSegments("/hubs/meeting") || path.StartsWithSegments("/hubs/chat")))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MeetApp API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            []
        }
    });
});

var app = builder.Build();

// Pipeline
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// SignalR Hubs
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHub<MeetingHub>("/hubs/meeting");
app.MapHub<ChatHub>("/hubs/chat");

// Empty Room Shutdown Callback
var roomTracker = app.Services.GetRequiredService<IMeetingRoomTracker>();
roomTracker.SetEmptyRoomShutdownCallback(async meetingId =>
{
    using var scope = app.Services.CreateScope();
    var meetingService = scope.ServiceProvider.GetRequiredService<IMeetingService>();
    await meetingService.EndMeetingAsync(meetingId);
});

// Seed Data
try
{
    await MeetApp.Infrastructure.Persistence.DataSeeder.SeedAsync(app.Services);
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred while seeding the database.");
}

app.Run();
