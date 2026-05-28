$host.ui.RawUI.WindowTitle = "Forsight Spring Boot Backend Server"

# Load environment variables from .env if present
if (Test-Path ".env") {
    Write-Host "Loading environment variables from .env file..." -ForegroundColor Cyan
    Get-Content ".env" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and !$line.StartsWith("#") -and $line.Contains("=")) {
            $key, $value = $line.Split("=", 2)
            $key = $key.Trim()
            $value = $value.Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, [System.EnvironmentVariableTarget]::Process)
        }
    }
} else {
    Write-Host "Warning: .env file not found." -ForegroundColor Yellow
}

.\apache-maven-3.9.6\bin\mvn spring-boot:run
