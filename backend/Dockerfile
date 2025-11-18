# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers (better caching)
COPY ["Studyland.sln", "./"]

COPY ["API/API.csproj", "API/"]
COPY ["Application/Application.csproj", "Application/"]
COPY ["Domain/Domain.csproj", "Domain/"]
COPY ["Dtos/Dtos.csproj", "Dtos/"]
COPY ["Persistence/Persistence.csproj", "Persistence/"]
COPY ["SeedDb/SeedDb.csproj", "SeedDb/"]

RUN dotnet restore 

# Copy everything else and build
COPY . .
WORKDIR "/src/API"
RUN dotnet publish "API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080 
# Force .NET to listen on HTTP port 8080
ENV ASPNETCORE_URLS=http://+:8080
# copy for the old db so the migrator can work
COPY ["SeedDb/nerds.db", "."]
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "API.dll"]