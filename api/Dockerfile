FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/MeetApp.Api/MeetApp.Api.csproj", "src/MeetApp.Api/"]
COPY ["src/MeetApp.Application/MeetApp.Application.csproj", "src/MeetApp.Application/"]
COPY ["src/MeetApp.Domain/MeetApp.Domain.csproj", "src/MeetApp.Domain/"]
COPY ["src/MeetApp.Infrastructure/MeetApp.Infrastructure.csproj", "src/MeetApp.Infrastructure/"]

RUN dotnet restore "src/MeetApp.Api/MeetApp.Api.csproj"

COPY . .
WORKDIR "/src/src/MeetApp.Api"
RUN dotnet publish "MeetApp.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "MeetApp.Api.dll"]
